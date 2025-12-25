"""
Database connection dengan Prisma Client untuk Azure Cosmos DB (MongoDB API)
"""

from prisma import Prisma  # type: ignore

# Instance Prisma Client
prisma = Prisma()


async def sambungkan_database():
    """Sambungkan ke Azure Cosmos DB saat aplikasi startup"""
    await prisma.connect()
    print("✅ Azure Cosmos DB tersambung")


async def putuskan_database():
    """Putuskan koneksi database saat aplikasi shutdown"""
    await prisma.disconnect()
    print("❌ Database terputus")
