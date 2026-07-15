# Trips backend routes
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pymongo import ASCENDING, DESCENDING
from src import config
from src.schemas.trips import TripsCreate
from src.utility.authentication import verify_user
from src.utility.mongodb import mongo_objectid, mongo_string
from pydantic import BaseModel

router = APIRouter(prefix="/api/trips", tags=["Trips"])

class TripsUpdate(BaseModel):
    trip_name: Optional[str] = None
    trip_description: Optional[str] = None
    collaborator_ids: Optional[List[str]] = None
    experience_ids: Optional[List[str]] = None

def user_can_access(trip, user):
    '''Returns True if the user is the trip owner or a collaborator.'''
    user_id = str(user["_id"])
    return trip.get("owner_id") == user_id or user_id in trip.get("collaborator_ids", [])

# Whitelist of fields the client is allowed to sort by
TRIP_SORT_FIELDS = {"created_at", "updated_at", "trip_name"}

# Get All Trips for Current User (tripsApi.getAll())
@router.get("")
def get_trips(
    user=Depends(verify_user),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0, description="Number of results to skip (for pagination)"),
    sort: str = Query("updated_at", description="Field to sort by: created_at, updated_at, or trip_name"),
    order: str = Query("desc", description="Sort order: asc or desc"),
):
    if sort not in TRIP_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"Invalid sort field. Allowed: {sorted(TRIP_SORT_FIELDS)}")
    if order not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="Invalid order. Allowed: asc, desc")

    user_id = str(user["_id"])
    direction = ASCENDING if order == "asc" else DESCENDING
    results = (
        config.db.trips.find({
            "$or": [
                {"owner_id": user_id},
                {"collaborator_ids": user_id},
            ]
        })
        .sort(sort, direction)
        .skip(skip)
        .limit(limit)
    )
    return [mongo_string(trip) for trip in results]

# Get Single Trip (tripsApi.getById(id))
@router.get("/{trip_id}")
def get_trip(trip_id: str, user=Depends(verify_user)):
    trip = config.db.trips.find_one({"_id": mongo_objectid(trip_id)})

    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    if not user_can_access(trip, user):
        raise HTTPException(status_code=403, detail="You do not have access to this trip")

    return mongo_string(trip)

# Create Trip (tripsApi.create(data))
@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(trip_info: TripsCreate, user=Depends(verify_user)):
    new_trip = trip_info.model_dump()
    new_trip["owner_id"] = str(user["_id"])
    new_trip["created_at"] = datetime.now(timezone.utc)
    new_trip["updated_at"] = datetime.now(timezone.utc)

    result = config.db.trips.insert_one(new_trip)

    return {
        "message": "Trip created successfully",
        "id": str(result.inserted_id),
    }


# Update Trip (tripsApi.update(id, data))
@router.put("/{trip_id}")
def update_trip(trip_id: str, data: TripsUpdate, user=Depends(verify_user)):
    trip = config.db.trips.find_one({"_id": mongo_objectid(trip_id)})
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    if not user_can_access(trip, user):
        raise HTTPException(status_code=403, detail="You do not have access to this trip")

    data = data.model_dump(exclude_unset=True)

    if not data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    data.pop("_id", None)
    data.pop("owner_id", None)
    data.pop("created_at", None)
    data["updated_at"] = datetime.now(timezone.utc)

    config.db.trips.update_one(
        {"_id": mongo_objectid(trip_id)},
        {"$set": data}
    )
    return {"message": "Trip updated successfully"}

# Delete Trip (tripsApi.remove(id))
@router.delete("/{trip_id}")
def remove_trip(trip_id: str, user=Depends(verify_user)):
    trip = config.db.trips.find_one({"_id": mongo_objectid(trip_id)})

    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("owner_id") != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Only the trip owner can delete this trip")
    config.db.trips.delete_one({"_id": mongo_objectid(trip_id)})
    return {"message": "Trip deleted successfully"}

# Add an Experience to a Trip
@router.post("/{trip_id}/experiences/{experience_id}", status_code=status.HTTP_201_CREATED)
def add_experience_to_trip(trip_id: str, experience_id: str, user=Depends(verify_user)):
    trip = config.db.trips.find_one({"_id": mongo_objectid(trip_id)})
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not user_can_access(trip, user):
        raise HTTPException(status_code=403, detail="You do not have access to this trip")

    # Verify the experience actually exists before linking it
    if config.db.experiences.find_one({"_id": mongo_objectid(experience_id)}) is None:
        raise HTTPException(status_code=404, detail="Experience not found")

    # $addToSet is atomic and prevents duplicates
    config.db.trips.update_one(
        {"_id": mongo_objectid(trip_id)},
        {
            "$addToSet": {"experience_ids": experience_id},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        }
    )
    return {"message": "Experience added to trip"}

# Remove an Experience from a Trip
@router.delete("/{trip_id}/experiences/{experience_id}")
def remove_experience_from_trip(trip_id: str, experience_id: str, user=Depends(verify_user)):
    trip = config.db.trips.find_one({"_id": mongo_objectid(trip_id)})
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not user_can_access(trip, user):
        raise HTTPException(status_code=403, detail="You do not have access to this trip")

    # $pull is atomic
    config.db.trips.update_one(
        {"_id": mongo_objectid(trip_id)},
        {
            "$pull": {"experience_ids": experience_id},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        }
    )
    return {"message": "Experience removed from trip"}