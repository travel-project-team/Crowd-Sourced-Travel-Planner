# Users backend routes

from fastapi import APIRouter
# from schemas.users import

router = APIRouter()

# API endpoints go here using @router.get(), @router.post(), etc.
@router.get("/api/users")
def get_users():
    """
    Temporary Example Implementation.
    """
    return []
