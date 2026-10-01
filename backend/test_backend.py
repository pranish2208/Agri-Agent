import asyncio
import json
from pathlib import Path
from rag.ingest import initialize_knowledge_base
from rag.retriever import AgriculturalRetriever
from tools.crop_knowledge import CropKnowledgeTool
from tools.weather import WeatherTool
from tools.soil import SoilTool
from tools.disease import DiseaseDiagnosisTool
from tools.market import MarketTool
from tools.vision import VisionAnalysisTool
from agent.orchestrator import AgriAgentOrchestrator
from models.analysis import AnalyzeRequest, SoilDataInput


async def run_tests():
    print("--- 1. Testing Data Loading and Vectorstore Ingestion ---")
    data_dir = Path(__file__).parent / "data"
    vectorstore = initialize_knowledge_base(data_dir)
    retriever = AgriculturalRetriever(vectorstore)
    results = retriever.retrieve("Tomato early blight concentric rings", crop="Tomato", top_k=2)
    print(f"Retrieved {len(results)} docs for Tomato Early Blight. Top doc: {results[0]['metadata']['title']}")
    assert len(results) > 0

    print("\n--- 2. Testing Crop Knowledge Tool ---")
    crop_tool = CropKnowledgeTool(data_dir / "crops")
    crops = crop_tool.list_crops()
    print(f"Supported crops count: {len(crops)}")
    crop_names = [c.name for c in crops]
    print(f"Crops: {crop_names}")
    assert len(crops) >= 8

    tomato = crop_tool.get_crop("Tomato")
    print(f"Found crop: {tomato.name} ({tomato.scientific_name})")
    assert tomato.id == "tomato"

    print("\n--- 3. Testing Weather Tool ---")
    weather_tool = WeatherTool()
    weather = await weather_tool.get_weather("Vellore, Tamil Nadu")
    print(f"Weather for Vellore: {weather['temperature_c']}°C, {weather['humidity_pct']}% RH, Risk: {weather['fungal_disease_risk']}, Spray: {weather['spray_advisory']}")
    assert "temperature_c" in weather
    assert "fungal_disease_risk" in weather

    print("\n--- 4. Testing Soil Tool ---")
    soil_tool = SoilTool()
    soil_input = SoilDataInput(
        ph=6.2,
        ec=0.4,
        organic_carbon=0.55,
        nitrogen=180,
        phosphorus=18,
        potassium=160
    )
    soil_res = soil_tool.analyze(soil_input, crop="Tomato")
    print(f"Soil Health Score: {soil_res.overall_health_score}/100, pH status: {soil_res.ph_status.status}")
    assert soil_res.overall_health_score > 0

    print("\n--- 5. Testing Disease Diagnosis Tool ---")
    disease_tool = DiseaseDiagnosisTool(data_dir)
    diagnoses = disease_tool.diagnose(
        crop="Tomato",
        symptoms="Yellowing of lower leaves, brown circular spots with concentric rings",
        growth_stage="Flowering / Fruit Setting",
        weather=weather,
        soil=soil_input.model_dump()
    )
    print(f"Top diagnosed issue: {diagnoses[0].name} (Confidence: {diagnoses[0].confidence})")
    print(f"Risk factors: {diagnoses[0].risk_factors}")
    assert "Early Blight" in diagnoses[0].name

    print("\n--- 6. Testing Market Tool ---")
    market_tool = MarketTool()
    market = market_tool.get_market_data(crop="Tomato", location="Vellore, Tamil Nadu")
    print(f"Market for Tomato: Modal Price Rs {market.modal_price_per_quintal}/q, Trend: {market.price_trend}")
    assert market.modal_price_per_quintal > 0

    print("\n--- 7. Testing Computer Vision Tool ---")
    vision_tool = VisionAnalysisTool(disease_tool)
    from PIL import Image
    import io
    # Create sample dummy leaf image (green with yellow/brown spots)
    img = Image.new("RGB", (100, 100), color=(34, 139, 34))
    for x in range(30, 60):
        for y in range(30, 60):
            img.putpixel((x, y), (139, 69, 19)) # Brown necrotic spot
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    v_res = vision_tool.analyze_image_bytes(buf.getvalue(), crop_hint="Tomato")
    print(f"Vision Analysis damage: {v_res.estimated_damage_percentage}%, Symptoms: {v_res.visual_symptoms_detected}")
    assert len(v_res.visual_symptoms_detected) > 0

    print("\n--- 8. Testing Full Agentic Orchestrator ---")
    orchestrator = AgriAgentOrchestrator(
        retriever=retriever,
        crop_tool=crop_tool,
        weather_tool=weather_tool,
        soil_tool=soil_tool,
        disease_tool=disease_tool,
        market_tool=market_tool
    )

    req = AnalyzeRequest(
        crop="Tomato",
        location="Vellore, Tamil Nadu",
        growth_stage="Flowering / Fruit Setting",
        symptoms="Yellowing of lower leaves, brown circular spots with concentric rings",
        soil=soil_input
    )
    res = await orchestrator.execute_workflow(req)
    print("\n*** FULL AGENTIC RESPONSE ***")
    print(f"Summary: {res.summary}")
    print(f"Risk Level: {res.risk_level}")
    print(f"Reasoning Factors ({len(res.reasoning_factors)}):")
    for f in res.reasoning_factors:
        print(f"  - {f}")
    print(f"Recommendations ({len(res.recommendations)}):")
    for r in res.recommendations:
        print(f"  - {r}")
    print(f"Things to Avoid ({len(res.things_to_avoid)}):")
    for a in res.things_to_avoid:
        print(f"  - {a}")
    print(f"Monitoring Steps ({len(res.monitoring_steps)}):")
    for m in res.monitoring_steps:
        print(f"  - {m}")

    # Validate output schema
    assert res.summary
    assert len(res.possible_issues) > 0
    assert res.weather
    assert res.risk_level in ["Low", "Moderate", "High", "Critical"]
    assert len(res.reasoning_factors) > 0
    assert len(res.recommendations) > 0
    assert len(res.things_to_avoid) > 0
    assert len(res.monitoring_steps) > 0

    print("\nALL BACKEND UNIT AND AGENTIC TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_tests())
