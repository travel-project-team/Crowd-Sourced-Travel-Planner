from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime, timezone
from pydantic import EmailStr

# Users Base 
class UsersBase(BaseModel):
    first_name: str = Field(..., examples=["Billie"])
    last_name: str = Field(..., examples=["Billerson"])
    username: str = Field(..., examples=["billbill123"])
    email: EmailStr = Field(..., examples=["billie.billerson@example.com"])

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
        arbitrary_types_allowed=True
    )

# PUT for User Update 
class UsersUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None