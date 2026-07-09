# Server side user authentication

from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

from src import config
from src.utility.mongodb import mongo_objectid

SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60

password_encryption = CryptContext(schemes=["bcrypt"])

token_extractor = HTTPBearer(scheme_name="JWT Token")


# Hash plain text password
def hash_password(password: str) -> str:
    return password_encryption.hash(password)


# Compares two password strings.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_encryption.verify(plain_password, hashed_password)


# Generate JWT access token
def create_access_token(data: dict) -> str:
    user_information = data.copy()

    # Calculate and add token expiration
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    user_information.update({"exp": expiration_time})

    # JWT should have sub=email, user_id:_id, expiration_time:expiration_minutes.
    jwt_token = jwt.encode(user_information, SECRET_KEY, algorithm=ALGORITHM)

    return jwt_token


# Verify JWT token -return entire user profile
#
# Pull user id from this!
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

    # Convert to MongoDB ObjectId
    user_id = mongo_objectid(user_id)

    # Find authenticated user in database
    user = config.db.users.find_one({"_id": user_id})

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user