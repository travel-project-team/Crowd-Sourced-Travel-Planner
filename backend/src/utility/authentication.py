# User authentication helper functions 

import bcrypt 

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

from src import config
from src.utility.mongodb import mongo_objectid

SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60

token_extractor = HTTPBearer(scheme_name="JWT Token")


# Hash plain text password
def hash_password(password: str) -> str:
    password_in_bytes = password.encode("utf-8")
        
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_in_bytes, salt)
    
    return hashed_bytes.decode("utf-8")


# Compares two password strings.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_in_bytes = plain_password.encode("utf-8")
    hashed_in_bytes = hashed_password.encode("utf-8")
    
    return bcrypt.checkpw(plain_in_bytes, hashed_in_bytes)


# Generate JWT access token
def create_access_token(data: dict) -> str:
    user_information = data.copy()

    # Add token expiration
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    user_information.update({"exp": expiration_time})

    # Access token claims
    # sub: email 
    # user_id: _id 
    # expiration_time: default 60 minutes
    jwt_token = jwt.encode(user_information, SECRET_KEY, algorithm=ALGORITHM)

    return jwt_token


# Verify JWT access token
#
# Returns user profile 
# No need for frontend to send user ID -extract from this
def verify_user(credentials = Depends(token_extractor)):
    token = credentials.credentials

    # Decode and verify JWT token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = mongo_objectid(user_id)

    # Find authenticated user in database
    user = config.db.users.find_one({"_id": user_id})

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user