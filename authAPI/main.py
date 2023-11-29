# IMPORTACION DE LIBRERIAS
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
from firebase_admin import credentials
#Importamos librería jwt
from jose import jwt, JWTError
#Importamos libreria passlib (algoritmo de encriptación)
from passlib.context import CryptContext
#Importamos libreria de fechas para la expiración del token
from datetime import datetime, timedelta
from utils import  get_hashed_password, create_access_token, create_refresh_token, verify_password, searchUserOnDB
from schemas import TokenPayload, TokenSchema

# INICIALIZACION DEL API
app = FastAPI()
#Autenticación por contraseña para eso:
# Creamos un endpoint llamado "auth"
oauth2 = OAuth2PasswordBearer(tokenUrl="auth")


#############
# ENDPOINTS #
#############
@app.get("/")
async def showWelcomeMessage():
    user = searchUserOnDB("pruebas1")
    print(user)
    print(user.get("password"))
    return "Hola Mundo!"

@app.post('/auth', summary="Autenticacion de cuenta", response_model=TokenSchema, status_code=200)
async def auth(form_data: OAuth2PasswordRequestForm = Depends()):
    user = searchUserOnDB(form_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario incorrecto!"
        )
    hashed_pass = user.get("password")
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Contraseña incorrecta!"
        )
    
    return{
        "access_token": create_access_token(user.get("email")),
        "refresh_token": create_refresh_token(user.get("email"))
    }