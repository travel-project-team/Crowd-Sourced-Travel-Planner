# Users backend routes

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Response

from src import config
from src.schemas.users import UsersRegister, UsersLogin, UsersProfile, UsersUpdate, BatchUsersById, BatchUsersProfile, BatchUsersByEmail, UsersPassword
from src.utility.authentication import hash_password, verify_password, create_access_token, verify_user
from src.utility.mongodb import mongo_objectid, mongo_string
from src.utility.cloudinary import cloudinary_upload

router = APIRouter(prefix="/api/users", tags=["Users"])


# Account Registration (usersApi.create(data))
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
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc)
    }

    config.db.users.insert_one(new_user)
    return {"message": "User registered successfully"}


# User Login (usersApi.login(data))
@router.post("/login")
def login(form_data: UsersLogin, response: Response):
    '''
    Input: JSON with email and password
    Output: JSON with login success message.
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

    # Store JWT in HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,    # Change to True for production!!
        max_age=60 * 60 
    )

    return {"message": "Login successful"}


# User Logout (usersApi.logout())
@router.post("/logout")
def logout(response: Response):
    # Remove HTTP browser cookie
    response.delete_cookie(key="access_token")

    return {"message": "Logout successful"}


# Get Current User Profile (usersApi.getProfile())
@router.get("", response_model=UsersProfile)
def get_profile(user=Depends(verify_user)):
    '''
    Input: none
    Output: JSON with authenticated user information
    '''
    return mongo_string(user)


# Update Profile (usersApi.update(data))
@router.put("")
def update_user(data: UsersUpdate, user=Depends(verify_user)):
    '''
    Input: JSON with updated user information.
    Output: JSON with success/error message
    '''
    data = data.model_dump(exclude_unset=True)

    if not data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    # Get user ID from verified token
    user_id = user["_id"]

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

    # Update authenticated user
    config.db.users.update_one(
        {"_id": user_id},
        {"$set": data}
    )
    return {"message": "User updated successfully"}


# Update Password (usersApi.updatePassword(data))
@router.put("/password")
def update_password(data: UsersPassword, user=Depends(verify_user)):
    '''
    Input: Current password and new password.
    Output: JSON with success/error message.
    '''
    # Verify current password
    password_check = verify_password(data.current_password, user["password_hash"])

    if not password_check:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Hash new password
    new_password_hash = hash_password(data.new_password)

    # Update password
    config.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_password_hash}}
    )

    return {"message": "Password updated successfully"}


# Delete Account (usersApi.remove())
@router.delete("")
def remove_user(user=Depends(verify_user)):
    '''
    Input: None
    Output: JSON with success/error message
    '''
    # Get user ID from verified token
    user_id = user["_id"]
    user_id_str = str(user_id)

    # get user's experience IDs before deleting them, so they can be unlinked from other users' trips 
    owned_experiences = config.db.experiences.find(
        {"user_id": user_id_str}, {"_id": 1}
    )
    owned_experience_ids = [str(exp["_id"]) for exp in owned_experiences]

    # Delete the user's experiences & trips
    config.db.experiences.delete_many({"user_id": user_id_str})
    config.db.trips.delete_many({"owner_id": user_id_str})
    config.db.trips.update_many(
        {},
        {
            "$pull": {
                "collaborator_ids": user_id_str,
                "experience_ids": {"$in": owned_experience_ids},
            }
        },
    )

    # Delete user
    config.db.users.delete_one({"_id": user_id})

    return {"message": "User deleted successfully"}


# Get Multiple User Profiles By ID (usersApi.getBatchById())
@router.post("/id", response_model=list[BatchUsersProfile])
def profile_by_id(data: BatchUsersById, _=Depends(verify_user)):
    """
    Input: JSON with array of user IDs
    Output: JSON with list of public user profiles
    """
    user_ids = [
        mongo_objectid(user_id)
        for user_id in data.user_ids
    ]

    # Find users that match IDs
    users = config.db.users.find(
        {"_id": {"$in": user_ids}}
    )

    users_dict = {
        str(db_user["_id"]): mongo_string(db_user)
        for db_user in users
    }

    # Return users in requested order 
    return [
        users_dict[user_id]
        for user_id in data.user_ids
        if user_id in users_dict
    ]


# Get Multiple User Profiles By Email (usersApi.getBatchByEmail())
@router.post("/email", response_model=list[BatchUsersProfile])
def profile_by_email(data: BatchUsersByEmail, _=Depends(verify_user)):
    """
    Input: JSON with array of user emails
    Output: JSON with list of public user profiles
    """
    # Find users that match emails
    users = config.db.users.find(
        {"email": {"$in": data.emails}}
    )

    users_dict = {
        str(db_user["email"]): mongo_string(db_user)
        for db_user in users
    }

    # Return users in requested order
    return [
        users_dict[email]
        for email in data.emails
        if email in users_dict
    ]


# Upload Avatar (usersApi.uploadAvatar(data))
@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(verify_user)):
    """
    Input: Image file
    Output: JSON with avatar URL
    """
    # Upload image to Cloudinary
    avatar_url = await cloudinary_upload(file, folder_name="travel_planner/users")

    # Update user avatar URL in MongoDB
    config.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"avatar_url": avatar_url}}
    )

    return {"message": "Avatar uploaded", "avatar_url": avatar_url}


# Delete Avatar (usersApi.removeAvatar())
@router.delete("/avatar")
def remove_avatar(user=Depends(verify_user)):
    """
    Input: None
    Output: JSON with success/error message
    """
    # Remove avatar URL from MongoDB
    config.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"avatar_url": None}}
    )

    return {"message": "Avatar removed"}