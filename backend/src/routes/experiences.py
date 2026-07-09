# Experiences backend routes 
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from src import config
from src.schemas.experiences import ExperiencesCreate
from src.utility.authentication import verify_user
from src.utility.mongodb import mongo_objectid, mongo_string
from pydantic import BaseModel

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])

# PUT
class ExperiencesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    location_geojson: Optional[dict] = None
    keywords: Optional[List[str]] = None
    image_url: Optional[str] = None

# Get All Experiences + Search (experiencesApi.getAll() & experiencesApi.search(params))
@router.get("")
def get_experiences(
    location: Optional[str] = Query(None, description="Filter by location name"),
    keyword: Optional[str] = Query(None, description="Filter by keyword, title, or description"),
    limit: int = Query(50, ge=1, le=100),
):
    query = {}
    if location:
        query["location_name"] = {"$regex": location, "$options": "i"}
    if keyword:
        query["$or"] = [
            {"keywords": {"$regex": keyword, "$options": "i"}},
            {"title": {"$regex": keyword, "$options": "i"}},
            {"description": {"$regex": keyword, "$options": "i"}},
        ]

    results = config.db.experiences.find(query).limit(limit)
    return [mongo_string(experience) for experience in results]

# Get Single Experience (experiencesApi.getById(id))
@router.get("/{experience_id}")
def get_experience(experience_id: str):
    experience = config.db.experiences.find_one({"_id": mongo_objectid(experience_id)})
    if experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")

    return mongo_string(experience)

# Create Experience (experiencesApi.create(data))
@router.post("", status_code=status.HTTP_201_CREATED)
def create_experience(experience_info: ExperiencesCreate, user=Depends(verify_user)):
    new_experience = experience_info.model_dump()
    new_experience["user_id"] = str(user["_id"])
    new_experience["created_at"] = datetime.now(timezone.utc)
    result = config.db.experiences.insert_one(new_experience)

    return {
        "message": "Experience created successfully",
        "id": str(result.inserted_id),
    }

# Update Experience (experiencesApi.update(id, data))
@router.put("/{experience_id}")
def update_experience(experience_id: str, data: ExperiencesUpdate, user=Depends(verify_user)):
    experience = config.db.experiences.find_one({"_id": mongo_objectid(experience_id)})
    if experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")
    if experience.get("user_id") != str(user["_id"]):
        raise HTTPException(status_code=403, detail="You can only edit your own experiences")

    data = data.model_dump(exclude_unset=True)

    if not data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    data.pop("_id", None)
    data.pop("user_id", None)
    data.pop("created_at", None)

    config.db.experiences.update_one(
        {"_id": mongo_objectid(experience_id)},
        {"$set": data}
    )
    return {"message": "Experience updated successfully"}

# Delete Experience: experiencesApi.remove(id)
@router.delete("/{experience_id}")
def remove_experience(experience_id: str, user=Depends(verify_user)):
    experience = config.db.experiences.find_one({"_id": mongo_objectid(experience_id)})
    if experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")
    if experience.get("user_id") != str(user["_id"]):
        raise HTTPException(status_code=403, detail="You can only delete your own experiences")
    config.db.experiences.delete_one({"_id": mongo_objectid(experience_id)})
    return {"message": "Experience deleted successfully"}