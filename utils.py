# LIBRERIAS 
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt
from schemas import TokenPayload

# SECRETS
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
ALGORITHM = "HS256"
JWT_SECRET_KEY = "7ebe1e9c25f7e9c1047324a14a89b515"
JWT_REFRESH_SECRET_KEY = "7ebe1e9c25f7e9c1047324a14a89b515"

# ESQUEMA DE HASHING USADO MD5
passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# CONEXION A FIREBASE
cred = credentials.Certificate("serviceAccount.json")
firebase_admin.initialize_app(cred)
# INICIALIZACION DE CLIENTE
db = firestore.client()
    
    
# FUNCION: CREAR AUTH TOKEN
def create_access_token(subject: Union[str, any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_Encode = {"exp": expires_delta, "sub" : str(subject)}
    encoded_jwt = jwt.encode(to_Encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt

# FUNCION: REINICIO DE AUTH TOKEN
def create_refresh_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt

# FUNCION: BUSQUEDA DE USUARIO
def searchUserOnDB(username:str):
    doc_ref = db.collection("credenciales").document(username)
    doc = doc_ref.get()
    if doc.exists:
        print(f"Documento encontrado: {doc.to_dict()}")
        return doc.to_dict()
    else:
        print("Documento no encontrado!")
        

# FUNCION CIFRADORA A MD5
def get_hashed_password(password:str)->str:
    return passwordContext.hash(password)

# FUNCION VERIFICADORA DE CONTRASEÑAS
def verify_password(password:str, hashed_pass:str)->bool:
    return passwordContext.verify(password, hashed_pass)

#FUNCION DE VALIDACION
def get_existing_user_token(subject: str) -> str:
    # Lógica para obtener el token del usuario desde la base de datos
    # Devuelve el token si es válido, o None si no hay uno válido
    user_token = db.get_user_token(subject)
    
    # Verificar la validez del token (puedes personalizar esta lógica según tus necesidades)
    if user_token and verify_access_token(user_token):
        return user_token
    
    return None

# Función para verificar la validez de un token de acceso
def verify_access_token(token: str) -> bool:
    try:
        jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True})
        return True
    except jwt.ExpiredSignatureError:
        return False
    except jwt.JWTError:
        return False


