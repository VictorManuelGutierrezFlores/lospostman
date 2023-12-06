# IMPORTACION DE LIBRERIAS
import os
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
from utils import  get_hashed_password, create_access_token, create_refresh_token, verify_password, searchUserOnDB, verify_access_token, get_current_Token
from schemas import TokenPayload, TokenSchema
from http_client import make_protected_request

from dotenv import load_dotenv

# Cargar las variables de entorno desde un archivo .env
load_dotenv()

revoked_tokens = set()

# INICIALIZACION DEL API
app = FastAPI()
#Autenticación por contraseña para eso:
# Creamos un endpoint llamado "auth"
oauth2 = OAuth2PasswordBearer(tokenUrl="auth")

# Configuración del FastAPI

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



#############
# ENDPOINTS #
#############
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
    
    # Generar un nuevo token de acceso
    access_token = create_access_token(user.get("email"))

    with open("access_token.txt", "w") as file:
        file.write(access_token)

    # Verificar la validez del token de acceso antes de enviarlo como respuesta
    if not verify_access_token(access_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso no válido"
        )

    return {
        "access_token": access_token,
        "refresh_token": create_refresh_token(user.get("email")),
        "acceso concedido": HTTPException(status_code=status.HTTP_200_OK)
    }

# Endpoint para cerrar sesión
@app.post("/logout", summary="Cerrar sesión", status_code=200)
async def logout(current_user: dict = Depends(get_current_Token)):
    # Agrega el token actual a la lista negra
    revoked_tokens.add(current_user.get("sub"))
    return {"message": "Sesión cerrada exitosamente"}


def get_current_token(access_token: str = Depends(oauth2_scheme)):
    print("Received Token:", access_token)
    return access_token

# Ruta protegida que utiliza la función de obtener el token actual
@app.get("/protected-route")
async def protected_route(access_token: str = Depends(get_current_token)):
    return {"message": "Access granted", "token": access_token}






