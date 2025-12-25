"""
Utilities untuk autentikasi dan JWT
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt  # type: ignore
from passlib.context import CryptContext  # type: ignore
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer  # type: ignore
from fastapi.security.http import HTTPAuthorizationCredentials as HTTPAuthCredentials  # type: ignore

from app.config import settings

# Context untuk hashing password
konteks_password = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
skema_bearer = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash password menggunakan bcrypt"""
    return konteks_password.hash(password)


def verifikasi_password(password_plain: str, password_hash: str) -> bool:
    """Verifikasi password dengan hash"""
    return konteks_password.verify(password_plain, password_hash)


def buat_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Buat JWT access token
    
    Args:
        data: Data yang akan di-encode ke dalam token (biasanya user_id)
        expires_delta: Durasi expire token (default dari settings)
    
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def verifikasi_token(token: str) -> str:
    """
    Verifikasi JWT token dan extract user_id
    
    Args:
        token: JWT token string
    
    Returns:
        str: user_id dari token
    
    Raises:
        HTTPException: Jika token invalid atau expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kadaluarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: Optional[str] = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
        return user_id
        
    except JWTError:
        raise credentials_exception


async def dapatkan_user_sekarang(credentials: HTTPAuthCredentials = Depends(skema_bearer)) -> str:
    """
    Dependency untuk mendapatkan user_id dari Bearer token
    
    Args:
        credentials: HTTP Bearer credentials dari request header
    
    Returns:
        str: user_id dari authenticated user
    
    Raises:
        HTTPException: Jika token invalid
    """
    token = credentials.credentials
    user_id = verifikasi_token(token)
    return user_id


async def dapatkan_user_lengkap(credentials: HTTPAuthCredentials = Depends(skema_bearer)):
    """
    Dependency untuk mendapatkan user object lengkap dari Bearer token
    
    Args:
        credentials: HTTP Bearer credentials dari request header
    
    Returns:
        User: User object dari database
    
    Raises:
        HTTPException: Jika token invalid atau user tidak ditemukan
    """
    from app.database import prisma
    
    token = credentials.credentials
    user_id = verifikasi_token(token)
    
    user = await prisma.user.find_unique(where={"id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    return user


async def verifikasi_admin(credentials: HTTPAuthCredentials = Depends(skema_bearer)):
    """
    Dependency untuk memverifikasi bahwa user adalah admin
    
    Args:
        credentials: HTTP Bearer credentials dari request header
    
    Returns:
        User: Admin user object
    
    Raises:
        HTTPException: Jika bukan admin atau token invalid
    """
    from app.database import prisma
    
    token = credentials.credentials
    user_id = verifikasi_token(token)
    
    user = await prisma.user.find_unique(where={"id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya admin yang dapat mengakses resource ini."
        )
    
    return user
