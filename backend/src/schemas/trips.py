from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

# POST for trips collection
class TripsCreate(BaseModel):
    trip_name: str = Field(..., examples=["South Africa"])
    trip_description: Optional[str] = Field(None, examples=["Went to S Africa for a couple weeks."])
    owner_id: str = Field(..., examples=["user_id_here"])
    collaborator_ids: Optional[List[str]] = Field(default=[], examples=[["other_user_id_here", "another_user_id_here"]])
    experience_ids: Optional[List[str]] = Field(default=[], examples=[["experience_id_here", "another_experience_id_here"]])

# GET for trips collection
class TripsModel(TripsCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )