import json
import os
from pathlib import Path
from typing import List, Dict, Any
from rag.vectorstore import AgriVectorStore


def load_json(filepath: Path) -> Any:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def build_knowledge_documents(data_dir: Path) -> List[Dict[str, Any]]:
    documents = []

    # 1. Ingest Crops
    crops_dir = data_dir / "crops"
    if crops_dir.exists():
        for file in crops_dir.glob("*.json"):
            data = load_json(file)
            crop_name = data.get("name", file.stem.capitalize())
            crop_id = data.get("id", file.stem)

            # Overview chunk
            overview_content = (
                f"Crop: {crop_name} ({data.get('scientific_name', '')}). Family: {data.get('family', '')}.\n"
                f"Description: {data.get('description', '')}\n"
                f"Climate: {data.get('climate', '')}\n"
                f"Temperature Requirement: Min {data.get('temperature', {}).get('min_c')}°C, "
                f"Max {data.get('temperature', {}).get('max_c')}°C, Optimal {data.get('temperature', {}).get('optimal_min_c')}-{data.get('temperature', {}).get('optimal_max_c')}°C.\n"
                f"Rainfall Requirement: {data.get('rainfall', {}).get('optimal_annual_mm')} mm/year. Critical stages: {', '.join(data.get('rainfall', {}).get('critical_stages', []))}."
            )
            documents.append({
                "doc_id": f"crop_overview_{crop_id}",
                "content": overview_content,
                "metadata": {
                    "crop": crop_name,
                    "crop_id": crop_id,
                    "category": "agronomy",
                    "title": f"{crop_name} Agronomy Overview & Climate",
                    "tags": [crop_name.lower(), "climate", "temperature", "rainfall", "seasons"]
                }
            })

            # Soil & Spacing chunk
            soil_data = data.get("soil", {})
            spacing_data = data.get("spacing", {})
            soil_content = (
                f"Crop: {crop_name} Soil & Planting Requirements:\n"
                f"Suitable Soil Types: {', '.join(soil_data.get('suitable_types', []))}\n"
                f"Soil pH Range: Min {soil_data.get('ph_min')}, Max {soil_data.get('ph_max')}, Optimal {soil_data.get('ph_optimal_min')}-{soil_data.get('ph_optimal_max')}.\n"
                f"Drainage: {soil_data.get('drainage_requirement', '')}\n"
                f"Spacing: Row {spacing_data.get('row_to_row_cm')} cm x Plant {spacing_data.get('plant_to_plant_cm')} cm. "
                f"Seed Rate: {data.get('seed_rate_per_ha', '')}.\n"
                f"Planting Seasons: {', '.join(data.get('planting_seasons', []))}."
            )
            documents.append({
                "doc_id": f"crop_soil_{crop_id}",
                "content": soil_content,
                "metadata": {
                    "crop": crop_name,
                    "crop_id": crop_id,
                    "category": "soil_planting",
                    "title": f"{crop_name} Soil & Planting Guide",
                    "tags": [crop_name.lower(), "soil", "ph", "spacing", "sowing", "nursery"]
                }
            })

            # Growth Stages chunk
            stages = data.get("growth_stages", [])
            stages_text = "\n".join([
                f"- Stage '{s.get('stage_name')}' (Day {s.get('day_start')}-{s.get('day_end')}): {s.get('description')} "
                f"Water need: {s.get('water_need')}. Key vulnerabilities: {', '.join(s.get('vulnerabilities', []))}."
                for s in stages
            ])
            documents.append({
                "doc_id": f"crop_stages_{crop_id}",
                "content": f"Crop: {crop_name} Phenological Growth Stages:\n{stages_text}",
                "metadata": {
                    "crop": crop_name,
                    "crop_id": crop_id,
                    "category": "growth_stages",
                    "title": f"{crop_name} Growth Stages & Vulnerabilities",
                    "tags": [crop_name.lower(), "growth stage", "phenology", "tillering", "flowering", "fruiting"]
                }
            })

            # Nutrients & Irrigation chunk
            nutrients = data.get("nutrients", {})
            irrigation = data.get("irrigation", {})
            nutrient_content = (
                f"Crop: {crop_name} Nutrition & Irrigation Plan:\n"
                f"Recommended NPK: N {nutrients.get('nitrogen_kg_per_ha')} kg/ha, P2O5 {nutrients.get('phosphorus_kg_per_ha')} kg/ha, K2O {nutrients.get('potassium_kg_per_ha')} kg/ha.\n"
                f"Basal Fertilizer: {nutrients.get('basal_application', '')}\n"
                f"Top Dressing: {'; '.join(nutrients.get('top_dressing_schedule', []))}\n"
                f"Micronutrients: {'; '.join(nutrients.get('micronutrient_requirements', []))}\n"
                f"Irrigation: Methods: {', '.join(irrigation.get('recommended_methods', []))}. Total water: {irrigation.get('total_water_requirement_mm')} mm. Critical stages: {', '.join(irrigation.get('critical_stages', []))}."
            )
            documents.append({
                "doc_id": f"crop_nutrition_{crop_id}",
                "content": nutrient_content,
                "metadata": {
                    "crop": crop_name,
                    "crop_id": crop_id,
                    "category": "nutrients_irrigation",
                    "title": f"{crop_name} Fertilization & Irrigation Schedule",
                    "tags": [crop_name.lower(), "fertilizer", "urea", "dap", "potash", "irrigation", "drip"]
                }
            })

            # Harvesting chunk
            harvesting = data.get("harvesting", {})
            harvest_content = (
                f"Crop: {crop_name} Harvesting & Post-Harvest Care:\n"
                f"Duration: {harvesting.get('duration_days', '')}\n"
                f"Maturity Indices: {'; '.join(harvesting.get('maturity_indices', []))}\n"
                f"Method: {harvesting.get('harvesting_method', '')}\n"
                f"Expected Yield: {harvesting.get('average_yield_per_ha', '')}\n"
                f"Post-Harvest Handling: {harvesting.get('post_harvest_care', '')}"
            )
            documents.append({
                "doc_id": f"crop_harvesting_{crop_id}",
                "content": harvest_content,
                "metadata": {
                    "crop": crop_name,
                    "crop_id": crop_id,
                    "category": "harvesting",
                    "title": f"{crop_name} Harvesting Indices & Yield",
                    "tags": [crop_name.lower(), "harvest", "yield", "maturity", "storage"]
                }
            })

    # 2. Ingest Diseases
    diseases_dir = data_dir / "diseases"
    if diseases_dir.exists():
        for file in diseases_dir.glob("*.json"):
            disease_list = load_json(file)
            for d in disease_list:
                name = d.get("disease_name", "")
                crop = d.get("crop", "")
                content = (
                    f"Disease: {name} in {crop}\n"
                    f"Pathogen: {d.get('pathogen', '')}\n"
                    f"Affected Plant Part: {d.get('affected_plant_part', '')}\n"
                    f"Symptoms: {d.get('symptoms', '')}\n"
                    f"Favorable Conditions: {d.get('favorable_conditions', '')}\n"
                    f"Risk Factors: {d.get('risk_factors', '')}\n"
                    f"Prevention: {d.get('prevention', '')}\n"
                    f"Management & Chemical/Biological Control: {d.get('management', '')}"
                )
                doc_id = f"disease_{crop}_{name}".lower().replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "")
                documents.append({
                    "doc_id": doc_id,
                    "content": content,
                    "metadata": {
                        "crop": crop,
                        "category": "disease",
                        "title": f"{name} on {crop}",
                        "tags": [crop.lower(), name.lower(), "disease", "fungicide", "symptoms", "blight", "rot", "wilt", "spots"]
                    }
                })

    # 3. Ingest Pests
    pests_dir = data_dir / "pests"
    if pests_dir.exists():
        for file in pests_dir.glob("*.json"):
            pest_list = load_json(file)
            for p in pest_list:
                name = p.get("pest_name", "")
                crop = p.get("crop", "")
                content = (
                    f"Pest: {name} in {crop} ({p.get('scientific_name', '')})\n"
                    f"Identification: {p.get('identification', '')}\n"
                    f"Damage Symptoms: {p.get('symptoms', '')}\n"
                    f"Favorable Weather/Conditions: {p.get('conditions', '')}\n"
                    f"Prevention & Traps: {p.get('prevention', '')}\n"
                    f"Management & IPM: {p.get('management', '')}"
                )
                doc_id = f"pest_{crop}_{name}".lower().replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "")
                documents.append({
                    "doc_id": doc_id,
                    "content": content,
                    "metadata": {
                        "crop": crop,
                        "category": "pest",
                        "title": f"{name} Infestation on {crop}",
                        "tags": [crop.lower(), name.lower(), "pest", "insecticide", "borer", "thrips", "whitefly", "caterpillar", "mite"]
                    }
                })

    # 4. Ingest Nutrients
    nutrients_file = data_dir / "nutrients" / "crop_nutrients.json"
    if nutrients_file.exists():
        nutrient_data = load_json(nutrients_file)
        for n in nutrient_data.get("nutrients", []):
            elem = n.get("element", "")
            manifestations = n.get("crop_specific_manifestations", {})
            crop_manifest_text = "\n".join([f"- In {c}: {m}" for c, m in manifestations.items()])
            content = (
                f"Nutrient: {elem} ({n.get('symbol', '')})\n"
                f"Agronomic Role: {n.get('role', '')}\n"
                f"Deficiency Symptoms: {n.get('deficiency_symptoms', '')}\n"
                f"Affected Part: {n.get('affected_plant_part', '')}\n"
                f"Crop Specific Symptoms:\n{crop_manifest_text}\n"
                f"Remediation / Corrective Sprays: {n.get('remediation', '')}"
            )
            documents.append({
                "doc_id": f"nutrient_{elem.lower()}",
                "content": content,
                "metadata": {
                    "crop": "All",
                    "category": "general_nutrient",
                    "title": f"{elem} Deficiency Symptoms and Correction",
                    "tags": [elem.lower(), "deficiency", "chlorosis", "fertilizer", "nutrition", "yellowing", "necrosis"]
                }
            })

    # 5. Ingest Soil Standards
    soil_file = data_dir / "soil" / "soil_standards.json"
    if soil_file.exists():
        soil_data = load_json(soil_file).get("soil_standards", {})
        ph_text = "\n".join([f"- {r.get('category')} (pH {r.get('min')}-{r.get('max')}): {r.get('interpretation')}. Remedy: {r.get('amendment')}" for r in soil_data.get("ph_ranges", [])])
        ec_text = "\n".join([f"- {r.get('category')}: {r.get('interpretation')}" for r in soil_data.get("electrical_conductivity_ds_m", [])])
        content = (
            f"Soil Health & Chemical Standards (ICAR Guidelines):\n"
            f"Soil pH Classifications & Remedies:\n{ph_text}\n\n"
            f"Electrical Conductivity (Salinity):\n{ec_text}\n\n"
            f"Organic Carbon Benchmarks: Low (<0.5%), Medium (0.5-0.75%), High (>0.75%).\n"
            f"Available Nitrogen (kg/ha): Low (<280), Medium (280-560), High (>560).\n"
            f"Available Phosphorus (kg/ha P2O5): Low (<23), Medium (23-57), High (>57).\n"
            f"Available Potassium (kg/ha K2O): Low (<133), Medium (133-336), High (>336)."
        )
        documents.append({
            "doc_id": "soil_standards_icar",
            "content": content,
            "metadata": {
                "crop": "All",
                "category": "soil",
                "title": "ICAR Soil Test Interpretation and Amendment Standards",
                "tags": ["soil", "ph", "ec", "salinity", "organic carbon", "nitrogen", "phosphorus", "potassium", "lime", "gypsum"]
            }
        })

    return documents


def initialize_knowledge_base(data_dir: Path) -> AgriVectorStore:
    vectorstore = AgriVectorStore()
    docs = build_knowledge_documents(data_dir)
    vectorstore.add_documents(docs)
    print(f"Indexed {len(docs)} agricultural knowledge passages into vectorstore.")
    return vectorstore
