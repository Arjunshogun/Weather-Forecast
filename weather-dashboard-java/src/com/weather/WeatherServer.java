package com.weather;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Embedded HTTP server hosting the Weather Dashboard static frontend
 * and providing REST API endpoints for weather data, geocoding, and user favorites.
 */
public class WeatherServer {
    private static final Logger LOGGER = Logger.getLogger(WeatherServer.class.getName());
    private final int port;
    private final WeatherService weatherService;
    private final FavoritesService favoritesService;
    private final Path publicDir;
    private HttpServer server;

    public WeatherServer(int port, WeatherService weatherService, FavoritesService favoritesService, Path publicDir) {
        this.port = port;
        this.weatherService = weatherService;
        this.favoritesService = favoritesService;
        this.publicDir = publicDir;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // API Contexts
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/search", new SearchHandler());
        server.createContext("/api/weather", new WeatherHandler());
        server.createContext("/api/favorites", new FavoritesHandler());

        // Static Files Context (Root)
        server.createContext("/", new StaticFileHandler());

        server.start();
        LOGGER.info("WeatherServer started on http://localhost:" + port);
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
            LOGGER.info("WeatherServer stopped.");
        }
    }

    public int getPort() {
        return port;
    }

    // ==================== HTTP HANDLERS ====================

    private class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }
            String response = String.format(
                    "{\"status\":\"UP\",\"cacheSize\":%d,\"javaVersion\":\"%s\"}",
                    weatherService.getCacheSize(),
                    System.getProperty("java.version")
            );
            sendJsonResponse(exchange, 200, response);
        }
    }

    private class SearchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            Map<String, String> params = parseQueryParams(exchange.getRequestURI());
            String query = params.get("q");

            if (query == null || query.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Missing 'q' query parameter\"}");
                return;
            }

            try {
                String results = weatherService.searchLocations(query);
                sendJsonResponse(exchange, 200, results);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error searching locations", e);
                sendJsonResponse(exchange, 500, "{\"error\":\"Failed to search locations: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class WeatherHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            Map<String, String> params = parseQueryParams(exchange.getRequestURI());
            String latStr = params.get("lat");
            String lonStr = params.get("lon");
            String tz = params.get("tz");

            if (latStr == null || lonStr == null) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Missing 'lat' and/or 'lon' query parameters\"}");
                return;
            }

            try {
                double lat = Double.parseDouble(latStr);
                double lon = Double.parseDouble(lonStr);
                String data = weatherService.getWeatherData(lat, lon, tz);
                sendJsonResponse(exchange, 200, data);
            } catch (NumberFormatException e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Invalid numeric coordinates\"}");
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error fetching weather data", e);
                sendJsonResponse(exchange, 500, "{\"error\":\"Failed to fetch weather: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class FavoritesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            String method = exchange.getRequestMethod();
            if ("GET".equalsIgnoreCase(method)) {
                String json = favoritesService.getFavoritesJson();
                sendJsonResponse(exchange, 200, json);
            } else if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                boolean success = favoritesService.saveFavoritesJson(body);
                if (success) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Favorites updated\"}");
                } else {
                    sendJsonResponse(exchange, 400, "{\"error\":\"Invalid favorites data\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
            }
        }
    }

    private class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr == null || pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }

            // Prevent path traversal
            if (pathStr.contains("..")) {
                sendTextResponse(exchange, 403, "Access Denied");
                return;
            }

            // Resolve file relative to public directory
            Path filePath = publicDir.resolve(pathStr.substring(1)).normalize();
            if (!filePath.startsWith(publicDir) || !Files.exists(filePath) || Files.isDirectory(filePath)) {
                // If not found, try fallback to index.html if html is requested
                Path indexHtml = publicDir.resolve("index.html");
                if (Files.exists(indexHtml) && !pathStr.startsWith("/api/")) {
                    serveFile(exchange, indexHtml, "text/html; charset=utf-8");
                    return;
                }
                sendTextResponse(exchange, 404, "404 Not Found: " + pathStr);
                return;
            }

            String mimeType = getMimeType(filePath.getFileName().toString());
            serveFile(exchange, filePath, mimeType);
        }
    }

    // ==================== HELPER METHODS ====================

    private void serveFile(HttpExchange exchange, Path file, String mimeType) throws IOException {
        byte[] bytes = Files.readAllBytes(file);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", mimeType);
        headers.set("Cache-Control", "no-cache");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "application/json; charset=utf-8");
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendTextResponse(HttpExchange exchange, int statusCode, String text) throws IOException {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendCors(HttpExchange exchange) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(204, -1);
    }

    private Map<String, String> parseQueryParams(URI uri) {
        Map<String, String> params = new HashMap<>();
        String query = uri.getRawQuery();
        if (query != null && !query.isEmpty()) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0 && idx < pair.length() - 1) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    params.put(key, value);
                } else if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    params.put(key, "");
                }
            }
        }
        return params;
    }

    private String getMimeType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
        if (lower.endsWith(".css")) return "text/css; charset=utf-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (lower.endsWith(".json")) return "application/json; charset=utf-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        return "application/octet-stream";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
