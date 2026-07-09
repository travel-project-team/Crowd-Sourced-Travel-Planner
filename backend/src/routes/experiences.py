# Experiences backend routes 

from fastapi import APIRouter
# from schemas.experiences import

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])

# API endpoints go here using @router.get(), @router.post(), etc.
@router.get("/")
def get_experiences():
    """
    Temporary Example Implementation.
    """
    return []