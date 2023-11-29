# LIBRERIAS
from typing import Union, Any
from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .utils import (
    ALGORITHM,
    JWT_SECRET_KEY
)
from jose import jwt
from pydantic import ValidationError
from app.schemas import TokenPayload, SystemUser
from replit import db

reuseable_oatuh = OAuth2PasswordBearer(
    tokenUrl="/auth",
    scheme_name="JWT"
)

async def get_current_user(token: str = Depends(reuseable_oatuh)) -> SystemUser:
    try:
        payload = jwt.decode(
            token, JWT_SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        if datetime._fromtimestamp(token_data.exp) < datetime.now():
            raise HTTPException(
                status_code= status.HTTP_401_UNAUTHORIZED,
                detail= "Token expirado",
                headers= {"WWW-Authenticate": "Bearer"}
            )
    except(jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail = "No se pudo validar las credenciales",
            headers = {"WWW-Authenticate": "Bearer"}
        )
    user: Union[dict[str, Any], None] = db.get(token_data.sub, None)
    
    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= "Usuario no encotrado!"
        )
    return SystemUser(**user)