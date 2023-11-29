# LIBRERIAS 
from passlib.context import CryptContext
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt

# SECRETS
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
ALGORITHM = "HS256"
JWT_SECRET_KEY = "7ebe1e9c25f7e9c1047324a14a89b515"
JWT_REFRESH_SECRET_KEY = "7ebe1e9c25f7e9c1047324a14a89b515"

# ESQUEMA DE HASHING USADO MD5
passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CONEXION A FIREBASE
cred = credentials.Certificate("authAPI\serviceAccount.json")
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
