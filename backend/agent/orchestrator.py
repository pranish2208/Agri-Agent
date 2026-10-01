import logging
from typing import Dict, Any, Optional
from models.analysis import AnalyzeRequest, AnalyzeResponse
from tools.weather import WeatherTool
from tools.soil import SoilTool
from tools.crop_knowledge import CropKnowledgeTool
from tools.disease import DiseaseDiagnosisTool
from tools.market import MarketTool
from rag.retriever import AgriculturalRetriever
from agent.reasoning import AgriReasoningEngine
from agent.decision import AgriDecisionEngine
from agent.prompts import PROBLEM_CLASSIFICATION_RULES

logger = logging.getLogger(__name__)


class AgriAgentOrchestrator:
    """
    AgriAgent Orchestrator — Implements a genuine agentic multi-step workflow
    for Farmer Decision Support:

    Farmer Input
    → Understand Request
    → Classify Problem
    → Determine Required Information
    → Retrieve Agricultural Knowledge (RAG)
    → Use Weather Tool
    → Use Soil Information Tool
    → Optional Vision / Diagnostic Analysis
    → Reason Over Information
    → Risk Assessment
    → Generate Action Plan
    → Return Structured Response
    """

    def __init__(
        self,
        retriever: AgriculturalRetriever,
        crop_tool: Optional[CropKnowledgeTool] = None,
        weather_tool: Optional[WeatherTool] = None,
        soil_tool: Optional[SoilTool] = None,
        disease_tool: Optional[DiseaseDiagnosisTool] = None,
        market_tool: Optional[MarketTool] = None
    ):
        self.retriever = retriever
        self.crop_tool = crop_tool or CropKnowledgeTool()
        self.weather_tool = weather_tool or WeatherTool()
        self.soil_tool = soil_tool or SoilTool()
        self.disease_tool = disease_tool or DiseaseDiagnosisTool()
        self.market_tool = market_tool or MarketTool()
        self.reasoning_engine = AgriReasoningEngine()
        self.decision_engine = AgriDecisionEngine()

    async def execute_workflow(self, request: AnalyzeRequest) -> AnalyzeResponse:
        """
        Executes the full agentic multi-factor reasoning pipeline.
        """
        crop = request.crop.strip()
        location = request.location.strip()
        growth_stage = request.growth_stage.strip() if request.growth_stage else None
        symptoms = request.symptoms.strip() if request.symptoms else ""

        # Step 1 & 2: Understand Request & Extract Entities
        logger.info(f"[Step 1 & 2: Understand Request] Crop: {crop}, Location: {location}, Stage: {growth_stage}")
        crop_info = self.crop_tool.get_crop(crop)
        stage_context = self.crop_tool.get_stage_context(crop, growth_stage)

        # Step 3: Classify Problem Domain
        classification = self._classify_problem(symptoms)
        logger.info(f"[Step 3: Classify Problem] Identified category: {classification}")

        # Step 4: Determine Required Information
        # Formulate targeted semantic RAG query
        rag_query = f"{crop} {growth_stage or ''} {symptoms} {classification}"
        logger.info(f"[Step 4: Determine Required Info] Semantic query: {rag_query}")

        # Step 5: Retrieve Agricultural Knowledge (RAG)
        retrieved_context = self.retriever.get_relevant_context(query=rag_query, crop=crop, top_k=4)
        logger.info("[Step 5: Retrieve Knowledge] Agricultural knowledge passages retrieved successfully.")

        # Step 6: Use Weather Tool (Agro-Meteorological Analysis)
        logger.info(f"[Step 6: Weather Tool] Fetching weather and disease indices for {location}")
        weather_data = await self.weather_tool.get_weather(location)

        # Step 7: Use Soil Information Tool
        soil_analysis_result = None
        soil_dict = None
        if request.soil:
            logger.info("[Step 7: Soil Information Tool] Analyzing farmer soil test parameters")
            analysis_obj = self.soil_tool.analyze(request.soil, crop=crop)
            soil_analysis_result = analysis_obj.model_dump()
            soil_dict = request.soil.model_dump()
        else:
            logger.info("[Step 7: Soil Information Tool] No soil test provided; proceeding with regional defaults")

        # Step 8: Multi-criteria Disease & Pest Diagnosis
        logger.info("[Step 8: Diagnostic Analysis] Cross-matching symptoms against pathological & pest signatures")
        possible_issues = self.disease_tool.diagnose(
            crop=crop,
            symptoms=symptoms,
            growth_stage=growth_stage,
            weather=weather_data,
            soil=soil_dict
        )

        # Step 9 & 10: Multi-Factor Reasoning & Risk Assessment
        logger.info("[Step 9 & 10: Reason Over Info & Risk Assessment] Synthesizing phenology, climate, soil, and symptoms")
        reasoning_result = self.reasoning_engine.reason(
            crop=crop,
            growth_stage=growth_stage,
            symptoms=symptoms,
            weather=weather_data,
            soil_analysis=soil_analysis_result,
            possible_issues=possible_issues,
            retrieved_context=retrieved_context
        )
        risk_level = reasoning_result["risk_level"]
        reasoning_factors = reasoning_result["reasoning_factors"]

        # Step 11: Generate Action Plan
        logger.info(f"[Step 11: Generate Action Plan] Risk level is {risk_level}; formulating IPM action plan")
        plan = self.decision_engine.generate_plan(
            crop=crop,
            location=location,
            growth_stage=growth_stage,
            weather=weather_data,
            soil_analysis=soil_analysis_result,
            possible_issues=possible_issues,
            risk_level=risk_level
        )

        # Step 12: Return Structured Response matching exact required schema
        logger.info("[Step 12: Return Structured Response] Assembling final AnalyzeResponse payload")
        return AnalyzeResponse(
            summary=plan["summary"],
            possible_issues=possible_issues,
            weather=weather_data,
            risk_level=risk_level,
            reasoning_factors=reasoning_factors,
            recommendations=plan["recommendations"],
            things_to_avoid=plan["things_to_avoid"],
            monitoring_steps=plan["monitoring_steps"]
        )

    def _classify_problem(self, symptoms: str) -> str:
        s_lower = symptoms.lower()
        if not s_lower:
            return "GENERAL_AGRONOMY"

        scores = {k: 0 for k in PROBLEM_CLASSIFICATION_RULES}
        for category, keywords in PROBLEM_CLASSIFICATION_RULES.items():
            for kw in keywords:
                if kw in s_lower:
                    scores[category] += 1

        top_cat = max(scores, key=scores.get)
        return top_cat if scores[top_cat] > 0 else "PATHOLOGY"
