# Users backend routes

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends

from src import config
from src.schemas.users import UsersRegister, UsersLogin, UsersProfile, UsersUpdate, UsersId
from src.utility.authentication import hash_password, verify_password, create_access_token, verify_user
from src.utility.mongodb import mongo_string

router = APIRouter(prefix="/api/users", tags=["Users"])


# Return User ID
#
# Method: GET
#
# Frontend Component: usersApi.getId()
@router.get("/id", response_model=UsersId)
def get_user_id(user=Depends(verify_user)):
    '''
    Input: None
    Output: Authenticated user MongoDB ID
    '''
    return {"id": str(user["_id"])}


# User Registration
#
# Method: POST
#
# Frontend Component: usersApi.create(data)
@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(user_info: UsersRegister):
    '''
    Input: JSON with user information
    Output: JSON with success/error message 
    '''
    # Check for existing email and username
    if config.db.users.find_one({"email": user_info.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if config.db.users.find_one({"username": user_info.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed = hash_password(user_info.password)
    new_user = {
        "first_name": user_info.first_name,
        "last_name": user_info.last_name,
        "username": user_info.username,
        "email": user_info.email,
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc)
    }
    
    config.db.users.insert_one(new_user)
    return {"message": "User registered successfully"}


# User Login
#
# Method: POST
#
# Frontend Component: usersApi.login(data)
@router.post("/login")
def login(form_data: UsersLogin):
    '''
    Input: JSON with email and password
    Output: JSON with JWT token that contains sub=email, user_id:_id, expiration_time:60.
    '''
    # Validate email
    user = config.db.users.find_one({"email": form_data.email})

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Validate password
    get_database_hash = user["password_hash"]
    password_check = verify_password(form_data.password, get_database_hash)
    
    if password_check is False:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT access token
    access_token = create_access_token(data={
        "sub": user["email"],
        "user_id": str(user["_id"])
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}


# Get User
#
# Method: GET
#
# Frontend Component: usersApi.getProfile()
@router.get("", response_model=UsersProfile)
def get_profile(user=Depends(verify_user)):
    '''
    Input: none
    Output: JSON with authenticated user information
    '''
    # Convert MongoDB ObjectId to string
    return mongo_string(user)


# Update User
#
# Method: PUT
#
# Frontend Component: usersApi.update(data)
@router.put("")
def update_user(data: UsersUpdate, user=Depends(verify_user)):
    '''
    Input: JSON with updated user information. Allows password update.
    Output: JSON with success/error message
    '''
    data = data.model_dump(exclude_unset=True)

    if not data:
        raise HTTPException(status_code=400, detail="No update fields provided")
    
    # Get user ID from verified token
    user_id = user["_id"]

    # Disable important fields
    data.pop("_id", None)
    data.pop("password_hash", None)
    data.pop("created_at", None)

    # Check for existing email and username
    for field, message in [
        ("email", "Email already registered"),
        ("username", "Username already taken")
    ]:
        if field in data:
            existing = config.db.users.find_one({
                field: data[field],
                "_id": {"$ne": user_id}
            })
            if existing:
                raise HTTPException(status_code=400, detail=message)

    # Edit password
    if "password" in data:
        plain_password = data.pop("password")
        data["password_hash"] = hash_password(plain_password)

    # Update authenticated user
    config.db.users.update_one(
        {"_id": user_id},
        {"$set": data}
    )

    return {"message": "User updated successfully"}


# Delete User
#
# Method: DELETE  --remember to logout of token right after deletion
#
# Frontend Component: usersApi.remove()
@router.delete("")
def remove_user(user=Depends(verify_user)):
    '''
    Input: None
    Output: JSON with success/error message
    '''
    # Get user ID from verified token
    user_id = user["_id"]

    # Delete user
    config.db.users.delete_one({"_id": user_id})

    return {"message": "User deleted successfully"}