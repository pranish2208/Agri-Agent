from typing import Dict, Any, Optional, List
from models.analysis import SoilDataInput, SoilParameterStatus, SoilAnalysisResponse


class SoilTool:
    """
    Expert Soil Diagnostics and Amendment Engine adhering to
    ICAR (Indian Council of Agricultural Research) Soil Health Card guidelines.
    """

    # Crop optimal pH dictionaries
    CROP_PH_REQUIREMENTS = {
        "rice": {"min": 5.5, "max": 6.8, "name": "Rice"},
        "tomato": {"min": 6.2, "max": 6.8, "name": "Tomato"},
        "chilli": {"min": 6.2, "max": 7.0, "name": "Chilli"},
        "banana": {"min": 6.5, "max": 7.5, "name": "Banana"},
        "coconut": {"min": 5.5, "max": 7.0, "name": "Coconut"},
        "cotton": {"min": 6.5, "max": 8.0, "name": "Cotton"},
        "groundnut": {"min": 6.0, "max": 6.8, "name": "Groundnut"},
        "pulses": {"min": 6.5, "max": 7.5, "name": "Pulses"}
    }

    def analyze(self, soil: SoilDataInput, crop: Optional[str] = None) -> SoilAnalysisResponse:
        crop_key = crop.lower().strip() if crop else None
        crop_ph_req = self.CROP_PH_REQUIREMENTS.get(crop_key, {"min": 6.0, "max": 7.5, "name": crop or "General Crops"})

        health_points = 100
        amendment_plan = []
        fertilizer_schedule = []
        cautions = []

        # 1. pH Evaluation
        ph_status = self._evaluate_ph(soil.ph, crop_ph_req, amendment_plan, cautions)
        if ph_status.status != "Optimal":
            health_points -= 15

        # 2. Electrical Conductivity (EC) Evaluation
        ec_status = self._evaluate_ec(soil.ec, cautions)
        if ec_status.status in ["Moderately Saline", "Severely Saline"]:
            health_points -= 20
        elif ec_status.status == "Critical for sensitive crops":
            health_points -= 10

        # 3. Organic Carbon Evaluation
        oc_status = self._evaluate_organic_carbon(soil.organic_carbon, amendment_plan)
        if oc_status.status == "Low":
            health_points -= 15

        # 4. Primary Nutrients (N, P, K)
        primary_nutrients = []
        if soil.nitrogen is not None:
            n_status = self._evaluate_nitrogen(soil.nitrogen, fertilizer_schedule, cautions)
            primary_nutrients.append(n_status)
            if n_status.status in ["Deficient / Very Low", "Excessive / Toxic"]:
                health_points -= 10

        if soil.phosphorus is not None:
            p_status = self._evaluate_phosphorus(soil.phosphorus, fertilizer_schedule)
            primary_nutrients.append(p_status)
            if p_status.status == "Deficient / Very Low":
                health_points -= 10

        if soil.potassium is not None:
            k_status = self._evaluate_potassium(soil.potassium, crop_key, fertilizer_schedule, cautions)
            primary_nutrients.append(k_status)
            if k_status.status == "Deficient / Very Low":
                health_points -= 10

        # 5. Micronutrients
        micronutrients_status = []
        if soil.micronutrients:
            for micro_name, micro_val in soil.micronutrients.items():
                m_status = self._evaluate_micronutrient(micro_name, micro_val, crop_key, fertilizer_schedule, cautions)
                if m_status:
                    micronutrients_status.append(m_status)

        # Crop-specific predispositions
        if crop_key == "tomato":
            if soil.ph and soil.ph < 6.0:
                cautions.append("Acidic pH (<6.0) severely restricts root Calcium uptake in Tomato, leading directly to Blossom End Rot (black sunken fruit rot).")
            if soil.nitrogen and soil.nitrogen > 350:
                cautions.append("High nitrogen promotes excessive succulent foliage at the expense of fruit set and invites severe tomato pinworm and whitefly outbreaks.")

        if crop_key == "groundnut":
            if soil.ph and soil.ph < 5.8:
                cautions.append("Acidic soil reduces shell calcification. Mandatory application of Gypsum @ 400 kg/ha at pegging (40-45 DAS) to avoid empty 'pops'.")

        if crop_key == "rice":
            if soil.ph and soil.ph > 7.8:
                cautions.append("Alkaline soil triggers severe Zinc fixation. High probability of Khaira disease (bronzing of leaves). Apply 25 kg/ha ZnSO4.")

        final_score = max(20, min(100, health_points))

        return SoilAnalysisResponse(
            crop_context=crop,
            overall_health_score=final_score,
            ph_status=ph_status,
            ec_status=ec_status,
            organic_carbon_status=oc_status,
            primary_nutrients=primary_nutrients,
            micronutrient_status=micronutrients_status,
            amendment_plan=amendment_plan if amendment_plan else ["Soil chemical status is favorable; maintain regular crop rotation and seasonal compost incorporation."],
            fertilizer_schedule=fertilizer_schedule if fertilizer_schedule else ["Follow standard ICAR/State Agriculture University (SAU) recommended dose for target crop."],
            cautions=cautions
        )

    def _evaluate_ph(self, ph: Optional[float], crop_req: Dict[str, Any], amendments: List[str], cautions: List[str]) -> SoilParameterStatus:
        if ph is None:
            return SoilParameterStatus(
                parameter="Soil pH",
                value=None,
                status="Unknown",
                optimal_range=f"{crop_req['min']} - {crop_req['max']}",
                impact="pH not provided; unable to assess micronutrient availability or lime/gypsum requirements.",
                correction_guideline="Conduct laboratory pH test with 1:2.5 soil-water suspension."
            )

        if ph < 5.5:
            status = "Deficient / Very Low"
            impact = "Strong soil acidity. Aluminium/Manganese toxicity risk; severe Phosphorus fixation and poor Rhizobium nodulation."
            correction = "Apply Agricultural Lime (CaCO3) or Dolomite @ 2.5 - 3.5 tonnes/ha 3 weeks prior to planting."
            amendments.append(correction)
            cautions.append("Avoid applying unbuffered chemical fertilizers directly into strongly acidic soils.")
        elif ph < crop_req["min"]:
            status = "Low"
            impact = f"Slightly acidic for {crop_req['name']}. Slight reduction in available Phosphorus, Calcium, and Magnesium."
            correction = "Incorporate 1.0 - 1.5 tonnes/ha lime or apply Rock Phosphate instead of SSP."
            amendments.append(correction)
        elif ph > 8.5:
            status = "Excessive / Toxic"
            impact = "Strong soil sodicity/alkalinity. High Exchangeable Sodium Percentage (ESP); soil dispersion, poor drainage, and severe micronutrient lockout (Fe, Zn)."
            correction = "Apply Mineral Gypsum (CaSO4.2H2O) @ 3.0 - 5.0 tonnes/ha followed by heavy flooding and drainage (leaching)."
            amendments.append(correction)
            cautions.append("Alkaline soils cause acute iron chlorosis in seedlings. Do not flood without drainage outlet.")
        elif ph > crop_req["max"]:
            status = "High"
            impact = f"Moderately alkaline for {crop_req['name']}. Free CaCO3 reduces available Zinc and Phosphorus."
            correction = "Apply farmyard manure enriched with elemental sulphur @ 150 kg/ha or green manure with Daincha."
            amendments.append(correction)
        else:
            status = "Optimal"
            impact = f"Excellent pH balance ({ph}) within optimal threshold for {crop_req['name']} ({crop_req['min']}-{crop_req['max']}). Peak nutrient assimilation."
            correction = "Maintain current soil pH by continuing organic recycling."

        return SoilParameterStatus(
            parameter="Soil pH",
            value=ph,
            status=status,
            optimal_range=f"{crop_req['min']} - {crop_req['max']}",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_ec(self, ec: Optional[float], cautions: List[str]) -> SoilParameterStatus:
        if ec is None:
            return SoilParameterStatus(
                parameter="Electrical Conductivity (EC)",
                value=None,
                status="Optimal",
                optimal_range="< 1.0 dS/m",
                impact="Estimated within safe salinity range.",
                correction_guideline="Test irrigation water salinity if white crusting appears on soil surface."
            )

        if ec <= 1.0:
            status = "Optimal"
            impact = f"Non-saline soil ({ec} dS/m). No root osmotic stress; completely safe for seed germination."
            correction = "Normal irrigation management."
        elif ec <= 2.0:
            status = "Critical for sensitive crops"
            impact = f"Mild salinity ({ec} dS/m). Sensitive legumes, pulses, and young seedlings may show slight stunting."
            correction = "Provide adequate leaching fraction with clean irrigation water. Avoid saline well water."
        elif ec <= 4.0:
            status = "Moderately Saline"
            impact = f"Moderate salinity ({ec} dS/m). Expected 20-30% yield penalty. Osmotic leaf tip burn."
            correction = "Provide deep subsoil drainage, scrape surface salt encrustations, and leach thoroughly."
            cautions.append(f"Soil EC of {ec} dS/m induces physiological drought even when soil is moist.")
        else:
            status = "Excessive / Toxic"
            impact = f"Severe salinity ({ec} dS/m). Fatal to most vegetables and pulses."
            correction = "Mandatory sub-surface drainage installation and extensive sweet-water flushing."
            cautions.append(f"Severe salinity ({ec} dS/m): only salt-tolerant crops like barley or date palm can survive.")

        return SoilParameterStatus(
            parameter="Electrical Conductivity (EC)",
            value=ec,
            status=status,
            optimal_range="< 1.0 dS/m",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_organic_carbon(self, oc: Optional[float], amendments: List[str]) -> SoilParameterStatus:
        if oc is None:
            return SoilParameterStatus(
                parameter="Organic Carbon (OC)",
                value=None,
                status="Unknown",
                optimal_range="0.50% - 0.75%",
                impact="Not reported; organic matter is vital for soil microbial biology and moisture holding.",
                correction_guideline="Apply standard 10-15 tonnes/ha FYM or compost."
            )

        if oc < 0.50:
            status = "Low"
            impact = f"Low organic carbon ({oc}%). Poor cation exchange capacity (CEC), high nutrient leaching, and weak water holding capacity."
            correction = "Mandatory addition of 15-20 tonnes/ha well-decomposed FYM or 5 tonnes/ha vermicompost. In-situ green manuring with Daincha or Sunnhemp."
            amendments.append(correction)
        elif oc <= 0.75:
            status = "Optimal"
            impact = f"Medium organic carbon ({oc}%). Adequate soil biology and moisture buffering."
            correction = "Maintain by incorporating crop residues and applying 8-10 tonnes/ha FYM annually."
        else:
            status = "Optimal"
            impact = f"High organic carbon ({oc}%). Rich biological activity, excellent crumb soil structure and nutrient buffering."
            correction = "Continue current soil stewardship practices."

        return SoilParameterStatus(
            parameter="Organic Carbon (OC)",
            value=oc,
            status=status,
            optimal_range="0.50% - 0.75%",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_nitrogen(self, n: float, schedule: List[str], cautions: List[str]) -> SoilParameterStatus:
        if n < 280.0:
            status = "Deficient / Very Low"
            impact = f"Low available Nitrogen ({n} kg/ha). Causes general chlorosis (yellowing) of older foliage and restricted tillering/branching."
            correction = "Increase recommended chemical Nitrogen fertilizer dose by 25%. Apply in 3-4 split applications to avoid leaching."
            schedule.append(correction)
        elif n <= 560.0:
            status = "Optimal"
            impact = f"Medium available Nitrogen ({n} kg/ha). Balanced vegetative growth."
            correction = "Follow 100% recommended dose of Nitrogen in split applications (basal + active vegetative + flowering)."
            schedule.append(correction)
        else:
            status = "High"
            impact = f"High available Nitrogen ({n} kg/ha). Risk of excessive vegetative lushness, delayed flowering, lodging, and high pest susceptibility."
            correction = "Reduce chemical Nitrogen fertilizer by 25%. Eliminate late-season urea top dressings."
            schedule.append(correction)
            cautions.append("High nitrogen predisposes the crop to severe fungal blast, blights, and sucking pest outbreaks.")

        return SoilParameterStatus(
            parameter="Available Nitrogen (N)",
            value=n,
            status=status,
            optimal_range="280 - 560 kg/ha",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_phosphorus(self, p: float, schedule: List[str]) -> SoilParameterStatus:
        if p < 23.0:
            status = "Deficient / Very Low"
            impact = f"Low available Phosphorus ({p} kg/ha P2O5). Stunted root development, delayed flowering, and purplish leaves."
            correction = "Increase recommended P2O5 by 25%. Inoculate seeds or soil with Phosphobacteria (PSB) or VAM @ 2 kg/acre to solubilize fixed phosphates."
            schedule.append(correction)
        elif p <= 57.0:
            status = "Optimal"
            impact = f"Medium available Phosphorus ({p} kg/ha P2O5). Optimal root anchoring and floral priming."
            correction = "Apply 100% recommended dose of P2O5 entirely as basal dose near the root zone."
            schedule.append(correction)
        else:
            status = "High"
            impact = f"High available Phosphorus ({p} kg/ha P2O5). Can induce Zinc and Iron micronutrient deficiencies."
            correction = "Reduce chemical Phosphorus application by 25-50%."
            schedule.append(correction)

        return SoilParameterStatus(
            parameter="Available Phosphorus (P2O5)",
            value=p,
            status=status,
            optimal_range="23 - 57 kg/ha",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_potassium(self, k: float, crop_key: Optional[str], schedule: List[str], cautions: List[str]) -> SoilParameterStatus:
        if k < 133.0:
            status = "Deficient / Very Low"
            impact = f"Low available Potassium ({k} kg/ha K2O). Weak stems, leaf margin firing/scorch, and severely reduced disease resistance."
            correction = "Increase Potassium (MOP or SOP) by 25-30%. Apply in 2 split doses."
            schedule.append(correction)
            if crop_key in ["banana", "tomato", "chilli"]:
                cautions.append(f"Potassium is vital for {crop_key.capitalize()} fruit sizing and disease resistance; deficiency makes plants highly vulnerable to fungal blights.")
        elif k <= 336.0:
            status = "Optimal"
            impact = f"Medium available Potassium ({k} kg/ha K2O). Good cell turgidity and stress tolerance."
            correction = "Apply standard recommended Potassium dose."
            schedule.append(correction)
        else:
            status = "High"
            impact = f"High available Potassium ({k} kg/ha K2O). May competitively inhibit root Magnesium and Calcium uptake."
            correction = "Reduce chemical Potash application by 25%."
            schedule.append(correction)

        return SoilParameterStatus(
            parameter="Available Potassium (K2O)",
            value=k,
            status=status,
            optimal_range="133 - 336 kg/ha",
            impact=impact,
            correction_guideline=correction
        )

    def _evaluate_micronutrient(
        self,
        name: str,
        val: float,
        crop_key: Optional[str],
        schedule: List[str],
        cautions: List[str]
    ) -> Optional[SoilParameterStatus]:
        name_clean = name.lower().strip()
        if "zinc" in name_clean:
            if val < 0.6:
                status = "Deficient / Very Low"
                impact = f"Zinc deficiency ({val} ppm). Causes little leaf, internode shortening, and chlorosis."
                correction = "Apply Zinc Sulphate (21%) @ 25 kg/ha basal or spray 0.5% ZnSO4 foliar."
                schedule.append(correction)
                if crop_key == "rice":
                    cautions.append("Zinc deficiency in rice leads directly to Khaira disease bronzing.")
            else:
                status = "Optimal"
                impact = f"Adequate Zinc ({val} ppm)."
                correction = "Maintain standard micronutrient schedule."
            return SoilParameterStatus(parameter="Zinc (Zn)", value=val, status=status, optimal_range="> 0.6 ppm", impact=impact, correction_guideline=correction)

        elif "iron" in name_clean:
            if val < 4.5:
                status = "Deficient / Very Low"
                impact = f"Iron deficiency ({val} ppm). Sharp interveinal chlorosis on youngest terminal leaves."
                correction = "Foliar spray with 1% FeSO4 + 0.1% Citric acid or Chelated Iron (Fe-EDTA) @ 1.5g/L."
                schedule.append(correction)
            else:
                status = "Optimal"
                impact = f"Adequate Iron ({val} ppm)."
                correction = "No amendment required."
            return SoilParameterStatus(parameter="Iron (Fe)", value=val, status=status, optimal_range="> 4.5 ppm", impact=impact, correction_guideline=correction)

        elif "boron" in name_clean:
            if val < 0.5:
                status = "Deficient / Very Low"
                impact = f"Boron deficiency ({val} ppm). Causes flower drop, poor pollination, and fruit cracking."
                correction = "Soil application of Borax @ 10 kg/ha or foliar spray of Solubor @ 1g/L at flowering."
                schedule.append(correction)
            else:
                status = "Optimal"
                impact = f"Adequate Boron ({val} ppm)."
                correction = "No amendment required."
            return SoilParameterStatus(parameter="Boron (B)", value=val, status=status, optimal_range="> 0.5 ppm", impact=impact, correction_guideline=correction)

        return None
