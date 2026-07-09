# Trips backend routes

from fastapi import APIRouter
# from schemas.trips import

router = APIRouter(prefix="/api/trips", tags=["Trips"])

# API endpoints go here using @router.get(), @router.post(), etc.
@router.get("/")
def get_trips():
    """
    Temporary Example Implementation.
    """
    return []