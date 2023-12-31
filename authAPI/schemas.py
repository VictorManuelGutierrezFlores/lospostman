from uuid import UUID
from pydantic import BaseModel, Field

class UserTemplate(BaseModel):
    username : str
    password :  str
    email: str
    disable: bool

class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    

class TokenPayload(BaseModel):
    sub: str = None
    exp: int = None


class UserAuth(BaseModel):
    username: str = Field(..., description="username")
    password: str = Field(..., min_length=8, max_length=24, description="user password")
    

class UserOut(BaseModel):
    id: UUID
    email: str


class SystemUser(UserOut):
    password: str