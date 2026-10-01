from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class LocationInfo(BaseModel):
    name: str = Field(..., description="Village, District or State in India (e.g. 'Coimbatore, Tamil Nadu')")
    state: Optional[str] = Field(None, description="State name")
    latitude: Optional[float] = Field(None, description="Geographical latitude")
    longitude: Optional[float] = Field(None, description="Geographical longitude")


class FarmerProfile(BaseModel):
    farmer_id: Optional[str] = Field(None, description="Unique identifier for the farmer")
    name: Optional[str] = Field(None, description="Farmer name")
    contact: Optional[str] = Field(None, description="Phone number or identifier")
    location: LocationInfo
    farm_size_acres: Optional[float] = Field(None, description="Holding size in acres")
    primary_crop: Optional[str] = Field(None, description="Current primary crop")
    soil_type: Optional[str] = Field(None, description="Soil type on farm")
    language: Optional[str] = Field("en", description="Preferred language (en, hi, ta, te, kn, mr, etc.)")
