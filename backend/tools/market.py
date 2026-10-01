from typing import Dict, Any, Optional
from models.analysis import MarketDataResponse


class MarketTool:
    """
    Agricultural Market Intelligence Tool.
    Provides Mandi modal prices, Minimum Support Prices (MSP), arrival volumes,
    and harvest marketing advisories across major Indian APMCs.
    """

    # Agricultural Mandi database across major Indian commodity centres
    MARKET_DATA = {
        "rice": {
            "modal_price": 2450.0,
            "min_price": 2250.0,
            "max_price": 2700.0,
            "msp": 2300.0,
            "trend": "Stable",
            "arrivals_tonnes": 480.0,
            "major_mandis": ["Karnal (Haryana)", "Thanjavur (Tamil Nadu)", "Khammam (Telangana)", "Burdwan (West Bengal)"],
            "advisory": "Mandi prices are trading above MSP. Ensure moisture content is certified below 14% to avoid deductions at procurement centres."
        },
        "tomato": {
            "modal_price": 2200.0,
            "min_price": 1600.0,
            "max_price": 2800.0,
            "msp": None,
            "trend": "Rising",
            "arrivals_tonnes": 220.0,
            "major_mandis": ["Kolar APMC (Karnataka)", "Madanapalle (Andhra Pradesh)", "Pimpalgaon / Nashik (Maharashtra)", "Koyambedu (Chennai)"],
            "advisory": "Upward price movement reported due to lower arrivals from regional rain-affected areas. Harvest at breaker stage for distant transit; grade carefully into size categories."
        },
        "chilli": {
            "modal_price": 18500.0,
            "min_price": 15000.0,
            "max_price": 22000.0,
            "msp": None,
            "trend": "Rising",
            "arrivals_tonnes": 110.0,
            "major_mandis": ["Guntur Mirchi Yard (Andhra Pradesh)", "Warangal APMC (Telangana)", "Byadgi (Karnataka)", "Khammam (Telangana)"],
            "advisory": "High export demand for Teja and Byadgi varieties. Ensure zero mold contamination and dry below 10% moisture to secure premium cold-storage prices."
        },
        "banana": {
            "modal_price": 1650.0,
            "min_price": 1300.0,
            "max_price": 2100.0,
            "msp": None,
            "trend": "Stable",
            "arrivals_tonnes": 310.0,
            "major_mandis": ["Jalgaon (Maharashtra)", "Theni / Trichy (Tamil Nadu)", "Hajipur (Bihar)", "Gorakhpur (Uttar Pradesh)"],
            "advisory": "Steady demand for Grand Naine. Propping and bunch sleeving safeguard export-grade visual blemish-free skin, commanding a 20-30% premium."
        },
        "coconut": {
            "modal_price": 3200.0,
            "min_price": 2800.0,
            "max_price": 3600.0,
            "msp": 3000.0,
            "trend": "Rising",
            "arrivals_tonnes": 160.0,
            "major_mandis": ["Kangeyam (Tamil Nadu)", "Pollachi (Tamil Nadu)", "Kozhikode (Kerala)", "Arsikere (Karnataka)"],
            "advisory": "Copra and raw nut rates are strengthening with festival and export oil mill demand. Hold well-matured nuts for dehusking or copra drying."
        },
        "cotton": {
            "modal_price": 7350.0,
            "min_price": 6800.0,
            "max_price": 7800.0,
            "msp": 7121.0,
            "trend": "Stable",
            "arrivals_tonnes": 390.0,
            "major_mandis": ["Rajkot (Gujarat)", "Adilabad (Telangana)", "Yavatmal (Maharashtra)", "Surendranagar (Gujarat)"],
            "advisory": "Market prices are currently hovering slightly above Government MSP. Ensure cotton is free of leaf bracts, stained yellow cotton, and excess moisture (>8%)."
        },
        "groundnut": {
            "modal_price": 7050.0,
            "min_price": 6400.0,
            "max_price": 7600.0,
            "msp": 6783.0,
            "trend": "Rising",
            "arrivals_tonnes": 140.0,
            "major_mandis": ["Gondal (Gujarat)", "Adoni (Andhra Pradesh)", "Bikaner (Rajasthan)", "Tindivanam (Tamil Nadu)"],
            "advisory": "Oil miller inquiries are brisk. Shelling percentage and low moisture (<8%) directly dictate trader bids. Aflatoxin-free pods qualify for high-tier export milling."
        },
        "pulses": {
            "modal_price": 8200.0,
            "min_price": 7400.0,
            "max_price": 9100.0,
            "msp": 7550.0,
            "trend": "Rising",
            "arrivals_tonnes": 85.0,
            "major_mandis": ["Kalaburagi / Gulbarga (Karnataka)", "Latur (Maharashtra)", "Indore (Madhya Pradesh)", "Akola (Maharashtra)"],
            "advisory": "Strong pulse market with spot prices exceeding MSP by 10-15%. Staggered marketing post sun-drying and treatment against pulse bruchid beetles is recommended."
        }
    }

    def get_market_data(self, crop: str, location: Optional[str] = None) -> MarketDataResponse:
        crop_clean = crop.lower().strip()
        loc_clean = location.strip() if location else "India"

        # Lookup by crop key
        market_info = None
        for k, v in self.MARKET_DATA.items():
            if k in crop_clean or crop_clean in k:
                market_info = v
                break

        if not market_info:
            market_info = {
                "modal_price": 3500.0,
                "min_price": 2800.0,
                "max_price": 4200.0,
                "msp": None,
                "trend": "Stable",
                "arrivals_tonnes": 120.0,
                "major_mandis": ["Regional APMC Mandi", "Azadpur Mandi (Delhi)", "Vashi APMC (Navi Mumbai)"],
                "advisory": "Grade crop produce and sell through regulated APMC electronic National Agriculture Market (e-NAM) to receive transparent bids."
            }

        # Determine state from location
        state = self._extract_state(loc_clean)

        return MarketDataResponse(
            crop=crop.capitalize(),
            location=loc_clean,
            state=state,
            modal_price_per_quintal=market_info["modal_price"],
            min_price_per_quintal=market_info["min_price"],
            max_price_per_quintal=market_info["max_price"],
            msp_support_price=market_info["msp"],
            price_trend=market_info["trend"],
            arrival_volume_tonnes=market_info["arrivals_tonnes"],
            major_mandis=market_info["major_mandis"],
            marketing_advisory=market_info["advisory"]
        )

    def _extract_state(self, location: str) -> str:
        loc_l = location.lower()
        if "tamil nadu" in loc_l or "vellore" in loc_l or "coimbatore" in loc_l or "madurai" in loc_l:
            return "Tamil Nadu"
        elif "andhra" in loc_l or "guntur" in loc_l or "vijayawada" in loc_l or "kurnool" in loc_l:
            return "Andhra Pradesh"
        elif "telangana" in loc_l or "warangal" in loc_l or "hyderabad" in loc_l:
            return "Telangana"
        elif "karnataka" in loc_l or "kolar" in loc_l or "bangalore" in loc_l or "mysore" in loc_l:
            return "Karnataka"
        elif "maharashtra" in loc_l or "nashik" in loc_l or "pune" in loc_l or "nagpur" in loc_l:
            return "Maharashtra"
        elif "gujarat" in loc_l or "rajkot" in loc_l or "ahmedabad" in loc_l:
            return "Gujarat"
        elif "kerala" in loc_l or "kochi" in loc_l or "alappuzha" in loc_l:
            return "Kerala"
        elif "punjab" in loc_l:
            return "Punjab"
        elif "haryana" in loc_l:
            return "Haryana"
        return "India (National APMC Average)"
