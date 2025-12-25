"""
Auth Endpoints - Register, Login, Get Current User
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import (
    RequestRegister, 
    RequestLogin, 
    ResponseAuth, 
    ResponseUser
)
from app.utils.auth import (
    hash_password, 
    verifikasi_password, 
    buat_access_token,
    dapatkan_user_sekarang
)
from app.repositories.user_repository import (
    buat_user,
    cari_user_by_email,
    cari_user_by_id
)

router = APIRouter()


@router.post("/register", response_model=ResponseAuth, status_code=status.HTTP_201_CREATED)
async def register(request: RequestRegister):
    """
    Register user baru
    
    - Validasi email belum terdaftar
    - Hash password
    - Simpan ke database
    - Return JWT token + user data
    """
    
    # Cek apakah email sudah terdaftar
    user_ada = await cari_user_by_email(request.email)
    
    if user_ada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    # Hash password
    password_hash = hash_password(request.password)
    
    # Buat user baru dengan Motor
    user_baru = await buat_user(
        email=request.email,
        nama=request.nama,
        password_hash=password_hash,
        role="mahasiswa",
        tingkat_kemahiran="pemula"
    )
    
    # Buat JWT token
    access_token = buat_access_token(data={"sub": user_baru["id"]})
    
    return ResponseAuth(
        access_token=access_token,
        token_type="bearer",
        user=ResponseUser(
            id=user_baru["id"],
            email=user_baru["email"],
            nama=user_baru.get("nama"),
            role=user_baru["role"],
            tingkat_kemahiran=user_baru["tingkatKemahiran"],
            created_at=user_baru["createdAt"]
        )
    )


@router.post("/login", response_model=ResponseAuth)
async def login(request: RequestLogin):
    """
    Login user
    
    - Validasi email & password
    - Return JWT token + user data
    """
    
    # Cari user berdasarkan email
    user = await cari_user_by_email(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Verifikasi password
    if not verifikasi_password(request.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Buat JWT token
    access_token = buat_access_token(data={"sub": user["id"]})
    
    return ResponseAuth(
        access_token=access_token,
        token_type="bearer",
        user=ResponseUser(
            id=user["id"],
            email=user["email"],
            nama=user.get("nama"),
            role=user["role"],
            tingkat_kemahiran=user["tingkatKemahiran"],
            created_at=user["createdAt"]
        )
    )


@router.get("/me", response_model=ResponseUser)
async def dapatkan_profil_saya(user_id: str = Depends(dapatkan_user_sekarang)):
    """
    Get profil user yang sedang login
    
    Requires: Bearer token di header
    """
    
    user = await cari_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    return ResponseUser(
        id=user["id"],
        email=user["email"],
        nama=user.get("nama"),
        role=user["role"],
        tingkat_kemahiran=user["tingkatKemahiran"],
        created_at=user["createdAt"]
    )
