from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime


# Basic User Model
class UsersBase(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])


# Profile Model
class UsersProfileBase(UsersBase):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    avatar_url: str | None = None


#################### REQUEST ####################


# POST for Account Registration 
class UsersRegister(UsersBase):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    password: str 


# POST for Login 
class UsersLogin(BaseModel):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    password: str


# PUT for profile update 
class UsersUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    username: str | None = Field(None, min_length=1)
    email: EmailStr | None = None


# PUT for password change
class UsersPassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# POST for Batch of IDs 
class BatchUsersById(BaseModel):
    user_ids: list[str]


# POST for Batch of Emails
class BatchUsersByEmail(BaseModel):
    emails: list[EmailStr]


#################### RESPONSE ####################


# GET Current User Profile 
class UsersProfile(UsersProfileBase):
    id: str = Field(..., alias="_id")
    created_at: datetime 

    model_config = ConfigDict(
        populate_by_name=True,
    )


# POST Multiple User Profiles
class BatchUsersProfile(UsersProfileBase):
    id: str = Field(..., alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
    )
