from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime

# Users Base 
class UsersBase(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    avatar_url: str | None = None

# POST for User Registration 
class UsersRegister(UsersBase):
    password: str 

# POST for User Login 
class UsersLogin(BaseModel):
    email: EmailStr
    password: str

# GET for User Profile 
class UsersProfile(UsersBase):
    id: str = Field(..., alias="_id")
    created_at: datetime 

    model_config = ConfigDict(
        populate_by_name=True,
    )

# PUT for User Update 
class UsersUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    username: str | None = Field(None, min_length=1)
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=1)
    avatar_url: str | None = None

# GET for User ID 
class UsersId(BaseModel):
    id: str