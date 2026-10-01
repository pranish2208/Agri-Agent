from typing import List, Dict, Any, Optional
from models.analysis import PossibleIssue


class AgriDecisionEngine:
    """
    Action Plan & Decision Formulation Engine.
    Generates structured, practical, and IPM-compliant mitigation plans
    adhering to ICAR and Central Insecticides Board (CIBRC) standards.
    """

    def generate_plan(
        self,
        crop: str,
        location: str,
        growth_stage: Optional[str],
        weather: Dict[str, Any],
        soil_analysis: Optional[Dict[str, Any]],
        possible_issues: List[PossibleIssue],
        risk_level: str
    ) -> Dict[str, Any]:
        crop_title = crop.capitalize()
        stage_name = growth_stage or "current growth stage"
        top_issue = possible_issues[0] if possible_issues else None

        # 1. Formulate Summary
        summary = self._generate_summary(crop_title, location, stage_name, top_issue, risk_level, weather)

        # 2. Formulate Recommendations
        recommendations = self._generate_recommendations(crop_title, stage_name, top_issue, weather, soil_analysis)

        # 3. Formulate Things to Avoid
        things_to_avoid = self._generate_things_to_avoid(crop_title, top_issue, weather, soil_analysis)

        # 4. Formulate Monitoring Steps
        monitoring_steps = self._generate_monitoring_steps(crop_title, top_issue, risk_level)

        return {
            "summary": summary,
            "recommendations": recommendations,
            "things_to_avoid": things_to_avoid,
            "monitoring_steps": monitoring_steps
        }

    def _generate_summary(
        self,
        crop: str,
        location: str,
        stage: str,
        top_issue: Optional[PossibleIssue],
        risk_level: str,
        weather: Dict[str, Any]
    ) -> str:
        issue_name = top_issue.name if top_issue else "unspecified agronomic stress"
        confidence_pct = int(top_issue.confidence * 100) if top_issue else 50
        weather_cond = weather.get("condition", "current weather")
        temp = weather.get("temperature_c", 28.0)
        humidity = weather.get("humidity_pct", 75)

        return (
            f"Agronomic assessment for {crop} at {stage} in {location} indicates a {risk_level.upper()} RISK level. "
            f"Symptom manifestations correlate primarily with '{issue_name}' (indicative confidence: {confidence_pct}%), "
            f"under prevailing micro-climate of {weather_cond} ({temp}°C, {humidity}% RH). "
            f"Immediate preventative and curative interventions are detailed below to arrest lesion expansion, "
            f"correct underlying nutritional stress, and safeguard marketable yield."
        )

    def _generate_recommendations(
        self,
        crop: str,
        stage: str,
        top_issue: Optional[PossibleIssue],
        weather: Dict[str, Any],
        soil_analysis: Optional[Dict[str, Any]]
    ) -> List[str]:
        recs = []

        # Immediate Cultural / Physical Action
        recs.append(
            "Immediate Sanitation (Next 24h): Prune and safely bag all severely infected lower leaves, twigs, or fallen debris showing active lesions; bury or compost away from the cropping area to reduce in-field inoculum."
        )

        # Targeted Disease / Pest Intervention
        if top_issue:
            issue_l = top_issue.name.lower()
            if "early blight" in issue_l:
                recs.append(
                    "Foliar Fungicide (Targeted): Spray Azoxystrobin 23% SC @ 1.0 ml/litre or Mancozeb 75% WP @ 2.0 g/litre of water. Ensure thorough coverage of both upper and lower leaf surfaces during early morning hours."
                )
                recs.append(
                    "Bio-control & Organic Option: Foliar application of Pseudomonas fluorescens @ 5 g/litre or Trichoderma harzianum @ 5 g/litre mixed with 1% jaggery solution."
                )
            elif "late blight" in issue_l:
                recs.append(
                    "Curative Fungicide: Spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5 g/litre of water immediately. Repeat after 7-10 days if humid weather persists."
                )
            elif "leaf curl" in issue_l:
                recs.append(
                    "Vector Management: Uproot severely stunted viral clumps immediately. Spray Diafenthiuron 50% WP @ 1.25 g/litre or Spiromesifen 22.9% SC @ 1.0 ml/litre to control the vector whitefly population."
                )
            elif "wilt" in issue_l:
                recs.append(
                    "Root Zone Drenching: Drench soil around root collar with Copper Oxychloride 50 WP @ 2.5 g/litre combined with Streptocycline @ 0.1 g/litre (1 g per 10 litres water)."
                )
            elif "blast" in issue_l:
                recs.append(
                    "Anti-Blast Spray: Apply Tricyclazole 75% WP @ 0.6 g/litre or Isoprothiolane 40% EC @ 1.5 ml/litre upon early eye-shaped spot appearance."
                )
            elif "thrips" in issue_l:
                recs.append(
                    "Thrips Control: Erect blue sticky traps @ 25 traps/acre. Spray Fipronil 5% SC @ 1.5 ml/litre or Spinetoram 11.7% SC @ 0.8 ml/litre."
                )
            elif "borer" in issue_l or "bollworm" in issue_l:
                recs.append(
                    "Borer Control: Install species-specific pheromone traps @ 5-8 traps/acre. Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/litre (Coragen) with 3 days waiting period (PHI)."
                )
            elif "calcium" in issue_l or "blossom end" in issue_l:
                recs.append(
                    "Calcium Correction: Foliar spray of Calcium Nitrate @ 5.0 g/litre of water; ensure steady soil moisture via drip to facilitate steady xylem transpirational flow."
                )
            elif "zinc" in issue_l or "khaira" in issue_l:
                recs.append(
                    "Zinc Application: Foliar spray of 0.5% Zinc Sulphate (5 g/L) + 0.25% slaked lime (2.5 g/L) for rapid foliar absorption."
                )
            elif "nitrogen" in issue_l:
                recs.append(
                    "Nitrogen Supplementation: Top dress Urea @ 25 kg/ha or spray 1-2% foliar Urea solution (10-20 g/L) in early morning."
                )
            else:
                recs.append(
                    f"Targeted Intervention: Apply prophylactic broad-spectrum protectant Mancozeb 75 WP @ 2.0 g/L or Azadirachtin 10,000 ppm @ 2 ml/L."
                )
        else:
            recs.append(
                "Protective Spray: Apply Neem oil (Azadirachtin 10,000 ppm) @ 2 ml/litre + 0.5 ml wetting agent as an organic prophylactic safeguard."
            )

        # Soil & Nutrition Amendment
        if soil_analysis and soil_analysis.get("fertilizer_schedule"):
            sched = soil_analysis["fertilizer_schedule"][0]
            recs.append(f"Nutrient Management: {sched}")
        else:
            recs.append(
                "Nutrition & Water Balance: Maintain balanced N-P-K fertigation; avoid water stress during current reproductive flushes."
            )

        # Weather spray advisory
        spray_advisory = weather.get("spray_advisory", "Safe for Application")
        recs.append(
            f"Weather Spray Window: Current advisory is '{spray_advisory}'. Apply sprays between 6:30 AM - 9:30 AM or 4:00 PM - 6:00 PM when wind is calm."
        )

        return recs

    def _generate_things_to_avoid(
        self,
        crop: str,
        top_issue: Optional[PossibleIssue],
        weather: Dict[str, Any],
        soil_analysis: Optional[Dict[str, Any]]
    ) -> List[str]:
        avoid = [
            "DO NOT apply additional chemical Urea or excess Nitrogen fertilizer right now; excess free nitrogen produces soft succulent tissue that accelerates pathogen invasion.",
            "DO NOT use overhead sprinklers or hose watering that wets the canopy; leaf wetness lasting >4 hours triggers rapid fungal spore multiplication.",
            "DO NOT mix chemical copper fungicides (like Copper Oxychloride or Bordeaux mixture) with bio-control agents (like Trichoderma or Pseudomonas) as copper kills beneficial living microbes.",
            "DO NOT spray foliar agrochemicals during midday heat (>32°C); high evaporation rates cause droplet concentration and severe foliar phytotoxicity scorch.",
            "DO NOT harvest marketable fruits within the designated Pre-Harvest Interval (PHI) after chemical fungicide or insecticide applications."
        ]

        if top_issue and "wilt" in top_issue.name.lower():
            avoid.append("DO NOT practice flood furrow irrigation across the field; water currents directly transport wilt bacterial/fungal spores from sick plants to healthy roots.")

        return avoid

    def _generate_monitoring_steps(
        self,
        crop: str,
        top_issue: Optional[PossibleIssue],
        risk_level: str
    ) -> List[str]:
        issue_name = top_issue.name if top_issue else "symptoms"
        return [
            f"Day 3 Milestone: Inspect treated plants for arrest of lesion margins; check whether target board spots of {issue_name} have dried without expanding to new terminal leaves.",
            "Day 7 Milestone: Evaluate new leaf flushes and flower clusters. Verify that emerging foliage is clean and vigorous. In case of insect vectors, inspect yellow/blue sticky trap catch counts.",
            "Day 14 Milestone: Assess overall canopy vigor, fruit set stability, and soil moisture consistency. If symptoms persist or new wilt signs appear, collect fresh leaf samples and consult your nearest Krishi Vigyan Kendra (KVK) or district agricultural extension officer."
        ]
