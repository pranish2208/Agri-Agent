import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from models.crop import CropData, CropListItem


class CropKnowledgeTool:
    """
    Authoritative crop knowledge repository management tool.
    Provides agronomic parameters, growth stages, spacing, irrigation, and nutrition.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent.parent / "data" / "crops"
        self.data_dir = data_dir
        self._crops_cache: Dict[str, CropData] = {}
        self._load_crops()

    def _load_crops(self):
        if not self.data_dir.exists():
            return

        for file in self.data_dir.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    crop_obj = CropData(**data)
                    self._crops_cache[crop_obj.id.lower()] = crop_obj
                    self._crops_cache[crop_obj.name.lower()] = crop_obj
            except Exception as e:
                print(f"Error loading crop data from {file}: {e}")

    def list_crops(self) -> List[CropListItem]:
        """
        Returns a summary list of all supported crops.
        """
        seen_ids = set()
        items = []
        for crop in self._crops_cache.values():
            if crop.id not in seen_ids:
                seen_ids.add(crop.id)
                items.append(CropListItem(
                    id=crop.id,
                    name=crop.name,
                    scientific_name=crop.scientific_name,
                    family=crop.family,
                    planting_seasons=crop.planting_seasons,
                    description=crop.description
                ))
        return items

    def get_crop(self, crop_name_or_id: str) -> Optional[CropData]:
        """
        Looks up crop by name (e.g. 'Tomato') or ID (e.g. 'tomato').
        """
        query = crop_name_or_id.lower().strip()
        if query in self._crops_cache:
            return self._crops_cache[query]

        # Substring search
        for key, crop in self._crops_cache.items():
            if query in key or key in query:
                return crop

        return None

    def get_stage_context(self, crop_name: str, growth_stage: Optional[str]) -> Dict[str, Any]:
        """
        Retrieves agronomic stage vulnerabilities and management priorities.
        """
        crop = self.get_crop(crop_name)
        if not crop:
            return {
                "matched_stage": growth_stage or "General",
                "water_need": "Moderate",
                "vulnerabilities": [],
                "activities": []
            }

        if not growth_stage:
            first_stage = crop.growth_stages[0] if crop.growth_stages else None
            return {
                "matched_stage": "All / Unspecified",
                "water_need": "Moderate",
                "vulnerabilities": crop.common_diseases + crop.common_pests,
                "activities": ["General field monitoring and balanced fertilization"]
            }

        stage_lower = growth_stage.lower()
        matched = None
        for s in crop.growth_stages:
            if s.stage_name.lower() in stage_lower or stage_lower in s.stage_name.lower():
                matched = s
                break

        # Keyword mapping if exact name didn't match
        if not matched:
            for s in crop.growth_stages:
                s_name = s.stage_name.lower()
                if "flower" in stage_lower and "flower" in s_name:
                    matched = s
                    break
                elif "fruit" in stage_lower and ("fruit" in s_name or "boll" in s_name or "pod" in s_name):
                    matched = s
                    break
                elif "seedling" in stage_lower or "nursery" in stage_lower:
                    if "seedling" in s_name or "nursery" in s_name:
                        matched = s
                        break
                elif "tiller" in stage_lower and "tiller" in s_name:
                    matched = s
                    break

        if matched:
            return {
                "matched_stage": matched.stage_name,
                "day_range": f"Day {matched.day_start} to {matched.day_end}",
                "description": matched.description,
                "water_need": matched.water_need,
                "vulnerabilities": matched.vulnerabilities,
                "activities": matched.critical_activities
            }

        return {
            "matched_stage": growth_stage,
            "water_need": "Moderate",
            "vulnerabilities": crop.common_diseases[:2] + crop.common_pests[:2],
            "activities": ["General scouting and pest monitoring"]
        }
