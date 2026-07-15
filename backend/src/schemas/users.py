from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime

# Users Base 
class UsersBase(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])

# POST for User Registration -Request model
class UsersRegister(UsersBase):
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])
    password: str 

# POST for User Login -Request model
class UsersLogin(BaseModel):
    email: EmailStr
    password: str

# GET for User Profile -Response model
class UsersProfile(UsersBase):
    id: str = Field(..., alias="_id")
    email: EmailStr
    avatar_url: str | None = None
    created_at: datetime 

    model_config = ConfigDict(
        populate_by_name=True,
    )

# PUT for User Update -Request model
class UsersUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    username: str | None = Field(None, min_length=1)
    email: EmailStr | None = None
    password: str | None = Field(None, min_length=1)

# POST for Batch ID -Request model
class BatchUsersById(BaseModel):
    user_ids: list[str]

# POST for Batch Email -Request model
class BatchUsersByEmail(BaseModel):
    emails: list[EmailStr]

# POST for Batch Users Profile -Reponse model
class BatchUsersProfile(UsersBase):
    id: str = Field(..., alias="_id")
    email: EmailStr
    avatar_url: str | None = None

    model_config = ConfigDict(
        populate_by_name=True,
    )
