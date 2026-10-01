/**
 * AgriAgent Frontend API Types
 * Aligned with backend Pydantic models in /backend/models/
 */

export type Language = 'en' | 'ta';

// ─── Crop Library Types ──────────────────────────────────────────────────────

export interface CropListItem {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  planting_seasons: string[];
  description: string;
}

export interface TemperatureRequirement {
  min_c: number;
  max_c: number;
  optimal_min_c: number;
  optimal_max_c: number;
}

export interface RainfallRequirement {
  min_annual_mm: number;
  max_annual_mm: number;
  optimal_annual_mm: number;
  critical_stages: string[];
}

export interface SoilRequirement {
  suitable_types: string[];
  ph_min: number;
  ph_max: number;
  ph_optimal_min: number;
  ph_optimal_max: number;
  drainage_requirement: string;
  organic_matter_requirement: string;
}

export interface Spacing {
  row_to_row_cm: number;
  plant_to_plant_cm: number;
  population_per_ha?: number;
}

export interface GrowthStage {
  stage_name: string;
  day_start: number;
  day_end: number;
  description: string;
  critical_activities: string[];
  water_need: string;
  vulnerabilities: string[];
}

export interface IrrigationInfo {
  recommended_methods: string[];
  total_water_requirement_mm: number;
  critical_stages: string[];
  frequency_days: string;
}

export interface NutrientPlan {
  nitrogen_kg_per_ha: number;
  phosphorus_kg_per_ha: number;
  potassium_kg_per_ha: number;
  basal_application: string;
  top_dressing_schedule: string[];
  micronutrient_requirements: string[];
}

export interface HarvestingInfo {
  duration_days: string;
  maturity_indices: string[];
  harvesting_method: string;
  average_yield_per_ha: string;
  post_harvest_care: string;
}

export interface CropData {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  description: string;
  climate: string;
  temperature: TemperatureRequirement;
  rainfall: RainfallRequirement;
  soil: SoilRequirement;
  planting_seasons: string[];
  seed_rate_per_ha: string;
  spacing: Spacing;
  growth_stages: GrowthStage[];
  irrigation: IrrigationInfo;
  nutrients: NutrientPlan;
  common_pests: string[];
  common_diseases: string[];
  harvesting: HarvestingInfo;
  authoritative_sources: string[];
}

export interface CropDetail {
  id: string;
  name: string;
  nameTamil: string;
  scientificName: string;
  family?: string;
  category: string;
  season: string;
  durationDays: number;
  waterRequirement: string;
  image: string;
  summary: string;
  summaryTamil: string;
  climate: {
    temperature: string;
    rainfall: string;
    humidity: string;
    sunlight: string;
  };
  soil: {
    type: string;
    phRange: string;
    drainage: string;
    organicMatter: string;
  };
  planting: {
    seedRate: string;
    spacing: string;
    depth: string;
    method: string;
  };
  growthStages: {
    stage: string;
    stageTamil: string;
    days: string;
    description: string;
    descriptionTamil: string;
    keyPractices: string[];
    keyPracticesTamil: string[];
  }[];
  irrigation: {
    method: string;
    frequency: string;
    criticalStages: string[];
  };
  nutrients: {
    npkRatio: string;
    schedule: { stage: string; fertilizer: string; quantity: string }[];
  };
  pestsAndDiseases: {
    name: string;
    nameTamil: string;
    type?: string;
    severity: string;
    symptoms: string[];
    symptomsTamil: string[];
    prevention: string[];
    preventionTamil: string[];
    treatment: string[];
    treatmentTamil: string[];
  }[];
  harvesting: {
    indicators: string[];
    yieldPerAcre: string;
    postHarvest: string[];
  };
}

// ─── Analyze / Ask AgriAgent Types ───────────────────────────────────────────

export interface SoilDataInput {
  ph?: number;
  ec?: number;
  organic_carbon?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  micronutrients?: Record<string, number>;
}

export interface AnalyzeRequest {
  crop: string;
  location: string;
  growth_stage?: string;
  symptoms?: string;
  soil?: SoilDataInput;
}

export interface PossibleIssue {
  name: string;
  type: string;
  confidence: number;
  affected_part?: string;
  risk_factors: string[];
  description: string;
}

export interface WeatherReport {
  location: string;
  temperature_c: number;
  humidity_pct: number;
  rainfall_forecast_mm: number;
  condition: string;
  wind_speed_kmh: number;
  fungal_disease_risk: string;
  spray_advisory: string;
  advisory_notes: string[];
}

export interface AnalyzeResponse {
  summary: string;
  possible_issues: PossibleIssue[];
  weather: WeatherReport | Record<string, unknown>;
  risk_level: string;
  reasoning_factors: string[];
  recommendations: string[];
  things_to_avoid: string[];
  monitoring_steps: string[];
}

export interface AskAgriAgentInput {
  crop: string;
  location: string;
  growthStage: string;
  symptoms: string;
  image?: File | null;
  soil?: SoilDataInput;
}

export interface AskAgriAgentResponse {
  understanding: string;
  knowledgeRetrieved: string[];
  weatherFactor: string;
  reasoning: string;
  riskAssessment: string;
  actionPlan: {
    immediateSteps: string[];
    preventiveSteps: string[];
    dosageAdvice: string;
  };
  technicalDetails: any;
}

// ─── Soil Analysis Types ──────────────────────────────────────────────────────

export interface SoilAnalysisRequest {
  crop?: string;
  soil: SoilDataInput;
}

export interface SoilParameterStatus {
  parameter: string;
  value?: number;
  status: string;
  optimal_range: string;
  impact: string;
  correction_guideline: string;
}

export interface SoilAnalysisResponse {
  crop_context?: string;
  overall_health_score: number;
  ph_status: SoilParameterStatus;
  ec_status: SoilParameterStatus;
  organic_carbon_status: SoilParameterStatus;
  primary_nutrients: SoilParameterStatus[];
  micronutrient_status: SoilParameterStatus[];
  amendment_plan: string[];
  fertilizer_schedule: string[];
  cautions: string[];
}

// ─── Vision / Crop Health Types ───────────────────────────────────────────────

export interface VisionAnalysisResponse {
  crop?: string;
  visual_symptoms_detected: string[];
  color_distribution: Record<string, number>;
  estimated_damage_percentage: number;
  suspected_issues: PossibleIssue[];
  confidence_disclaimer: string;
  recommended_checks: string[];
}

export interface HealthAnalysisResponse {
  diseaseDetected: string;
  diseaseDetectedTamil: string;
  confidence: number;
  possibleIssues: string[];
  reasoningFactors: string[];
  recommendedSteps: string[];
  recommendedStepsTamil: string[];
  whatToMonitor: string[];
  technicalDetails: any;
}

// ─── Market Types ─────────────────────────────────────────────────────────────

export interface MarketDataResponse {
  crop: string;
  location: string;
  state: string;
  modal_price_per_quintal: number;
  min_price_per_quintal: number;
  max_price_per_quintal: number;
  msp_support_price?: number;
  price_trend: string;
  arrival_volume_tonnes: number;
  major_mandis: string[];
  marketing_advisory: string;
}

// ─── Local UI-only Types (for mockData / home dashboard display) ───────────────

export interface FarmData {
  farmerName: string;
  farmLocation: string;
  farmArea: number;
  soilType: string;
  irrigationType: string;
  crops: {
    cropId: string;
    cropName: string;
    plantingDate: string;
    currentStage: string;
    progressPercentage: number;
    healthStatus: 'Excellent' | 'Good' | 'Attention' | 'Critical';
  }[];
}

export interface LocalWeatherDisplay {
  location: string;
  temp: number;
  condition: string;
  conditionTamil: string;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  uvIndex: number;
  forecast: {
    day: string;
    dayTamil: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    rainProbability: number;
  }[];
  agriculturalAdvisory: string;
  agriculturalAdvisoryTamil: string;
}

export type WeatherData = LocalWeatherDisplay;

export interface SoilData {
  ph: number;
  phStatus: 'Acidic' | 'Optimal' | 'Alkaline';
  ec: number;
  organicCarbon: number;
  nitrogen: { value: number; unit: string; status: 'Low' | 'Medium' | 'High' };
  phosphorus: { value: number; unit: string; status: 'Low' | 'Medium' | 'High' };
  potassium: { value: number; unit: string; status: 'Low' | 'Medium' | 'High' };
  micronutrients: {
    zinc: 'Deficient' | 'Sufficient';
    iron: 'Deficient' | 'Sufficient';
    boron: 'Deficient' | 'Sufficient';
    manganese: 'Deficient' | 'Sufficient';
  };
  overallHealth: 'Optimal' | 'Fair' | 'Needs Attention';
  lastTested: string;
}

export interface MarketItem {
  id: string;
  cropName: string;
  cropNameTamil: string;
  marketName: string;
  currentPrice: number;
  unit: string;
  priceChangePercent: number;
  trend: 'Up' | 'Down' | 'Stable';
  lastUpdated: string;
  advisory: string;
  advisoryTamil: string;
}
