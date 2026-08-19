# 🌦️ AeroCast — Modern Java Weather Dashboard

[![Java Version](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External-success?style=for-the-badge)](#-technology-stack)
[![API](https://img.shields.io/badge/Data%20Source-Open--Meteo-00B4D8?style=for-the-badge)](https://open-meteo.com/)

An ultra-modern, lightning-fast **Weather Dashboard & Forecasting System** powered by a **Java 21 backend** and a glassmorphism web interface with real-time dynamic atmospheric canvas particle effects.

---

## 🌟 Key Features

- ⚡ **Java 21 Virtual Threads**: High-throughput embedded HTTP server (`com.sun.net.httpserver.HttpServer`) running on Project Loom virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`). Zero Maven/Gradle bloat or external jar dependencies!
- 🌧️ **Dynamic Particle Engine**: Realistic real-time 2D canvas effects tailored to current weather conditions — rainfall with splash physics, floating misty clouds, drifting snowflakes, golden sunlight beams, twinkling night stars, and thunderstorm lightning flashes.
- 🌡️ **Comprehensive Weather Metrics**: Current temperature, apparent "Feels like", humidity, wind speed & compass direction, UV index with color-coded safety badges, atmospheric pressure, visibility, dew point, and cloud cover.
- 🕒 **24-Hour Hourly Forecast**: Interactive scrollable carousel with condition icons, precipitation probabilities, and smooth interactive Bezier curve temperature charts.
- 📅 **7-Day Extended Forecast**: Daily high/low temperature range bars, weather condition icons, and rain probability indicators.
- 🍃 **Air Quality Index (AQI)**: Detailed US AQI assessment with color-coded health warning ratings and pollutant metrics ($PM_{2.5}$, $PM_{10}$, $NO_2$, $O_3$, $CO$, $SO_2$).
- ☀️ **Solar Arc & Sun Tracker**: Real-time celestial trajectory displaying sunrise, sunset, daylight remaining countdown, and golden hour markers.
- 🗺️ **Interactive Radar & Map**: Embedded Leaflet map centered dynamically on the selected location with interactive layer controls.
- 🔍 **Instant City Search & Autocomplete**: Debounced search for any city, town, or region worldwide with country flags and coordinates, plus built-in offline fallback for major global cities.
- 📍 **HTML5 Geolocation**: 1-click GPS location detection to display local weather instantly.
- 🔄 **Seamless Unit Conversion**: Instant toggle between Metric (°C, km/h, mm, hPa) and Imperial (°F, mph, in, inHg) units with state retention.
- ⭐ **Pinned Favorites**: Bookmark favorite locations with quick-access chips and persistent local storage (`favorites.json`).
- 💡 **Smart Weather Advisories**: Context-aware lifestyle alerts (UV protection alerts, umbrella reminders, outdoor activity recommendations).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Backend** | Java 21 SE, `com.sun.net.httpserver.HttpServer`, `java.net.http.HttpClient`, Virtual Threads (Project Loom) |
| **Frontend** | HTML5 Semantic Elements, Modern CSS3 (Glassmorphism, CSS Custom Properties, Flexbox & Grid), Vanilla JavaScript (ES6+) |
| **Visual Effects** | HTML5 Canvas 2D Particle Engine (`weather-effects.js`) |
| **Mapping** | Leaflet.js with OpenStreetMap Tiles |
| **Data Providers** | [Open-Meteo Weather API](https://open-meteo.com/), Open-Meteo Geocoding API, Open-Meteo Air Quality API |
| **Dependencies** | **0 Third-Party Java Libraries** (pure Java standard library) |

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK) 21 or higher** installed.
- Ensure `java` and `javac` are available in your system's `PATH`.

```bash
# Verify your Java version
java -version
```

---

### Running the Application

#### Option 1: Quick Launch (Windows)
Double-click [`run.bat`](file:///c:/Users/arjun/Downloads/weather-dashboard-java/run.bat) or run via PowerShell:
```powershell
.\run.ps1
```

#### Option 2: Command Line (Cross-Platform)

1. **Compile the Java sources:**
   ```bash
   javac -encoding UTF-8 -d bin src/com/weather/*.java
   ```

2. **Run the server:**
   ```bash
   java -cp bin com.weather.Main 8080
   ```

3. **Access the Dashboard:**
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

> [!TIP]
> You can pass a custom port as an argument:
> `java -cp bin com.weather.Main 9090`

---

## 📁 Project Structure

```
weather-dashboard-java/
├── bin/                          # Compiled Java bytecode (.class files)
├── public/                       # Frontend Static Web Application
│   ├── css/
│   │   └── style.css             # Glassmorphism UI tokens, layout & responsive themes
│   ├── js/
│   │   ├── app.js                # Core dashboard logic, state management & UI rendering
│   │   └── weather-effects.js    # Canvas particle engine (rain, snow, clouds, sunbeams)
│   └── index.html                # Main semantic dashboard layout
├── src/
│   └── com/
│       └── weather/
│           ├── Main.java             # Server bootstrapper & auto-browser launcher
│           ├── WeatherServer.java    # Embedded HTTP server & REST endpoint routes
│           ├── WeatherService.java   # Open-Meteo API integration & in-memory cache
│           └── FavoritesService.java # Bookmark manager with JSON persistence
├── favorites.json                # Saved favorite locations
├── run.bat                       # Windows Batch script launcher
├── run.ps1                       # Windows PowerShell launcher
├── test_endpoints.ps1            # Automated REST API endpoint verification script
└── README.md                     # Project documentation
```

---

## 📡 REST API Documentation

The backend exposes lightweight REST endpoints consumed by the frontend client:

### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "UP",
  "cacheSize": 4,
  "javaVersion": "21.0.2"
}
```

---

### 2. City Geocoding Search
```http
GET /api/search?q={query}
```
**Parameters:**
- `q` (required): Name or prefix of city/location (e.g. `London`, `Tokyo`, `New York`).

**Sample Response:**
```json
[
  {
    "id": 2643743,
    "name": "London",
    "country": "United Kingdom",
    "admin1": "England",
    "country_code": "GB",
    "latitude": 51.50853,
    "longitude": -0.12574,
    "timezone": "Europe/London"
  }
]
```

---

### 3. Weather & Air Quality Data
```http
GET /api/weather?lat={latitude}&lon={longitude}&tz={timezone}
```
**Parameters:**
- `lat` (required): Latitude coordinate (e.g. `51.5085`).
- `lon` (required): Longitude coordinate (e.g. `-0.1257`).
- `tz` (optional): IANA timezone string (default: `auto`).

**Sample Response Structure:**
```json
{
  "current": { ... },
  "hourly": { ... },
  "daily": { ... },
  "air_quality": { ... }
}
```

---

### 4. Favorites Management
```http
GET  /api/favorites
POST /api/favorites
```
- **`GET`**: Returns the list of saved favorite cities.
- **`POST`**: Accepts a JSON array payload to update saved favorite cities.

---

## 🧪 Testing & Verification

An automated PowerShell verification script is included to test all endpoints:

```powershell
.\test_endpoints.ps1
```

---

## ⚙️ Architecture & Design Highlights

- **Zero-Dependency Architecture**: Leverages standard Java libraries for minimal build overhead, fast startup times (< 1 second), and portability across environments.
- **In-Memory Caching with TTL**: Weather data is cached in memory with a 5-minute Time-To-Live (TTL) to minimize API latency and respect rate limits.
- **Resilient Fallback**: Includes offline fallback dictionaries for major world cities in case external geocoding services are temporarily unreachable.
- **Modern Responsive UI**: Built with pure CSS Glassmorphism effects, CSS grid and flexbox, optimized for desktop and mobile viewports.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
