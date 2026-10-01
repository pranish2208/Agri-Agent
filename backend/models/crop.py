from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TemperatureRequirement(BaseModel):
    min_c: float = Field(..., description="Minimum tolerable temperature in Celsius")
    max_c: float = Field(..., description="Maximum tolerable temperature in Celsius")
    optimal_min_c: float = Field(..., description="Optimal minimum temperature")
    optimal_max_c: float = Field(..., description="Optimal maximum temperature")


class RainfallRequirement(BaseModel):
    min_annual_mm: float = Field(..., description="Minimum annual rainfall in mm")
    max_annual_mm: float = Field(..., description="Maximum annual rainfall in mm")
    optimal_annual_mm: float = Field(..., description="Optimal rainfall in mm")
    critical_stages: List[str] = Field(default_factory=list, description="Growth stages sensitive to water stress")


class SoilRequirement(BaseModel):
    suitable_types: List[str] = Field(..., description="Types of soil suitable for this crop")
    ph_min: float = Field(..., description="Minimum soil pH")
    ph_max: float = Field(..., description="Maximum soil pH")
    ph_optimal_min: float = Field(..., description="Optimal minimum soil pH")
    ph_optimal_max: float = Field(..., description="Optimal maximum soil pH")
    drainage_requirement: str = Field(..., description="Drainage conditions required")
    organic_matter_requirement: str = Field("Medium to High (>0.5% OC)", description="Required organic carbon level")


class Spacing(BaseModel):
    row_to_row_cm: float = Field(..., description="Distance between rows in cm")
    plant_to_plant_cm: float = Field(..., description="Distance between plants in cm")
    population_per_ha: Optional[int] = Field(None, description="Recommended plant population per hectare")


class GrowthStage(BaseModel):
    stage_name: str = Field(..., description="Name of growth stage (e.g. Seedling, Vegetative, Flowering)")
    day_start: int = Field(..., description="Start day after sowing/transplanting")
    day_end: int = Field(..., description="End day after sowing/transplanting")
    description: str = Field(..., description="Agronomic description of the stage")
    critical_activities: List[str] = Field(default_factory=list, description="Key management activities")
    water_need: str = Field("Moderate", description="Water sensitivity: Low, Moderate, High, Critical")
    vulnerabilities: List[str] = Field(default_factory=list, description="Pests or diseases common at this stage")


class IrrigationInfo(BaseModel):
    recommended_methods: List[str] = Field(..., description="e.g. Drip, Furrow, Basin, Sprinkler")
    total_water_requirement_mm: float = Field(..., description="Total water requirement throughout crop lifecycle")
    critical_stages: List[str] = Field(..., description="Critical growth stages where water stress causes yield drop")
    frequency_days: str = Field(..., description="General irrigation interval")


class NutrientPlan(BaseModel):
    nitrogen_kg_per_ha: float = Field(..., description="Recommended Nitrogen (N) in kg/ha")
    phosphorus_kg_per_ha: float = Field(..., description="Recommended Phosphorus (P2O5) in kg/ha")
    potassium_kg_per_ha: float = Field(..., description="Recommended Potassium (K2O) in kg/ha")
    basal_application: str = Field(..., description="Basal fertilizer schedule at planting")
    top_dressing_schedule: List[str] = Field(default_factory=list, description="Split application stages")
    micronutrient_requirements: List[str] = Field(default_factory=list, description="Zinc, Boron, Iron recommendations")


class HarvestingInfo(BaseModel):
    duration_days: str = Field(..., description="Days to maturity from sowing/transplanting")
    maturity_indices: List[str] = Field(..., description="Visual signs of harvest readiness")
    harvesting_method: str = Field(..., description="Manual or mechanical harvesting advice")
    average_yield_per_ha: str = Field(..., description="Expected average yield in tonnes/quintals per hectare")
    post_harvest_care: str = Field(..., description="Immediate drying, grading, or curing steps")


class CropData(BaseModel):
    id: str = Field(..., description="Unique slug for crop (e.g. 'tomato', 'rice')")
    name: str = Field(..., description="Common crop name")
    scientific_name: str = Field(..., description="Botanical name")
    family: str = Field(..., description="Plant family")
    description: str = Field(..., description="Overview and economic importance in India")
    climate: str = Field(..., description="Tropical, Sub-tropical, Temperate requirements")
    temperature: TemperatureRequirement
    rainfall: RainfallRequirement
    soil: SoilRequirement
    planting_seasons: List[str] = Field(..., description="Kharif, Rabi, Zaid or specific months")
    seed_rate_per_ha: str = Field(..., description="Recommended seed rate per hectare")
    spacing: Spacing
    growth_stages: List[GrowthStage]
    irrigation: IrrigationInfo
    nutrients: NutrientPlan
    common_pests: List[str] = Field(default_factory=list, description="Common pests affecting this crop")
    common_diseases: List[str] = Field(default_factory=list, description="Common diseases affecting this crop")
    harvesting: HarvestingInfo
    authoritative_sources: List[str] = Field(
        default=["ICAR (Indian Council of Agricultural Research)", "TNAU Agritech Portal", "FAO Crop Guidelines"],
        description="Scientific references"
    )


class CropListItem(BaseModel):
    id: str
    name: str
    scientific_name: str
    family: str
    planting_seasons: List[str]
    description: str
