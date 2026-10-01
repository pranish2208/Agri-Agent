from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class SoilDataInput(BaseModel):
    ph: Optional[float] = Field(None, description="Soil pH value (typically 4.0 - 9.5)")
    ec: Optional[float] = Field(None, description="Electrical Conductivity in dS/m (salinity indicator)")
    organic_carbon: Optional[float] = Field(None, description="Organic Carbon percentage (%)")
    nitrogen: Optional[float] = Field(None, description="Available Nitrogen in kg/ha")
    phosphorus: Optional[float] = Field(None, description="Available Phosphorus (P2O5) in kg/ha")
    potassium: Optional[float] = Field(None, description="Available Potassium (K2O) in kg/ha")
    micronutrients: Optional[Dict[str, float]] = Field(
        default_factory=dict,
        description="Micronutrients in ppm/mg/kg (e.g. {'zinc': 0.8, 'iron': 4.5, 'boron': 0.4})"
    )


class AnalyzeRequest(BaseModel):
    crop: str = Field(..., description="Target crop (e.g. 'Rice', 'Tomato', 'Chilli', 'Cotton')")
    location: str = Field(..., description="Location of farm (e.g. 'Coimbatore, Tamil Nadu' or 'Guntur, Andhra Pradesh')")
    growth_stage: Optional[str] = Field(None, description="Current growth stage (e.g. 'Vegetative', 'Flowering', 'Fruiting')")
    symptoms: Optional[str] = Field(None, description="Observed plant symptoms, pest signs, or discoloration")
    soil: Optional[SoilDataInput] = Field(None, description="Soil chemical properties if known")


class PossibleIssue(BaseModel):
    name: str = Field(..., description="Name of the disease, pest, nutrient deficiency, or stress")
    type: str = Field(..., description="'disease', 'pest', 'nutrient_deficiency', or 'physiological_stress'")
    confidence: float = Field(..., description="Estimated diagnostic confidence between 0.0 and 1.0")
    affected_part: Optional[str] = Field(None, description="Leaves, stems, flowers, roots, or fruit")
    risk_factors: List[str] = Field(default_factory=list, description="Predisposing environmental or cultural factors")
    description: str = Field(..., description="Agronomic description of symptoms and pathology")


class WeatherReport(BaseModel):
    location: str
    temperature_c: float
    humidity_pct: float
    rainfall_forecast_mm: float
    condition: str
    wind_speed_kmh: float
    fungal_disease_risk: str = Field(..., description="'Low', 'Moderate', 'High', or 'Extreme'")
    spray_advisory: str = Field(..., description="Safe or Unsafe to spray foliar chemicals/fertilizers")
    advisory_notes: List[str] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    summary: str = Field(..., description="Executive agronomic diagnosis and field situation assessment")
    possible_issues: List[PossibleIssue] = Field(..., description="Ranked candidate diseases, pests, or deficiencies")
    weather: Union[WeatherReport, Dict[str, Any]] = Field(..., description="Real-time/forecast agro-meteorological metrics")
    risk_level: str = Field(..., description="Overall risk rating: 'Low', 'Moderate', 'High', or 'Critical'")
    reasoning_factors: List[str] = Field(..., description="Agentic multi-factor reasoning synthesis connecting stage, weather, soil, and symptoms")
    recommendations: List[str] = Field(..., description="Actionable immediate and preventive agronomic steps")
    things_to_avoid: List[str] = Field(..., description="Common agricultural mistakes and contraindicated practices")
    monitoring_steps: List[str] = Field(..., description="Scheduled follow-up observations at 3, 7, and 14 days")


class SoilAnalysisRequest(BaseModel):
    crop: Optional[str] = Field(None, description="Optional target crop to contextualize requirements")
    soil: SoilDataInput = Field(..., description="Soil test values")


class SoilParameterStatus(BaseModel):
    parameter: str
    value: Optional[float]
    status: str = Field(..., description="'Deficient / Very Low', 'Low', 'Optimal', 'High', 'Excessive / Toxic'")
    optimal_range: str
    impact: str
    correction_guideline: str


class SoilAnalysisResponse(BaseModel):
    crop_context: Optional[str]
    overall_health_score: int = Field(..., description="Score out of 100")
    ph_status: SoilParameterStatus
    ec_status: SoilParameterStatus
    organic_carbon_status: SoilParameterStatus
    primary_nutrients: List[SoilParameterStatus]
    micronutrient_status: List[SoilParameterStatus]
    amendment_plan: List[str]
    fertilizer_schedule: List[str]
    cautions: List[str]


class VisionAnalysisResponse(BaseModel):
    crop: Optional[str]
    visual_symptoms_detected: List[str]
    color_distribution: Dict[str, float]
    estimated_damage_percentage: float
    suspected_issues: List[PossibleIssue]
    confidence_disclaimer: str = Field(
        "Preliminary AI visual screening. Not a certified laboratory diagnosis. Verify with local KVK / agricultural officer before chemical application."
    )
    recommended_checks: List[str]


class MarketDataResponse(BaseModel):
    crop: str
    location: str
    state: str
    modal_price_per_quintal: float
    min_price_per_quintal: float
    max_price_per_quintal: float
    msp_support_price: Optional[float]
    price_trend: str = Field(..., description="'Rising', 'Stable', 'Declining'")
    arrival_volume_tonnes: float
    major_mandis: List[str]
    marketing_advisory: str
