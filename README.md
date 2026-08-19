AeroCast — Modern Java Weather Dashboard
An ultra-modern, high-performance Weather Dashboard application powered by a Java 21 backend and a glassmorphism web interface.

AeroCast Weather Dashboard

🌟 Key Features
Java 21 Embedded Server: Uses Java SE com.sun.net.httpserver.HttpServer with Virtual Threads and java.net.http.HttpClient. Zero third-party Maven/Gradle dependencies needed!
Real-Time Weather Metrics: Current temperature, apparent "Feels like", humidity, wind speed & compass direction, UV index with color-coded safety level, atmospheric pressure, visibility, dew point, and cloud cover.
Dynamic Atmospheric Particle Effects: Real-time canvas particle engine simulating rainfall streaks with splashes, drifting snowflakes, floating misty clouds, golden sunlight rays, starfield night sky, and thunderstorm lightning flashes.
Global City Search with Instant Autocomplete: Debounced search for any city, town, or region worldwide with country flags and coordinates.
HTML5 Geolocation: 1-click "Locate Me" button to detect device GPS coordinates and display local weather.
24-Hour Hourly Forecast: Interactive scrollable hourly carousel and smooth interactive Bezier curve temperature chart.
7-Day Extended Forecast: Daily high/low visual temperature range bars, weather condition icons, and precipitation probability badges.
Air Quality Index (AQI): US AQI calculation and micro-pollutant metrics (
P
M
2.5
, 
P
M
10
, 
N
O
2
, 
O
3
, 
C
O
, 
S
O
2
).
Solar Arc & Sun Tracker: Real-time sun trajectory arc displaying exact sunrise, sunset, daylight remaining countdown, and golden hour.
Interactive Weather Map: Embedded Leaflet map centered on the active location.
Instant Unit Switching: Seamless toggle between Metric (°C, km/h, mm, hPa) and Imperial (°F, mph, in, inHg).
Pinned Favorite Cities: Save and bookmark favorite locations with quick-access chips and local persistence (favorites.json).
Smart Weather Advisories: Contextual safety alerts and lifestyle tips (e.g., UV protection, umbrella reminders, outdoor workout ratings).
🚀 Getting Started
Prerequisites
Java 21 SE or higher (java and javac in PATH).
Running on Windows
Double-click run.bat or run:

.\run.ps1
Or run manually with Java commands:

# 1. Compile Java files
javac -d bin src/com/weather/*.java

# 2. Run the application
java -cp bin com.weather.Main 8080
Once started, open your browser and navigate to:

http://localhost:8080
📁 Project Structure
weather-dashboard-java/
├── bin/                       # Compiled Java bytecode
├── public/                    # Static Frontend Assets
│   ├── css/
│   │   └── style.css          # Glassmorphism Design System & Weather Themes
│   ├── js/
│   │   ├── app.js             # Client UI Controller & Open-Meteo Integration
│   │   └── weather-effects.js # Canvas Particle & Atmospheric Engine
│   └── index.html             # Semantic Dashboard Layout
├── src/
│   └── com/
│       └── weather/
│           ├── Main.java             # Entry point & Browser launcher
│           ├── WeatherServer.java    # Embedded HTTP server & REST endpoints
│           ├── WeatherService.java   # Open-Meteo & Air Quality API Client + Caching
│           └── FavoritesService.java # Bookmarked locations manager
├── favorites.json             # Persistent favorites storage
├── run.bat                    # 1-click Windows batch launcher
├── run.ps1                    # PowerShell launcher
└── README.md                  # Documentation
📡 REST API Endpoints
Endpoint	Method	Description
GET /	GET	Serves the dashboard web app
GET /api/health	GET	Health check & cache statistics
GET /api/search?q={query}	GET	Geocoding city search
GET /api/weather?lat={lat}&lon={lon}&tz={tz}	GET	Full weather & air quality payload
GET /api/favorites	GET	Retrieve list of saved favorite cities
POST /api/favorites	POST	Update list of saved favorite cities
📄 License
MIT License. Free to use and customize.
