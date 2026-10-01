import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


# Regional fallback coordinates and baseline climate profiles for Indian agricultural hubs
KNOWN_LOCATIONS = {
    "vellore": {"lat": 12.9165, "lon": 79.1325, "temp": 29.5, "humidity": 78, "wind": 9.2, "condition": "Partly Cloudy"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "temp": 28.0, "humidity": 75, "wind": 8.5, "condition": "Humid & Overcast"},
    "guntur": {"lat": 16.3067, "lon": 80.4365, "temp": 31.0, "humidity": 82, "wind": 11.0, "condition": "Warm with High Humidity"},
    "warangal": {"lat": 17.9689, "lon": 79.5941, "temp": 30.0, "humidity": 72, "wind": 10.0, "condition": "Partly Cloudy"},
    "nashik": {"lat": 19.9975, "lon": 73.7898, "temp": 26.5, "humidity": 68, "wind": 7.5, "condition": "Clear Sky"},
    "nagpur": {"lat": 21.1458, "lon": 79.0882, "temp": 32.0, "humidity": 65, "wind": 8.0, "condition": "Sunny & Dry"},
    "rajkot": {"lat": 22.3039, "lon": 70.8022, "temp": 30.5, "humidity": 70, "wind": 13.0, "condition": "Breezy & Warm"},
    "cuttack": {"lat": 20.4625, "lon": 85.8828, "temp": 29.0, "humidity": 85, "wind": 10.5, "condition": "Overcast with Light Drizzle"},
    "alappuzha": {"lat": 9.4981, "lon": 76.3388, "temp": 28.0, "humidity": 88, "wind": 12.0, "condition": "Tropical Showers"}
}


class WeatherTool:
    """
    Agro-meteorological tool combining live Open-Meteo weather API with
    offline agricultural climatic simulations and risk heuristics.
    """

    async def get_weather(self, location: str) -> Dict[str, Any]:
        """
        Retrieves real-time weather and calculates agro-climatic risks.
        """
        loc_clean = location.strip()
        coords = await self._geocode_location(loc_clean)

        weather_data = None
        if coords:
            weather_data = await self._fetch_open_meteo(coords["lat"], coords["lon"])

        if not weather_data:
            weather_data = self._generate_fallback_weather(loc_clean)

        # Compute agro-climatic disease risks
        agro_indices = self._compute_agro_weather_indices(weather_data)
        weather_data.update(agro_indices)
        weather_data["location"] = location

        return weather_data

    async def _geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        # Fast local lookup first
        loc_lower = location.lower()
        for city, data in KNOWN_LOCATIONS.items():
            if city in loc_lower:
                return {"lat": data["lat"], "lon": data["lon"]}

        # Try open geocoding api
        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results")
                    if results and len(results) > 0:
                        return {"lat": results[0]["latitude"], "lon": results[0]["longitude"]}
        except Exception as e:
            logger.debug(f"Geocoding online lookup failed for '{location}': {e}")

        # Default fallback coordinates (Central India)
        return {"lat": 16.5, "lon": 78.5}

    async def _fetch_open_meteo(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
                f"&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3"
            )
            async with httpx.AsyncClient(timeout=4.5) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    current = data.get("current", {})
                    daily = data.get("daily", {})

                    temp = current.get("temperature_2m", 28.0)
                    humidity = current.get("relative_humidity_2m", 70)
                    wind = current.get("wind_speed_10m", 8.0)
                    precip_daily = daily.get("precipitation_sum", [0.0])
                    precip_prob = daily.get("precipitation_probability_max", [10])

                    rain_forecast_mm = float(precip_daily[0]) if precip_daily else 0.0
                    rain_prob = int(precip_prob[0]) if precip_prob else 10

                    condition = self._weather_code_to_condition(current.get("weather_code", 0))

                    return {
                        "temperature_c": round(float(temp), 1),
                        "humidity_pct": int(humidity),
                        "rainfall_forecast_mm": round(rain_forecast_mm, 1),
                        "rainfall_probability_pct": rain_prob,
                        "wind_speed_kmh": round(float(wind), 1),
                        "condition": condition,
                        "data_source": "Open-Meteo Live API"
                    }
        except Exception as e:
            logger.debug(f"Open-meteo live query failed: {e}")

        return None

    def _generate_fallback_weather(self, location: str) -> Dict[str, Any]:
        loc_lower = location.lower()
        matched = None
        for city, data in KNOWN_LOCATIONS.items():
            if city in loc_lower:
                matched = data
                break

        if not matched:
            matched = {
                "temp": 28.5,
                "humidity": 76,
                "wind": 9.0,
                "condition": "Humid & Partly Cloudy"
            }

        return {
            "temperature_c": matched["temp"],
            "humidity_pct": matched["humidity"],
            "rainfall_forecast_mm": 2.5 if matched["humidity"] > 80 else 0.0,
            "rainfall_probability_pct": 45 if matched["humidity"] > 80 else 15,
            "wind_speed_kmh": matched["wind"],
            "condition": matched["condition"],
            "data_source": "Agro-Meteorological Baseline Model"
        }

    def _compute_agro_weather_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        temp = data.get("temperature_c", 25.0)
        humidity = data.get("humidity_pct", 65)
        wind = data.get("wind_speed_kmh", 8.0)
        rain_mm = data.get("rainfall_forecast_mm", 0.0)

        # 1. Fungal Sporulation Risk Calculation
        # Most foliar fungal pathogens (Alternaria, Pyricularia, Phytophthora, Cercospora)
        # require >80% RH and 20-30°C temperature with leaf wetness
        if humidity >= 85 and 20.0 <= temp <= 30.0:
            fungal_risk = "Extreme"
            fungal_note = "Continuous high humidity (>85%) with moderate temperatures creates critical fungal sporulation conditions."
        elif humidity >= 75 and 18.0 <= temp <= 32.0:
            fungal_risk = "High"
            fungal_note = "Elevated humidity (>75%) increases risk of leaf blights and fungal spore germination."
        elif humidity >= 60:
            fungal_risk = "Moderate"
            fungal_note = "Moderate humidity; monitor for early fungal and bacterial lesions."
        else:
            fungal_risk = "Low"
            fungal_note = "Dry conditions limit fungal spore spread, but watch for sucking pests like spider mites and thrips."

        # 2. Spray Advisory Assessment
        advisory_notes = [fungal_note]
        if rain_mm > 5.0 or data.get("rainfall_probability_pct", 0) > 60:
            spray_advisory = "Unsafe - Rain Imminent"
            advisory_notes.append("Significant rain forecast within 24-48h. Avoid foliar sprays or urea broadcast to prevent chemical wash-off and leaching.")
        elif wind > 18.0:
            spray_advisory = "Unsafe - High Wind Drift"
            advisory_notes.append(f"Wind speed of {wind} km/h exceeds safe spraying limits (max 15 km/h). Severe drift risk.")
        elif temp > 35.0:
            spray_advisory = "Caution - Midday Heat"
            advisory_notes.append("Avoid spraying during peak midday heat (>35°C) to prevent foliar chemical scorching. Spray early morning (6-9 AM) or evening (4-6 PM).")
        else:
            spray_advisory = "Safe for Application"
            advisory_notes.append("Weather conditions are calm and favorable for scheduled foliar sprays or fertigation.")

        return {
            "fungal_disease_risk": fungal_risk,
            "spray_advisory": spray_advisory,
            "advisory_notes": advisory_notes
        }

    def _weather_code_to_condition(self, code: int) -> str:
        mapping = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            95: "Thunderstorm"
        }
        return mapping.get(code, "Partly Cloudy")
