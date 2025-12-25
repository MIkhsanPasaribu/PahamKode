"""
Database Hybrid Configuration - PahamKode
==================================================
STRATEGI: PyMongo (Motor) untuk User CRUD + Prisma untuk Complex Queries

Motor (Async PyMongo):
- User operations (CRUD)
- Authentication  
- 100% Cosmos DB compatible
- No REMOVE operator issues

Prisma (Optional):
- Complex queries (jika works)
- Type-safe operations
- Fallback ke Motor jika error

Author: PahamKode Team
Date: 2025-12-25
"""

import os
from typing import Optional, Dict, Any, TYPE_CHECKING
from dotenv import load_dotenv

# Import Prisma hanya untuk type checking, avoid runtime error
if TYPE_CHECKING:
    from prisma import Prisma

load_dotenv()

# ==================== MOTOR CLIENT (PRIMARY) ====================
# Note: Motor tidak punya type stubs, menggunakan Any untuk type safety
_motor_client: Optional[Any] = None


def dapatkan_motor_client() -> Any:
    """
    Dapatkan Motor (async PyMongo) client singleton
    
    Returns:
        AsyncIOMotorClient instance
    
    Raises:
        ValueError: Jika DATABASE_URL tidak ada
    """
    global _motor_client
    
    if _motor_client is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL tidak ditemukan di .env file")
        
        _motor_client = AsyncIOMotorClient(
            database_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
    
    return _motor_client


def dapatkan_database() -> Any:
    """
    Dapatkan database instance
    
    Returns:
        AsyncIOMotorDatabase untuk pahamkode-db
    """
    client = dapatkan_motor_client()
    return client["pahamkode-db"]


def dapatkan_collection(nama_collection: str) -> Any:
    """
    Dapatkan collection by name
    
    Args:
        nama_collection: Nama collection (users, submisi_error, dll)
    
    Returns:
        AsyncIOMotorCollection instance
    
    Examples:
        >>> users = dapatkan_collection("users")
        >>> await users.find_one({"email": "test@example.com"})
    """
    db = dapatkan_database()
    return db[nama_collection]


async def test_motor_connection() -> bool:
    """
    Test Motor connection ke Cosmos DB
    
    Returns:
        True jika connected, False jika gagal
    """
    try:
        client = dapatkan_motor_client()
        await client.admin.command('ping')
        print("✅ Motor (PyMongo Async) connected to Cosmos DB")
        return True
    except Exception as e:
        print(f"❌ Motor connection failed: {str(e)}")
        return False


async def tutup_motor_connection():
    """Close Motor client connection"""
    global _motor_client
    
    if _motor_client is not None:
        _motor_client.close()
        _motor_client = None
        print("✅ Motor disconnected")


# ==================== PRISMA CLIENT (OPTIONAL) ====================
# Prisma instance - hanya untuk complex queries jika perlu
_prisma: Optional["Prisma"] = None


def dapatkan_prisma() -> Optional["Prisma"]:
    """Dapatkan Prisma client instance (optional)"""
    global _prisma
    if _prisma is None:
        try:
            from prisma import Prisma
            _prisma = Prisma()
        except ImportError:
            print("⚠️  Prisma not installed, using Motor only")
            return None
    return _prisma


async def sambungkan_prisma():
    """
    Connect Prisma client (optional untuk complex queries)
    
    Note: Prisma might have issues with Cosmos DB, use with caution
    """
    try:
        prisma = dapatkan_prisma()
        if prisma and not prisma.is_connected():
            await prisma.connect()
            print("✅ Prisma connected (optional mode)")
        return True
    except Exception as e:
        print(f"⚠️  Prisma connection failed (will use Motor only): {str(e)}")
        return False


async def putuskan_prisma():
    """Disconnect Prisma client"""
    try:
        prisma = dapatkan_prisma()
        if prisma and prisma.is_connected():
            await prisma.disconnect()
            print("✅ Prisma disconnected")
    except:
        pass


# ==================== STARTUP & SHUTDOWN ====================
async def sambungkan_database():
    """
    Connect semua database clients saat aplikasi startup
    
    Primary: Motor (always)
    Optional: Prisma (fallback)
    """
    # Motor (MUST succeed)
    motor_ok = await test_motor_connection()
    if not motor_ok:
        raise Exception("❌ Motor connection FAILED - Cannot start application")
    
    # Prisma (optional, can fail)
    await sambungkan_prisma()
    
    print("=" * 60)
    print("✅ Database initialization complete")
    print("   Primary: Motor (PyMongo Async)")
    print("   Optional: Prisma (if connected)")
    print("=" * 60)


async def putuskan_database():
    """Disconnect semua database clients saat aplikasi shutdown"""
    await tutup_motor_connection()
    await putuskan_prisma()
    print("=" * 60)
    print("✅ All database connections closed")
    print("=" * 60)
