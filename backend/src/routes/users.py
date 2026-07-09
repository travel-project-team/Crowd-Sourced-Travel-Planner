# Users backend routes

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends

from src import config
from src.schemas.users import UsersRegister, UsersLogin, UsersProfile, UsersUpdate
from src.utility.authentication import hash_password, verify_password, create_access_token, verify_user
from src.utility.mongodb import mongo_objectid, mongo_string

router = APIRouter(prefix="/api/users", tags=["Users"])


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
        raise HTTPException(status_code=401, detail="Incorrect Email")
    
    # Validate password
    get_database_hash = user["password_hash"]
    password_check = verify_password(form_data.password, get_database_hash)
    
    if password_check is False:
        raise HTTPException(status_code=401, detail="Incorrect Password")
    
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
# Frontend Component: usersApi.getById(id)
@router.get("/{id}", response_model=UsersProfile)
def get_user_by_id(id: str, user=Depends(verify_user)):
    '''
    Input: User ID
    Output: JSON with user information
    '''
    # Convert string to MongoDB ObjectId
    user_id = mongo_objectid(id)
        
    # Verify user token
    if user["_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    # Convert MongoDB ObjectId to string
    return mongo_string(user)


# Update User
#
# Method: PUT
#
# Frontend Component: usersApi.update(id, data)
@router.put("/{id}")
def update_user(id: str, data: UsersUpdate, user=Depends(verify_user)):
    '''
    Input: User ID and JSON with updated user information. Allows password update.
    Output: JSON with success/error message
    '''
    data = data.model_dump(exclude_unset=True)

    # Convert string user ID to MongoDB ObjectId
    user_id = mongo_objectid(id)
    
    # Verify user token
    if user["_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

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
    
    # Update user in database
    config.db.users.update_one({"_id": user_id}, {"$set": data})
    
    return {"message": "User updated successfully"}


# Delete User
#
# Method: DELETE
#
# Frontend Component: usersApi.remove(id)
@router.delete("/{id}")
def remove_user(id: str, user=Depends(verify_user)):
    '''
    Input: User ID
    Output: JSON with success/error message
    '''
    # Convert string user ID to MongoDB ObjectId
    user_id = mongo_objectid(id)
        
    # Verify user token
    if user["_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
        
    # Delete user from database
    config.db.users.delete_one({"_id": user_id})
    
    return {"message": "User deleted successfully"}