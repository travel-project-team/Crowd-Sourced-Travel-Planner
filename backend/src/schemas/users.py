from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime

# Commonly shared fields 
class UsersBase(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])

# Shared profile fields
class UsersProfileBase(UsersBase):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    avatar_url: str | None = None


########## REQUEST MODELS ##########

# POST for User Registration 
class UsersRegister(UsersBase):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    password: str 

# POST for User Login 
class UsersLogin(BaseModel):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    password: str

# PUT for User Update 
class UsersUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    username: str | None = Field(None, min_length=1)
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=1)

# POST for Batch ID 
class BatchUsersById(BaseModel):
    user_ids: list[str]

# POST for Batch Email 
class BatchUsersByEmail(BaseModel):
    emails: list[EmailStr]


########## RESPONSE MODELS ##########

# GET for User Profile 
class UsersProfile(UsersProfileBase):
    id: str = Field(..., alias="_id")
    created_at: datetime 

    model_config = ConfigDict(
        populate_by_name=True,
    )

# POST for Batch Users Profile
class BatchUsersProfile(UsersProfileBase):
    id: str = Field(..., alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
    )
