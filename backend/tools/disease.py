import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from models.analysis import PossibleIssue


class DiseaseDiagnosisTool:
    """
    Expert Agricultural Pathology & Pest Diagnostic Tool.
    Evaluates multi-factor symptom expressions, environmental conduciveness,
    phenological susceptibility, and soil predisposing factors.
    Adheres strictly to scientific agronomy without making unsupported diagnosis guarantees.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent.parent / "data"
        self.data_dir = data_dir
        self.diseases: List[Dict[str, Any]] = []
        self.pests: List[Dict[str, Any]] = []
        self._load_knowledge()

    def _load_knowledge(self):
        diseases_path = self.data_dir / "diseases"
        if diseases_path.exists():
            for f in diseases_path.glob("*.json"):
                try:
                    with open(f, "r", encoding="utf-8") as file:
                        items = json.load(file)
                        self.diseases.extend(items)
                except Exception as e:
                    print(f"Error loading disease file {f}: {e}")

        pests_path = self.data_dir / "pests"
        if pests_path.exists():
            for f in pests_path.glob("*.json"):
                try:
                    with open(f, "r", encoding="utf-8") as file:
                        items = json.load(file)
                        self.pests.extend(items)
                except Exception as e:
                    print(f"Error loading pest file {f}: {e}")

    def diagnose(
        self,
        crop: str,
        symptoms: Optional[str] = None,
        growth_stage: Optional[str] = None,
        weather: Optional[Dict[str, Any]] = None,
        soil: Optional[Dict[str, Any]] = None
    ) -> List[PossibleIssue]:
        """
        Synthesizes multi-criteria evidence to produce a ranked list of candidate issues.
        """
        crop_clean = crop.lower().strip()
        symptoms_clean = (symptoms or "").lower().strip()

        candidates: List[Dict[str, Any]] = []

        # 1. Match against known diseases
        for d in self.diseases:
            d_crop = d.get("crop", "").lower()
            if crop_clean not in d_crop and d_crop not in crop_clean:
                continue

            score, match_factors = self._calculate_disease_match(d, symptoms_clean, weather, soil)
            if score > 0.15:
                candidates.append({
                    "name": d.get("disease_name"),
                    "type": "disease",
                    "confidence": min(0.88, round(score, 2)),  # Never 1.0 to respect scientific caution
                    "affected_part": d.get("affected_plant_part"),
                    "risk_factors": match_factors,
                    "description": (
                        f"Pathogen: {d.get('pathogen', 'Fungal/Bacterial agent')}. "
                        f"Symptoms: {d.get('symptoms')[:220]}... "
                        f"Favorable conditions: {d.get('favorable_conditions')}"
                    ),
                    "management": d.get("management"),
                    "prevention": d.get("prevention")
                })

        # 2. Match against known pests
        for p in self.pests:
            p_crop = p.get("crop", "").lower()
            if crop_clean not in p_crop and p_crop not in crop_clean:
                continue

            score, match_factors = self._calculate_pest_match(p, symptoms_clean, weather)
            if score > 0.15:
                candidates.append({
                    "name": p.get("pest_name"),
                    "type": "pest",
                    "confidence": min(0.85, round(score, 2)),
                    "affected_part": "Foliage / Reproductive organs",
                    "risk_factors": match_factors,
                    "description": (
                        f"Identification: {p.get('identification')}. "
                        f"Damage: {p.get('symptoms')[:220]}..."
                    ),
                    "management": p.get("management"),
                    "prevention": p.get("prevention")
                })

        # 3. Check for obvious nutrient deficiency symptoms in text
        nutrient_candidate = self._check_nutrient_deficiency(crop_clean, symptoms_clean, soil)
        if nutrient_candidate:
            candidates.append(nutrient_candidate)

        # Sort by confidence descending
        candidates.sort(key=lambda x: x["confidence"], reverse=True)

        # If no specific candidates scored above threshold, return general crop vulnerability
        if not candidates:
            candidates = self._generate_general_candidates(crop_clean, growth_stage, weather)

        # Convert to Pydantic objects
        return [
            PossibleIssue(
                name=c["name"],
                type=c["type"],
                confidence=c["confidence"],
                affected_part=c.get("affected_part"),
                risk_factors=c.get("risk_factors", []),
                description=c["description"]
            )
            for c in candidates[:3]  # Return top 3 most probable issues
        ]

    def _calculate_disease_match(
        self,
        disease: Dict[str, Any],
        symptoms: str,
        weather: Optional[Dict[str, Any]],
        soil: Optional[Dict[str, Any]]
    ) -> (float, List[str]):
        score = 0.0
        factors = []

        d_name = disease.get("disease_name", "").lower()
        d_sym = disease.get("symptoms", "").lower()
        d_part = disease.get("affected_plant_part", "").lower()
        d_cond = disease.get("favorable_conditions", "").lower()

        # Keyword semantic overlap
        keywords = [
            "yellow", "yellowing", "spot", "spots", "concentric", "rings", "bullseye", "blight",
            "rot", "wilt", "wilting", "water-soaked", "curl", "curling", "burn", "ooze",
            "lesion", "lesions", "puckering", "stunt", "stunted", "white", "black", "brown",
            "target", "halo", "drying", "speck", "streaks", "pustules"
        ]

        matched_tokens = 0
        for kw in keywords:
            if kw in symptoms:
                if kw in d_sym or kw in d_name:
                    matched_tokens += 1
                    score += 0.12

        # Direct disease name mention in symptoms
        if any(word in symptoms for word in d_name.split() if len(word) > 3):
            score += 0.35
            factors.append("Direct clinical symptom pattern alignment")

        # Specific signature symptom pairs
        if ("concentric" in symptoms or "target" in symptoms or "bullseye" in symptoms) and "early blight" in d_name:
            score += 0.40
            factors.append("Concentric bullseye ring pattern matches Alternaria signature")

        if ("curl" in symptoms or "curling" in symptoms) and "leaf curl" in d_name:
            score += 0.35
            factors.append("Severe foliar curling and puckering reported")

        if ("wilt" in symptoms or "droop" in symptoms) and "wilt" in d_name:
            score += 0.30
            factors.append("Daytime vascular collapse / wilting indicated")

        # Weather conduciveness
        if weather:
            humidity = weather.get("humidity_pct", 70)
            temp = weather.get("temperature_c", 28.0)
            fungal_risk = weather.get("fungal_disease_risk", "Moderate")

            if ("blight" in d_name or "rot" in d_name or "spot" in d_name or "blast" in d_name):
                if humidity >= 75 and 20.0 <= temp <= 32.0:
                    score += 0.18
                    factors.append(f"Prevailing weather ({temp}°C, {humidity}% RH) is highly conducive to fungal spore germination")
                elif fungal_risk in ["High", "Extreme"]:
                    score += 0.12
                    factors.append(f"Elevated agro-climatic fungal disease index ({fungal_risk})")

        # Soil predisposing factors
        if soil:
            ph = soil.get("ph")
            if ph and ph < 6.0 and "wilt" in d_name:
                score += 0.10
                factors.append(f"Acidic soil (pH {ph}) accelerates bacterial/fungal root colonization")

            potassium = soil.get("potassium")
            if potassium and potassium < 130 and ("blight" in d_name or "spot" in d_name):
                score += 0.10
                factors.append("Low soil potassium reduces plant structural resistance against leaf pathogens")

        return score, factors

    def _calculate_pest_match(
        self,
        pest: Dict[str, Any],
        symptoms: str,
        weather: Optional[Dict[str, Any]]
    ) -> (float, List[str]):
        score = 0.0
        factors = []

        p_name = pest.get("pest_name", "").lower()
        p_sym = pest.get("symptoms", "").lower()

        pest_keywords = [
            "hole", "holes", "borer", "bore", "caterpillar", "worm", "curling", "boat",
            "mines", "mining", "silver", "bronze", "whitefly", "flies", "honeydew", "sooty",
            "frass", "droppings", "webbing", "folded", "dead heart", "deadheart", "white earhead"
        ]

        for kw in pest_keywords:
            if kw in symptoms and kw in p_sym:
                score += 0.14

        if ("boat" in symptoms or "upward" in symptoms) and "thrips" in p_name:
            score += 0.35
            factors.append("Upward boat-shaped curling indicates thrips feeding")

        if ("downward" in symptoms or "inverted" in symptoms) and "mite" in p_name:
            score += 0.35
            factors.append("Downward curling and brittle elongation indicates mite infestation")

        if ("hole" in symptoms or "frass" in symptoms or "bored" in symptoms) and ("borer" in p_name or "bollworm" in p_name):
            score += 0.35
            factors.append("Circular entry holes and larval frass match borer activity")

        if ("dead heart" in symptoms or "white earhead" in symptoms) and "stem borer" in p_name:
            score += 0.40
            factors.append("Classic stem borer damage symptoms observed")

        if weather:
            humidity = weather.get("humidity_pct", 70)
            temp = weather.get("temperature_c", 28.0)
            if ("thrips" in p_name or "whitefly" in p_name) and temp > 30.0 and humidity < 70:
                score += 0.15
                factors.append("Warm, dry weather is ideal for sucking pest proliferation")

        return score, factors

    def _check_nutrient_deficiency(
        self,
        crop: str,
        symptoms: str,
        soil: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        # Check blossom end rot
        if ("blossom end" in symptoms or ("bottom" in symptoms and "black" in symptoms and "rot" in symptoms)) and crop in ["tomato", "chilli"]:
            return {
                "name": "Calcium Deficiency (Blossom End Rot)",
                "type": "nutrient_deficiency",
                "confidence": 0.82,
                "affected_part": "Fruit blossom end",
                "risk_factors": ["Irregular irrigation", "Low soil calcium or low pH (<6.0)", "Excess nitrogen"],
                "description": "Blossom End Rot is a physiological disorder caused by localized calcium deficiency in expanding fruit tissues, resulting in flat, leathery black sunken lesions.",
                "management": "Foliar spray with Calcium Nitrate @ 5g/L; maintain steady drip irrigation to ensure uniform calcium uptake.",
                "prevention": "Apply agricultural lime if soil is acidic; avoid fluctuating soil moisture during fruit development."
            }

        # Check Khaira disease in rice
        if ("khaira" in symptoms or ("rust" in symptoms and "bronze" in symptoms)) and crop == "rice":
            return {
                "name": "Zinc Deficiency (Khaira Disease)",
                "type": "nutrient_deficiency",
                "confidence": 0.80,
                "affected_part": "Lower leaves",
                "risk_factors": ["High pH alkaline soil", "Intensive cropping without zinc replenishment", "Cold waterlogged soil"],
                "description": "Zinc deficiency causes characteristic reddish-brown bronze spots on leaf blades that coalesce into scorched patches, retarding tiller emergence.",
                "management": "Foliar spray of 0.5% Zinc Sulphate (5g/L) mixed with 0.25% slaked lime.",
                "prevention": "Apply 25 kg/ha Zinc Sulphate as basal application before transplanting."
            }

        # Check Nitrogen deficiency
        if ("lower leaves" in symptoms or "older leaves" in symptoms) and "yellow" in symptoms and "spots" not in symptoms:
            return {
                "name": "Nitrogen Deficiency",
                "type": "nutrient_deficiency",
                "confidence": 0.72,
                "affected_part": "Older lower leaves",
                "risk_factors": ["Low soil organic carbon", "Heavy leaching rains", "Insufficient basal fertilizer"],
                "description": "Uniform generalized yellowing (chlorosis) progressing from older lower leaves upward, coupled with stunted plant height.",
                "management": "Apply 25-30 kg/ha Urea or spray 1-2% Urea foliar solution for quick recovery.",
                "prevention": "Incorporate FYM and split nitrogen applications in 3-4 stages."
            }

        return None

    def _generate_general_candidates(
        self,
        crop: str,
        growth_stage: Optional[str],
        weather: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        # Fallback to major diseases for this crop
        candidates = []
        for d in self.diseases:
            if crop in d.get("crop", "").lower():
                candidates.append({
                    "name": d.get("disease_name"),
                    "type": "disease",
                    "confidence": 0.45,
                    "affected_part": d.get("affected_plant_part"),
                    "risk_factors": [f"Seasonal vulnerability for {crop.capitalize()} at {growth_stage or 'current'} stage"],
                    "description": d.get("symptoms")[:200] + "...",
                    "management": d.get("management"),
                    "prevention": d.get("prevention")
                })
                if len(candidates) >= 2:
                    break
        return candidates
