import asyncio
import io
import httpx
from PIL import Image
from main import app


async def test_all_api_endpoints():
    print("Testing FastAPI Endpoints with ASGI Transport...")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /health
        res = await client.get("/health")
        print(f"1. GET /health -> Status: {res.status_code}, Body: {res.json()}")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. GET /api/crops
        res = await client.get("/api/crops")
        print(f"2. GET /api/crops -> Status: {res.status_code}, Count: {len(res.json())}")
        assert res.status_code == 200
        assert len(res.json()) >= 8

        # 3. GET /api/crops/tomato
        res = await client.get("/api/crops/tomato")
        print(f"3. GET /api/crops/tomato -> Status: {res.status_code}, Name: {res.json()['name']}, Family: {res.json()['family']}")
        assert res.status_code == 200
        assert res.json()["id"] == "tomato"

        # 4. POST /api/analyze
        payload = {
            "crop": "Tomato",
            "location": "Vellore, Tamil Nadu",
            "growth_stage": "Flowering / Fruit Setting",
            "symptoms": "Yellowing of lower leaves, brown circular spots with concentric rings",
            "soil": {
                "ph": 6.2,
                "ec": 0.4,
                "organic_carbon": 0.55,
                "nitrogen": 180,
                "phosphorus": 18,
                "potassium": 160
            }
        }
        res = await client.post("/api/analyze", json=payload)
        print(f"4. POST /api/analyze -> Status: {res.status_code}")
        data = res.json()
        print(f"   Summary: {data['summary'][:120]}...")
        print(f"   Risk: {data['risk_level']}")
        print(f"   Possible Issues: {[i['name'] for i in data['possible_issues']]}")
        assert res.status_code == 200
        assert "summary" in data
        assert "possible_issues" in data
        assert "weather" in data
        assert "risk_level" in data
        assert "reasoning_factors" in data
        assert "recommendations" in data
        assert "things_to_avoid" in data
        assert "monitoring_steps" in data

        # 5. GET /api/weather
        res = await client.get("/api/weather?location=Vellore,%20Tamil%20Nadu")
        print(f"5. GET /api/weather -> Status: {res.status_code}, Temp: {res.json().get('temperature_c')}°C")
        assert res.status_code == 200

        # 6. POST /api/soil/analyze
        soil_payload = {
            "crop": "Tomato",
            "soil": {
                "ph": 6.2,
                "ec": 0.4,
                "organic_carbon": 0.55,
                "nitrogen": 180,
                "phosphorus": 18,
                "potassium": 160
            }
        }
        res = await client.post("/api/soil/analyze", json=soil_payload)
        print(f"6. POST /api/soil/analyze -> Status: {res.status_code}, Health Score: {res.json()['overall_health_score']}")
        assert res.status_code == 200
        assert res.json()["overall_health_score"] > 0

        # 7. POST /api/health/analyze-image
        img = Image.new("RGB", (100, 100), color=(50, 150, 50))
        for x in range(20, 50):
            for y in range(20, 50):
                img.putpixel((x, y), (120, 60, 20))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        files = {"file": ("leaf.jpg", img_bytes, "image/jpeg")}
        data_form = {"crop": "Tomato"}
        res = await client.post("/api/health/analyze-image", files=files, data=data_form)
        print(f"7. POST /api/health/analyze-image -> Status: {res.status_code}, Symptoms: {res.json()['visual_symptoms_detected']}")
        assert res.status_code == 200
        assert "visual_symptoms_detected" in res.json()

        # 8. GET /api/market
        res = await client.get("/api/market?crop=Tomato&location=Vellore")
        print(f"8. GET /api/market -> Status: {res.status_code}, Modal: Rs {res.json()['modal_price_per_quintal']}")
        assert res.status_code == 200
        assert res.json()["modal_price_per_quintal"] > 0

    print("\nALL 8 API ENDPOINTS VALIDATED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(test_all_api_endpoints())
