from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

# POST for experiences collection
class ExperiencesCreate(BaseModel):
    user_id: str = Field(..., examples=["user_id_here"])
    title: str = Field(..., examples=["Canoeing underwater"])
    description: Optional[str] = Field(None, examples=["Took a canoe to Atlantis"])
    location_name: str = Field(..., examples=["Atlantis"])
    location_geojson: dict = Field(..., examples=[{"type": "Point", "coordinates": [-80.191788, 25.761681]}]) #Add validation logic in later
    ratings: Optional[List[int]] = Field(default=[], examples=[[5, 4, 3, 5]])
    average_rating: Optional[float] = Field(default=None, examples=[4.25])
    keywords: Optional[List[str]] = Field(default=[], examples=[["adventure", "water", "canoeing"]])
    image_url: Optional[str] = Field(None, examples=["https://example.com/image.jpg"])

# GET for experiences collection
class ExperiencesModel(ExperiencesCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )