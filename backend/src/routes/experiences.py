# Experiences backend routes 

from fastapi import APIRouter
# from schemas.experiences import

router = APIRouter()

# API endpoints go here using @router.get(), @router.post(), etc.
@router.get("/api/experiences")
def get_experiences():
    """
    Temporary Example Implementation.
    """
    return []