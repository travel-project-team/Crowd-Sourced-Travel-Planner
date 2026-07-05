from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

# POST for users collection
class UsersCreate(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])
    email: str = Field(..., examples=["billie.billerson@example.com"])
    password_hash: str = Field(..., examples=["hashed_password_here"]) # Will add encryption logic later

# GET for users collection
class UsersModel(UsersCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )