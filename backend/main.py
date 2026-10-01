import os
import logging
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.crop import CropData, CropListItem
from models.analysis import (
    AnalyzeRequest,
    AnalyzeResponse,
    SoilAnalysisRequest,
    SoilAnalysisResponse,
    VisionAnalysisResponse,
    MarketDataResponse,
    WeatherReport
)
from rag.ingest import initialize_knowledge_base
from rag.retriever import AgriculturalRetriever
from tools.weather import WeatherTool
from tools.soil import SoilTool
from tools.crop_knowledge import CropKnowledgeTool
from tools.disease import DiseaseDiagnosisTool
from tools.market import MarketTool
from tools.vision import VisionAnalysisTool
from agent.orchestrator import AgriAgentOrchestrator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("agriagent")

# Directories
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

# Global tools & agent instances
crop_tool = CropKnowledgeTool(data_dir=DATA_DIR / "crops")
weather_tool = WeatherTool()
soil_tool = SoilTool()
disease_tool = DiseaseDiagnosisTool(data_dir=DATA_DIR)
market_tool = MarketTool()
vision_tool = VisionAnalysisTool(disease_tool=disease_tool)
orchestrator: Optional[AgriAgentOrchestrator] = None


def get_orchestrator() -> AgriAgentOrchestrator:
    global orchestrator
    if orchestrator is None:
        logger.info("Initializing AgriAgent Knowledge Base and Ingesting Agricultural Data...")
        vectorstore = initialize_knowledge_base(DATA_DIR)
        retriever = AgriculturalRetriever(vectorstore)
        orchestrator = AgriAgentOrchestrator(
            retriever=retriever,
            crop_tool=crop_tool,
            weather_tool=weather_tool,
            soil_tool=soil_tool,
            disease_tool=disease_tool,
            market_tool=market_tool
        )
        logger.info("AgriAgent AI Orchestrator initialized successfully and ready for farmer inquiries.")
    return orchestrator


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_orchestrator()
    yield
    logger.info("Shutting down AgriAgent backend.")


app = FastAPI(
    title="AgriAgent API — AI Agent for Farmer Decision Support",
    description=(
        "Production backend for the BharatAgentic Hackathon. "
        "Delivers a genuine agentic multi-factor reasoning workflow: "
        "Farmer Input → Classification → Agricultural RAG Knowledge Retrieval → "
        "Weather Analysis → Soil Health Evaluation → Pathology/Pest Diagnostics → "
        "Risk Assessment → IPM Action Plan Formulation."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configured to allow access from any external frontend laptop (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for container monitoring and frontend readiness verification.
    """
    return {
        "status": "healthy",
        "service": "AgriAgent Decision Support Backend",
        "agentic_workflow": "active",
        "supported_crops_count": len(crop_tool.list_crops())
    }


@app.get("/api/crops", response_model=List[CropListItem], tags=["Crops"])
async def list_supported_crops():
    """
    Returns the list of all supported crops (Rice, Tomato, Chilli, Banana, Coconut, Cotton, Groundnut, Pulses).
    """
    return crop_tool.list_crops()


@app.get("/api/crops/{crop}", response_model=CropData, tags=["Crops"])
async def get_crop_details(crop: str):
    """
    Retrieves complete agronomic specifications, climate, pH, growth stages,
    irrigation, fertilizer schedules, and harvesting standards for a specific crop.
    """
    crop_data = crop_tool.get_crop(crop)
    if not crop_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop '{crop}' not found in the agricultural knowledge repository."
        )
    return crop_data


@app.post("/api/analyze", response_model=AnalyzeResponse, tags=["Agentic Workflow"])
async def analyze_farmer_query(request: AnalyzeRequest):
    """
    Core Agentic Workflow Endpoint.

    Takes farmer input (crop, location, growth stage, symptoms, soil parameters),
    retrieves agricultural RAG literature, calls agro-meteorological and soil diagnostic tools,
    performs multi-factor reasoning, calculates risk, and returns a structured action plan.
    """
    try:
        orch = get_orchestrator()
        response = await orch.execute_workflow(request)
        return response
    except Exception as e:
        logger.error(f"Error during agentic workflow execution: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing agentic decision workflow: {str(e)}"
        )


@app.get("/api/weather", tags=["Tools"])
async def get_weather_advisory(location: str = Query(..., description="Village, District or City in India")):
    """
    Independent Agro-Meteorological Tool Endpoint.
    Fetches real-time temperature, humidity, rainfall forecast, fungal disease risk index, and spray window.
    """
    try:
        data = await weather_tool.get_weather(location)
        return data
    except Exception as e:
        logger.error(f"Weather lookup error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/soil/analyze", response_model=SoilAnalysisResponse, tags=["Tools"])
async def analyze_soil_test(request: SoilAnalysisRequest):
    """
    Independent Soil Testing & Amendment Tool Endpoint.
    Analyzes pH, EC, Organic Carbon, N, P, K, and micronutrients against ICAR benchmarks.
    """
    try:
        return soil_tool.analyze(soil=request.soil, crop=request.crop)
    except Exception as e:
        logger.error(f"Soil analysis error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/health/analyze-image", response_model=VisionAnalysisResponse, tags=["Tools"])
async def analyze_plant_image(
    file: UploadFile = File(..., description="Uploaded image file of affected plant leaf or crop"),
    crop: Optional[str] = Form(None, description="Optional target crop name (e.g. 'Tomato')")
):
    """
    Independent Computer Vision Diagnostic Tool Endpoint.
    Screens leaf image for chlorosis, necrotic lesion patterns, and symptom matches.
    Includes scientific disclaimer avoiding unsupported disease guarantees.
    """
    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

        result = vision_tool.analyze_image_bytes(image_bytes=image_bytes, crop_hint=crop)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/market", response_model=MarketDataResponse, tags=["Tools"])
async def get_mandi_market_data(
    crop: str = Query(..., description="Target crop name"),
    location: Optional[str] = Query(None, description="Optional location or district")
):
    """
    Independent Agricultural Market Tool Endpoint.
    Provides Mandi modal prices, MSP, price direction, and harvest timing advisory.
    """
    try:
        return market_tool.get_market_data(crop=crop, location=location)
    except Exception as e:
        logger.error(f"Market query error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
