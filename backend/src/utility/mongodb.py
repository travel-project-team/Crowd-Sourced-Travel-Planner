# Handles validation for MongoDB

from bson import ObjectId
from fastapi import HTTPException

# Validates ObjectID format
def mongo_objectid(id_string: str) -> ObjectId:
    if not ObjectId.is_valid(id_string):
        raise HTTPException(status_code=400, detail="ID format is invalid")

    return ObjectId(id_string)