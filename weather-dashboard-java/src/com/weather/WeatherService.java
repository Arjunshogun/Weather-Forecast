package com.weather;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * Service to interact with Open-Meteo Weather, Geocoding, and Air Quality APIs.
 * Includes in-memory caching with TTL and fallback offline dictionary.
 */
public class WeatherService {
    private static final Logger LOGGER = Logger.getLogger(WeatherService.class.getName());
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    private final HttpClient httpClient;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String data, Instant timestamp) {
        public boolean isExpired() {
            return Instant.now().isAfter(timestamp.plus(CACHE_TTL));
        }
    }

    // Built-in city dictionary for offline and instant fallback
    private static final List<CityEntry> BUILTIN_CITIES = List.of(
            new CityEntry("London", "United Kingdom", "England", "GB", 51.50853, -0.12574, "Europe/London"),
            new CityEntry("New York", "United States", "New York", "US", 40.71427, -74.00597, "America/New_York"),
            new CityEntry("Tokyo", "Japan", "Tokyo", "JP", 35.6895, 139.6917, "Asia/Tokyo"),
            new CityEntry("Paris", "France", "Île-de-France", "FR", 48.85341, 2.3488, "Europe/Paris"),
            new CityEntry("Sydney", "Australia", "New South Wales", "AU", -33.86785, 151.20732, "Australia/Sydney"),
            new CityEntry("Berlin", "Germany", "Berlin", "DE", 52.52437, 13.41053, "Europe/Berlin"),
            new CityEntry("Rome", "Italy", "Lazio", "IT", 41.89193, 12.51133, "Europe/Rome"),
            new CityEntry("Madrid", "Spain", "Madrid", "ES", 40.4165, -3.70256, "Europe/Madrid"),
            new CityEntry("Singapore", "Singapore", "", "SG", 1.28967, 103.85007, "Asia/Singapore"),
            new CityEntry("Dubai", "United Arab Emirates", "Dubai", "AE", 25.07725, 55.30927, "Asia/Dubai"),
            new CityEntry("Toronto", "Canada", "Ontario", "CA", 43.70011, -79.4163, "America/Toronto"),
            new CityEntry("San Francisco", "United States", "California", "US", 37.77493, -122.41942, "America/Los_Angeles"),
            new CityEntry("Los Angeles", "United States", "California", "US", 34.05223, -118.24368, "America/Los_Angeles"),
            new CityEntry("Chicago", "United States", "Illinois", "US", 41.85003, -87.65005, "America/Chicago"),
            new CityEntry("Mumbai", "India", "Maharashtra", "IN", 19.07283, 72.88261, "Asia/Kolkata"),
            new CityEntry("Delhi", "India", "Delhi", "IN", 28.65195, 77.23149, "Asia/Kolkata"),
            new CityEntry("Bengaluru", "India", "Karnataka", "IN", 12.97194, 77.59369, "Asia/Kolkata"),
            new CityEntry("Seoul", "South Korea", "Seoul", "KR", 37.566, 126.9784, "Asia/Seoul"),
            new CityEntry("Beijing", "China", "Beijing", "CN", 39.9075, 116.39723, "Asia/Shanghai"),
            new CityEntry("Shanghai", "China", "Shanghai", "CN", 31.22222, 121.45806, "Asia/Shanghai"),
            new CityEntry("Hong Kong", "Hong Kong", "", "HK", 22.27832, 114.17469, "Asia/Hong_Kong"),
            new CityEntry("Cairo", "Egypt", "Cairo", "EG", 30.06263, 31.24967, "Africa/Cairo"),
            new CityEntry("Rio de Janeiro", "Brazil", "Rio de Janeiro", "BR", -22.90642, -43.18223, "America/Sao_Paulo"),
            new CityEntry("Buenos Aires", "Argentina", "Buenos Aires", "AR", -34.61315, -58.37723, "America/Argentina/Buenos_Aires"),
            new CityEntry("Zurich", "Switzerland", "Zurich", "CH", 47.36667, 8.55, "Europe/Zurich"),
            new CityEntry("Amsterdam", "Netherlands", "North Holland", "NL", 52.37403, 4.88969, "Europe/Amsterdam"),
            new CityEntry("Stockholm", "Sweden", "Stockholm", "SE", 59.32938, 18.06871, "Europe/Stockholm"),
            new CityEntry("Oslo", "Norway", "Oslo", "NO", 59.91273, 10.74609, "Europe/Oslo"),
            new CityEntry("Bangkok", "Thailand", "Bangkok", "TH", 13.75398, 100.50144, "Asia/Bangkok"),
            new CityEntry("Istanbul", "Turkey", "Istanbul", "TR", 41.01384, 28.94966, "Europe/Istanbul")
    );

    private record CityEntry(String name, String country, String admin1, String countryCode, double lat, double lon, String timezone) {}

    public WeatherService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(8))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * Searches for locations matching the query using Open-Meteo Geocoding API with fallback.
     */
    public String searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return "{\"results\":[]}";
        }

        String q = query.trim();
        String encodedQuery = URLEncoder.encode(q, StandardCharsets.UTF_8);
        String cacheKey = "geo:" + encodedQuery.toLowerCase();

        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.data();
        }

        // Try Online API first
        try {
            String url = String.format("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=8&language=en&format=json", encodedQuery);
            String responseBody = fetchFromUrl(url);
            if (responseBody != null && responseBody.contains("\"results\"")) {
                cache.put(cacheKey, new CacheEntry(responseBody, Instant.now()));
                return responseBody;
            }
        } catch (Exception e) {
            LOGGER.warning("Online geocoding search failed: " + e.getMessage() + ". Using fallback dictionary.");
        }

        // Fallback to local dictionary search
        String fallbackJson = searchLocalDictionary(q);
        cache.put(cacheKey, new CacheEntry(fallbackJson, Instant.now()));
        return fallbackJson;
    }

    private String searchLocalDictionary(String query) {
        String lower = query.toLowerCase();
        List<String> matches = new ArrayList<>();

        for (CityEntry c : BUILTIN_CITIES) {
            if (c.name().toLowerCase().contains(lower) || c.country().toLowerCase().contains(lower) || c.admin1().toLowerCase().contains(lower)) {
                matches.add(String.format(
                        "{\"id\":%d,\"name\":\"%s\",\"country\":\"%s\",\"admin1\":\"%s\",\"country_code\":\"%s\",\"latitude\":%.5f,\"longitude\":%.5f,\"timezone\":\"%s\"}",
                        Math.abs((c.name() + c.country()).hashCode()),
                        escapeJson(c.name()),
                        escapeJson(c.country()),
                        escapeJson(c.admin1()),
                        escapeJson(c.countryCode()),
                        c.lat(),
                        c.lon(),
                        escapeJson(c.timezone())
                ));
            }
        }

        return "{\"results\":[" + String.join(",", matches) + "]}";
    }

    /**
     * Fetches comprehensive weather data for the given coordinates.
     */
    public String getWeatherData(double latitude, double longitude, String timezone) throws IOException, InterruptedException {
        String tz = (timezone == null || timezone.trim().isEmpty()) ? "auto" : URLEncoder.encode(timezone.trim(), StandardCharsets.UTF_8);
        String cacheKey = String.format("weather:%.4f:%.4f:%s", latitude, longitude, tz);

        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.data();
        }

        String weatherUrl = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f" +
                "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index" +
                "&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day" +
                "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant" +
                "&timezone=%s",
                latitude, longitude, tz
        );

        String weatherJson = fetchFromUrl(weatherUrl);

        // Also fetch Air Quality data
        String airQualityJson = "{}";
        try {
            String airUrl = String.format(
                    "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=%.6f&longitude=%.6f" +
                    "&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone" +
                    "&timezone=%s",
                    latitude, longitude, tz
            );
            airQualityJson = fetchFromUrl(airUrl);
        } catch (Exception e) {
            LOGGER.warning("Could not fetch air quality data: " + e.getMessage());
        }

        // Combine into unified response
        String combined = combineWeatherAndAirQuality(weatherJson, airQualityJson);
        cache.put(cacheKey, new CacheEntry(combined, Instant.now()));
        return combined;
    }

    private String combineWeatherAndAirQuality(String weatherJson, String airQualityJson) {
        weatherJson = weatherJson.trim();
        airQualityJson = airQualityJson.trim();

        if (weatherJson.endsWith("}")) {
            String trimmedWeather = weatherJson.substring(0, weatherJson.length() - 1);
            return trimmedWeather + ",\"air_quality\":" + (airQualityJson.isEmpty() ? "{}" : airQualityJson) + "}";
        }
        return weatherJson;
    }

    /**
     * Primary HTTP fetcher with HttpsURLConnection fallback.
     */
    private String fetchFromUrl(String urlStr) throws IOException, InterruptedException {
        // Try HttpClient first
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlStr))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(8))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) JavaWeatherDashboard/1.0")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 200) {
                return response.body();
            }
        } catch (Exception e) {
            LOGGER.warning("HttpClient request failed for " + urlStr + " (" + e.getMessage() + "). Trying HttpsURLConnection fallback...");
        }

        // Fallback to classic HttpsURLConnection
        URL url = URI.create(urlStr).toURL();
        HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) JavaWeatherDashboard/1.0");
        conn.setRequestProperty("Accept", "application/json");
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(8000);

        int status = conn.getResponseCode();
        if (status != 200) {
            throw new IOException("HttpsURLConnection failed with HTTP status: " + status);
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } finally {
            conn.disconnect();
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    public int getCacheSize() {
        return cache.size();
    }

    public void clearCache() {
        cache.clear();
    }
}
