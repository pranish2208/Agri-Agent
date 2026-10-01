from typing import List, Dict, Any, Optional
from models.analysis import PossibleIssue


class AgriReasoningEngine:
    """
    Multi-factor Agricultural Reasoning Engine.
    Correlates phenological crop vulnerability, micro-climatic triggers,
    soil chemical predispositions, and clinical symptom manifestations.
    """

    def reason(
        self,
        crop: str,
        growth_stage: Optional[str],
        symptoms: Optional[str],
        weather: Dict[str, Any],
        soil_analysis: Optional[Dict[str, Any]],
        possible_issues: List[PossibleIssue],
        retrieved_context: str
    ) -> Dict[str, Any]:
        """
        Executes multi-factor agronomic synthesis and calculates risk level.
        """
        reasoning_factors: List[str] = []
        crop_title = crop.capitalize()

        # Factor 1: Crop Phenological Stage Sensitivity
        stage_str = growth_stage or "Current vegetative/reproductive"
        stage_l = stage_str.lower()
        if "flower" in stage_l or "fruit" in stage_l or "pod" in stage_l or "panicle" in stage_l or "boll" in stage_l:
            reasoning_factors.append(
                f"Phenological Vulnerability: {crop_title} at '{stage_str}' is in a critical reproductive phase where photosynthetic leaf loss or pathogen attack directly curtails floral fertilization and marketable yield."
            )
        elif "seedling" in stage_l or "nursery" in stage_l:
            reasoning_factors.append(
                f"Phenological Vulnerability: {crop_title} at '{stage_str}' has tender unlignified tissues with immature root systems, rendering seedlings exceptionally prone to damping-off, collar rot, and early vector feeding."
            )
        else:
            reasoning_factors.append(
                f"Phenological Context: {crop_title} at '{stage_str}' requires optimal vegetative canopy development and root anchoring without foliar interruption."
            )

        # Factor 2: Micro-climatic & Weather Interaction
        temp = weather.get("temperature_c", 28.0)
        humidity = weather.get("humidity_pct", 75)
        rain_mm = weather.get("rainfall_forecast_mm", 0.0)
        fungal_risk = weather.get("fungal_disease_risk", "Moderate")

        if fungal_risk in ["High", "Extreme"]:
            reasoning_factors.append(
                f"Weather Interaction: Prevailing high relative humidity ({humidity}%) and ambient temperature ({temp}°C) in the farm area create peak conditions for fungal spore germination, stomatal penetration, and lesion expansion."
            )
        elif humidity < 60 and temp > 32.0:
            reasoning_factors.append(
                f"Weather Interaction: Warm and dry ambient conditions ({temp}°C, {humidity}% RH) suppress water-borne bacterial rots but favor rapid population surges of sucking pests (thrips, mites, whiteflies)."
            )
        else:
            reasoning_factors.append(
                f"Weather Interaction: Current weather ({temp}°C, {humidity}% RH, {weather.get('condition', 'partly cloudy')}) provides moderate micro-climatic disease pressure, requiring vigilant canopy scouting."
            )

        # Factor 3: Soil Predisposition & Nutrient Imbalance
        if soil_analysis:
            cautions = soil_analysis.get("cautions", [])
            health_score = soil_analysis.get("overall_health_score", 80)
            ph_status = soil_analysis.get("ph_status", {})

            if cautions:
                reasoning_factors.append(
                    f"Soil Health Predisposition: {cautions[0]}"
                )
            elif health_score < 70:
                reasoning_factors.append(
                    f"Soil Health Predisposition: Sub-optimal soil health score ({health_score}/100) indicates nutritional imbalance or pH deviations that weaken cellular cell-wall resistance against pathogen invasion."
                )
            else:
                reasoning_factors.append(
                    f"Soil Health Context: Favorable soil chemical balance (Score: {health_score}/100, pH {ph_status.get('value', 'optimal')}) provides strong baseline root nutrition."
                )
        else:
            reasoning_factors.append(
                "Soil Context: Soil chemical profile not provided; assuming standard regional nutrient availability while recommending a comprehensive soil test."
            )

        # Factor 4: Clinical Diagnostic Evidence
        if possible_issues:
            top_issue = possible_issues[0]
            reasoning_factors.append(
                f"Diagnostic Correlation: Observed symptom expressions align closely with '{top_issue.name}' (Estimated confidence: {int(top_issue.confidence * 100)}%), primarily impacting {top_issue.affected_part or 'plant tissues'}."
            )
        else:
            reasoning_factors.append(
                "Diagnostic Correlation: Symptoms suggest general physiological or early pathological stress requiring close daily observation."
            )

        # Calculate Overall Risk Level
        risk_level = self._compute_risk_level(
            stage_str=stage_str,
            weather=weather,
            top_issue=possible_issues[0] if possible_issues else None,
            soil_analysis=soil_analysis
        )

        return {
            "reasoning_factors": reasoning_factors,
            "risk_level": risk_level
        }

    def _compute_risk_level(
        self,
        stage_str: str,
        weather: Dict[str, Any],
        top_issue: Optional[PossibleIssue],
        soil_analysis: Optional[Dict[str, Any]]
    ) -> str:
        score = 0

        # Stage weight
        stage_l = stage_str.lower()
        if any(w in stage_l for w in ["flower", "fruit", "pod", "boll", "panicle"]):
            score += 2
        elif any(w in stage_l for w in ["seedling", "nursery"]):
            score += 2
        else:
            score += 1

        # Weather risk weight
        fungal_risk = weather.get("fungal_disease_risk", "Moderate")
        if fungal_risk == "Extreme":
            score += 3
        elif fungal_risk == "High":
            score += 2
        elif fungal_risk == "Moderate":
            score += 1

        # Issue confidence weight
        if top_issue:
            if top_issue.confidence >= 0.75:
                score += 3
            elif top_issue.confidence >= 0.50:
                score += 2
            else:
                score += 1

            # High severity diseases
            name_l = top_issue.name.lower()
            if any(severe in name_l for severe in ["wilt", "blast", "late blight", "bud rot", "pink bollworm"]):
                score += 2

        # Soil severity weight
        if soil_analysis and soil_analysis.get("overall_health_score", 80) < 60:
            score += 1

        # Determine level
        if score >= 9:
            return "Critical"
        elif score >= 6:
            return "High"
        elif score >= 4:
            return "Moderate"
        else:
            return "Low"
