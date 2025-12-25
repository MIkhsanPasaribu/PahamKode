"""
Database connection dengan Motor (async PyMongo) + Prisma untuk Azure Cosmos DB (MongoDB API)

HYBRID APPROACH:
- Motor (Primary): User CRUD operations (Prisma gagal dengan Error 17276)
- Prisma (Optional): Complex queries untuk models lain
"""

from typing import Optional, TYPE_CHECKING
from prisma import Prisma  # type: ignore
from app.config import settings
import logging

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# ===== MOTOR CLIENT (PRIMARY) =====
_motor_client: Optional["AsyncIOMotorClient"] = None


def dapatkan_motor_client() -> "AsyncIOMotorClient":
    """
    Dapatkan Motor client singleton untuk operasi MongoDB langsung.
    Motor diperlukan karena Prisma + Cosmos DB tidak compatible (Error 17276).
    """
    global _motor_client
    if _motor_client is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        database_url = settings.database_url
        _motor_client = AsyncIOMotorClient(
            database_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            retryWrites=False,  # Cosmos DB requirement
            maxPoolSize=50,
            minPoolSize=10
        )
        logger.info("🔧 Motor client singleton dibuat")
    return _motor_client


def dapatkan_database() -> "AsyncIOMotorDatabase":
    """Dapatkan database instance dari Motor client"""
    client = dapatkan_motor_client()
    db_name = settings.database_url.split("/")[-1].split("?")[0]
    return client[db_name]


def dapatkan_collection(nama_collection: str):
    """Helper untuk mendapatkan collection dari database"""
    db = dapatkan_database()
    return db[nama_collection]


# ===== PRISMA CLIENT (OPTIONAL - FALLBACK) =====
# Instance Prisma Client
prisma = Prisma()


async def sambungkan_prisma() -> bool:
    """Sambungkan Prisma (optional, untuk complex queries)"""
    try:
        await prisma.connect()
        logger.info("✅ Prisma tersambung (optional mode)")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Prisma gagal connect (OK, Motor masih jalan): {e}")
        return False


async def putuskan_prisma():
    """Putuskan koneksi Prisma"""
    try:
        await prisma.disconnect()
        logger.info("❌ Prisma terputus")
    except Exception as e:
        logger.warning(f"⚠️ Error saat disconnect Prisma: {e}")


# ===== LIFECYCLE MANAGEMENT =====
async def test_motor_connection() -> bool:
    """Test koneksi Motor ke Cosmos DB"""
    try:
        client = dapatkan_motor_client()
        # Ping database untuk verify connection
        await client.admin.command('ping')
        logger.info("✅ Motor connection test: SUCCESS")
        return True
    except Exception as e:
        logger.error(f"❌ Motor connection test FAILED: {e}")
        return False


async def sambungkan_database():
    """
    Sambungkan ke Azure Cosmos DB saat aplikasi startup.
    Motor HARUS sukses, Prisma optional.
    """
    logger.info("🔌 Connecting to Azure Cosmos DB...")
    
    # Motor (CRITICAL - harus sukses)
    motor_ok = await test_motor_connection()
    if not motor_ok:
        raise Exception("❌ Motor (MongoDB driver) gagal connect! App tidak bisa jalan.")
    
    logger.info("✅ Motor (AsyncIOMotorClient) tersambung ke Cosmos DB")
    
    # Prisma (optional - boleh gagal)
    await sambungkan_prisma()
    
    logger.info("🚀 Database initialization complete")


async def putuskan_database():
    """Putuskan koneksi database saat aplikasi shutdown"""
    global _motor_client
    
    # Disconnect Prisma (optional)
    await putuskan_prisma()
    
    # Disconnect Motor (primary)
    if _motor_client is not None:
        _motor_client.close()
        _motor_client = None
        logger.info("❌ Motor client closed")
    
    logger.info("👋 Database connections closed")

