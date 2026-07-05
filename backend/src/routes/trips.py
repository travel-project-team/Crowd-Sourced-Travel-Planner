# Trips backend routes

from fastapi import APIRouter
# from schemas.trips import

router = APIRouter()

# API endpoints go here using @router.get(), @router.post(), etc.
@router.get("/api/trips")
def get_trips():
    """
    Temporary Example Implementation.
    """
    return []