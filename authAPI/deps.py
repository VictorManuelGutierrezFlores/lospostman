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
from authAPI.schemas import TokenPayload, SystemUser
from replit import db

reuseable_oatuh = OAuth2PasswordBearer(
    tokenUrl="/auth"
)

async def get_current_user(token: str = Depends(reuseable_oatuh)) -> SystemUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, JWT_SECRET_KEY, algorithms=[ALGORITHM], options={"verify_alg": True}
        )
        token_data = TokenPayload(**payload)

        if token_data.exp < datetime.utcnow():
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception

    user: Union[dict[str, Any], None] = db.get(token_data.sub, None)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado!"
        )

    return SystemUser(**user)

