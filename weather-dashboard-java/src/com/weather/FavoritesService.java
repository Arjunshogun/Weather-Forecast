package com.weather;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

/**
 * Service to manage bookmarked favorite cities with local persistence.
 */
public class FavoritesService {
    private static final Logger LOGGER = Logger.getLogger(FavoritesService.class.getName());
    private static final Path FAVORITES_FILE = Paths.get("favorites.json");

    private static final String DEFAULT_FAVORITES = """
        [
          {"name": "London", "country": "United Kingdom", "admin1": "England", "latitude": 51.50853, "longitude": -0.12574, "timezone": "Europe/London"},
          {"name": "New York", "country": "United States", "admin1": "New York", "latitude": 40.71427, "longitude": -74.00597, "timezone": "America/New_York"},
          {"name": "Tokyo", "country": "Japan", "admin1": "Tokyo", "latitude": 35.6895, "longitude": 139.6917, "timezone": "Asia/Tokyo"},
          {"name": "Paris", "country": "France", "admin1": "Île-de-France", "latitude": 48.85341, "longitude": 2.3488, "timezone": "Europe/Paris"},
          {"name": "Sydney", "country": "Australia", "admin1": "New South Wales", "latitude": -33.86785, "longitude": 151.20732, "timezone": "Australia/Sydney"}
        ]
        """;

    public FavoritesService() {
        initStorage();
    }

    private void initStorage() {
        if (!Files.exists(FAVORITES_FILE)) {
            try {
                Files.writeString(FAVORITES_FILE, DEFAULT_FAVORITES.trim(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                LOGGER.warning("Could not create initial favorites.json: " + e.getMessage());
            }
        }
    }

    public synchronized String getFavoritesJson() {
        try {
            if (Files.exists(FAVORITES_FILE)) {
                return Files.readString(FAVORITES_FILE, StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            LOGGER.warning("Failed to read favorites.json: " + e.getMessage());
        }
        return DEFAULT_FAVORITES.trim();
    }

    public synchronized boolean saveFavoritesJson(String jsonContent) {
        if (jsonContent == null || jsonContent.trim().isEmpty()) {
            return false;
        }
        try {
            Files.writeString(FAVORITES_FILE, jsonContent.trim(), StandardCharsets.UTF_8);
            return true;
        } catch (IOException e) {
            LOGGER.warning("Failed to save favorites.json: " + e.getMessage());
            return false;
        }
    }
}
