package com.weather;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

/**
 * Main application launcher for the Java Weather Dashboard.
 */
public class Main {
    private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid port number specified. Using default: " + DEFAULT_PORT);
            }
        }

        // Determine public static files directory
        Path publicDir = Paths.get("public").toAbsolutePath();
        if (!publicDir.toFile().exists()) {
            // Check relative to current working dir or src parent
            publicDir = Paths.get("weather-dashboard-java", "public").toAbsolutePath();
        }

        WeatherService weatherService = new WeatherService();
        FavoritesService favoritesService = new FavoritesService();
        WeatherServer server = new WeatherServer(port, weatherService, favoritesService, publicDir);

        try {
            server.start();

            printBanner(port);

            // Try to open default browser
            openBrowser("http://localhost:" + port);

            // Keep main thread alive and handle shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[Weather Dashboard] Shutting down server gracefully...");
                server.stop();
            }));

            // Keep server running
            Thread.currentThread().join();

        } catch (IOException e) {
            System.err.println("ERROR: Failed to start Weather Dashboard server: " + e.getMessage());
            e.printStackTrace();
        } catch (InterruptedException e) {
            System.out.println("Server interrupted. Exiting.");
            Thread.currentThread().interrupt();
        }
    }

    private static void printBanner(int port) {
        System.out.println("""
            =============================================================
             __        __         _   _               ____             _     
             \\ \\      / /__  __ _| |_| |__   ___ _ __ |  _ \\  __ _ ___| |__  
              \\ \\ /\\ / / _ \\/ _` | __| '_ \\ / _ \\ '__|| | | |/ _` / __| '_ \\ 
               \\ V  V /  __/ (_| | |_| | | |  __/ |   | |_| | (_| \\__ \\ | | |
                \\_/\\_/ \\___|\\__,_|\\__|_| |_|\\___|_|   |____/ \\__,_|___/_| |_|
            =============================================================
             [+] Java Weather Dashboard is RUNNING!
             [+] Local URL:   http://localhost:%d
             [+] API Health:  http://localhost:%d/api/health
             [+] Real-time:   Open-Meteo & Air Quality Engine Active
             [+] Press Ctrl+C to stop the server
            =============================================================
            """.formatted(port, port));
    }

    private static void openBrowser(String url) {
        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            new Thread(() -> {
                try {
                    Thread.sleep(800);
                    Desktop.getDesktop().browse(URI.create(url));
                } catch (Exception e) {
                    // Ignore headless / non-interactive browser launch failures
                }
            }).start();
        }
    }
}
