"""
User Repository dengan Motor (async PyMongo) untuk Azure Cosmos DB.

Repository ini menggantikan Prisma User operations karena:
- Prisma Python + Cosmos DB = Error 17276 (REMOVE operator not supported)
- Motor (PyMongo async) works 100% dengan Cosmos DB MongoDB API

Semua operasi User CRUD menggunakan Motor secara langsung.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from bson import ObjectId
from app.database import dapatkan_collection
import logging

logger = logging.getLogger(__name__)

# Collection name
USERS_COLLECTION = "User"

# ===== HELPER FUNCTIONS =====

def _convert_user_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Convert MongoDB document ke format yang compatible dengan API.
    - Convert ObjectId ke string
    - Rename _id ke id
    - Ensure datetime fields
    """
    if doc is None:
        return None
    
    # Convert _id (ObjectId) ke id (string)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    
    # Ensure datetime fields exist
    if "createdAt" not in doc:
        doc["createdAt"] = datetime.utcnow()
    
    return doc

# ===== CREATE OPERATIONS =====

async def buat_user(
    email: str,
    nama: Optional[str],
    password_hash: str,
    role: str = "mahasiswa",
    tingkat_kemahiran: str = "pemula"
) -> Dict[str, Any]:
    """
    Buat user baru di database.
    
    Args:
        email: Email user (unique)
        nama: Nama lengkap (optional)
        password_hash: Password yang sudah di-hash dengan bcrypt
        role: Role user ('mahasiswa' atau 'admin')
        tingkat_kemahiran: Level kemahiran ('pemula', 'menengah', 'mahir')
    
    Returns:
        Dict user yang baru dibuat (dengan id)
    
    Raises:
        ValueError: Jika email sudah terdaftar
        Exception: Jika gagal insert ke database
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        # Check email uniqueness
        existing = await users.find_one({"email": email})
        if existing:
            raise ValueError(f"Email {email} sudah terdaftar")
        
        # Prepare document
        user_doc = {
            "email": email,
            "nama": nama,
            "passwordHash": password_hash,
            "role": role,
            "tingkatKemahiran": tingkat_kemahiran,
            "createdAt": datetime.utcnow()
        }
        
        # Insert
        result = await users.insert_one(user_doc)
        
        if not result.inserted_id:
            raise Exception("Gagal insert user ke database")
        
        # Return created user
        user_doc["id"] = str(result.inserted_id)
        if "_id" in user_doc:
            del user_doc["_id"]
        
        logger.info(f"✅ User created: {email} (id: {user_doc['id']})")
        return user_doc
        
    except ValueError:
        raise  # Re-raise validation errors
    except Exception as e:
        logger.error(f"❌ Error creating user: {e}")
        raise Exception(f"Gagal membuat user: {str(e)}")

# ===== READ OPERATIONS =====

async def cari_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Cari user berdasarkan email.
    
    Args:
        email: Email user yang dicari
    
    Returns:
        Dict user jika ditemukan, None jika tidak ada
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        doc = await users.find_one({"email": email})
        return _convert_user_doc(doc)
    except Exception as e:
        logger.error(f"❌ Error finding user by email: {e}")
        return None

async def cari_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Cari user berdasarkan ID.
    
    Args:
        user_id: ObjectId string dari user
    
    Returns:
        Dict user jika ditemukan, None jika tidak ada
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        # Validate ObjectId format
        if not ObjectId.is_valid(user_id):
            logger.warning(f"⚠️ Invalid ObjectId format: {user_id}")
            return None
        
        doc = await users.find_one({"_id": ObjectId(user_id)})
        return _convert_user_doc(doc)
    except Exception as e:
        logger.error(f"❌ Error finding user by id: {e}")
        return None

async def ambil_semua_user(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Ambil list user dengan pagination dan filter.
    
    Args:
        skip: Jumlah documents yang di-skip (untuk pagination)
        limit: Maksimal documents yang diambil
        role: Filter berdasarkan role (optional)
    
    Returns:
        List of user dictionaries
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        # Build filter
        filter_query = {}
        if role:
            filter_query["role"] = role
        
        # Query dengan pagination
        cursor = users.find(filter_query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        
        # Convert semua documents (filter out None results)
        converted = [_convert_user_doc(doc) for doc in docs]
        return [u for u in converted if u is not None]
        
    except Exception as e:
        logger.error(f"❌ Error getting users: {e}")
        return []

async def hitung_user(role: Optional[str] = None) -> int:
    """
    Hitung jumlah user di database.
    
    Args:
        role: Filter berdasarkan role (optional)
    
    Returns:
        Jumlah user
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        filter_query = {}
        if role:
            filter_query["role"] = role
        
        count = await users.count_documents(filter_query)
        return count
        
    except Exception as e:
        logger.error(f"❌ Error counting users: {e}")
        return 0

# ===== UPDATE OPERATIONS =====

async def update_user(
    user_id: str,
    data: Dict[str, Any]
) -> bool:
    """
    Update user data.
    
    Args:
        user_id: ObjectId string dari user
        data: Dict berisi fields yang akan di-update
    
    Returns:
        True jika sukses, False jika gagal
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        # Validate ObjectId
        if not ObjectId.is_valid(user_id):
            logger.warning(f"⚠️ Invalid ObjectId: {user_id}")
            return False
        
        # Remove fields yang tidak boleh di-update
        forbidden_fields = ["_id", "id", "email", "createdAt"]
        update_data = {k: v for k, v in data.items() if k not in forbidden_fields}
        
        if not update_data:
            logger.warning("⚠️ No fields to update")
            return False
        
        # Update
        result = await users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ User updated: {user_id}")
            return True
        else:
            logger.warning(f"⚠️ No changes made for user: {user_id}")
            return False
        
    except Exception as e:
        logger.error(f"❌ Error updating user: {e}")
        return False

async def update_tingkat_kemahiran(
    user_id: str,
    tingkat_kemahiran: str
) -> bool:
    """
    Update tingkat kemahiran user.
    
    Args:
        user_id: ObjectId string dari user
        tingkat_kemahiran: Level baru ('pemula', 'menengah', 'mahir')
    
    Returns:
        True jika sukses, False jika gagal
    """
    return await update_user(user_id, {"tingkatKemahiran": tingkat_kemahiran})

# ===== DELETE OPERATIONS =====

async def hapus_user(user_id: str) -> bool:
    """
    Hapus user dari database.
    
    Args:
        user_id: ObjectId string dari user
    
    Returns:
        True jika sukses, False jika gagal
    """
    try:
        users = dapatkan_collection(USERS_COLLECTION)
        
        # Validate ObjectId
        if not ObjectId.is_valid(user_id):
            logger.warning(f"⚠️ Invalid ObjectId: {user_id}")
            return False
        
        # Delete
        result = await users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count > 0:
            logger.info(f"✅ User deleted: {user_id}")
            return True
        else:
            logger.warning(f"⚠️ User not found: {user_id}")
            return False
        
    except Exception as e:
        logger.error(f"❌ Error deleting user: {e}")
        return False
