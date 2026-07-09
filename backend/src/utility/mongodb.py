# Handles validation for MongoDB

from bson import ObjectId
from fastapi import HTTPException


# Convert user ID string to MongoDB ObjectID 
#
# From frontend to database
def mongo_objectid(id_string: str) -> ObjectId:
    if not ObjectId.is_valid(id_string):
        raise HTTPException(status_code=400, detail="ID format is invalid")

    return ObjectId(id_string)


# Convert MongoDB ObjectID to user ID string 
#
# From database to frontend
def mongo_string(document: dict | None) -> dict | None:
    if document and "_id" in document:
        document["_id"] = str(document["_id"])
    return document