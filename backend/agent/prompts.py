"""
Agronomic reasoning guidelines, expert heuristics, and decision prompts
grounded in ICAR (Indian Council of Agricultural Research) and FAO protocols.
"""

PROBLEM_CLASSIFICATION_RULES = {
    "PATHOLOGY": ["blight", "rot", "spot", "spots", "wilt", "wilting", "mildew", "rust", "canker", "ooze", "dieback"],
    "ENTOMOLOGY": ["borer", "thrips", "mite", "whitefly", "caterpillar", "jassid", "hopper", "hole", "frass", "webbing"],
    "NUTRIENT_DEFICIENCY": ["yellowing", "chlorosis", "stunting", "purple", "firing", "blossom end rot", "deficiency", "khaira"],
    "PHYSIOLOGICAL_WEATHER_STRESS": ["heat", "drought", "waterlogging", "frost", "sunscald", "cracking"],
    "GENERAL_AGRONOMY": ["sowing", "spacing", "fertilizer", "irrigation", "variety", "harvest", "yield"]
}

RISK_RUBRIC = {
    "CRITICAL": "Widespread active wilting, neck blast, sudden death, bacterial wilt, or >50% crop loss imminent within 48-72 hours under severe weather.",
    "HIGH": "Active lesions expanding during critical flowering/fruit set; favorable rainy/humid weather; rapid pest proliferation crossing ETL.",
    "MODERATE": "Early or localized symptoms detected; stage is sensitive but weather is currently stable; time to intervene with preventative and bio-control measures.",
    "LOW": "Minor localized or cosmetic symptoms; non-spreading physiological signs; optimal soil and weather conditions."
}

COMMON_AGRICULTURAL_MISTAKES = [
    "Over-applying Urea / Nitrogen when plants are diseased; lush tender tissue drastically increases fungal sporulation and sucking insect reproduction.",
    "Spraying foliar chemicals during hot midday hours (>32°C), causing chemical leaf burn and rapid solvent evaporation.",
    "Mixing systemic fungicides or chemical pesticides with bio-control agents (e.g. mixing Copper Oxychloride with Trichoderma or Pseudomonas kills the beneficial bio-agents).",
    "Using overhead or sprinkler irrigation on blight-infected crops, splashing fungal spores to adjacent healthy leaves.",
    "Ignoring the Pre-Harvest Interval (PHI) on chemical sprays before harvesting vegetable fruits for market.",
    "Flood irrigation when bacterial or vascular wilt is observed, which spreads the pathogen through irrigation water across the entire field."
]
