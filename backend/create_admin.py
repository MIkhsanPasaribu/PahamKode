"""
Script untuk membuat user admin
Jalankan: python create_admin.py
"""

import asyncio
from getpass import getpass
from prisma import Prisma
from passlib.context import CryptContext

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def buat_admin():
    """Buat user admin baru"""
    
    print("=" * 50)
    print("CREATE ADMIN USER - PahamKode")
    print("=" * 50)
    
    # Input data admin
    email = input("Email admin: ").strip()
    if not email:
        print("❌ Email tidak boleh kosong!")
        return
    
    nama = input("Nama admin (optional): ").strip() or None
    
    password = getpass("Password (min 8 karakter): ")
    if len(password) < 8:
        print("❌ Password minimal 8 karakter!")
        return
    
    password_confirm = getpass("Konfirmasi password: ")
    if password != password_confirm:
        print("❌ Password tidak cocok!")
        return
    
    # Connect ke database
    print("\n🔌 Connecting to database...")
    prisma = Prisma()
    await prisma.connect()
    
    try:
        # Cek apakah email sudah ada
        existing_user = await prisma.user.find_unique(where={"email": email})
        if existing_user:
            print(f"❌ User dengan email {email} sudah ada!")
            
            # Tanya apakah mau update role ke admin
            update = input("Update role user ini menjadi admin? (y/n): ").strip().lower()
            if update == 'y':
                updated_user = await prisma.user.update(
                    where={"email": email},
                    data={"role": "admin"}
                )
                if updated_user:
                    print(f"✅ User {email} berhasil diupdate menjadi admin!")
                    print(f"   ID: {updated_user.id}")
            return
        
        # Hash password
        print("🔒 Hashing password...")
        hashed_password = pwd_context.hash(password)
        
        # Buat user admin
        print("👤 Creating admin user...")
        admin = await prisma.user.create(
            data={
                "email": email,
                "nama": nama,
                "passwordHash": hashed_password,
                "role": "admin",
                "status": "aktif",
                "tingkatKemahiran": "mahir"
            }
        )
        
        print("\n" + "=" * 50)
        print("✅ ADMIN USER BERHASIL DIBUAT!")
        print("=" * 50)
        print(f"ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Nama: {admin.nama or '-'}")
        print(f"Role: {admin.role}")
        print(f"Status: {admin.status}")
        print("=" * 50)
        print("\n💡 Silakan login dengan email dan password yang telah dibuat.")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        await prisma.disconnect()
        print("\n🔌 Disconnected from database.")


if __name__ == "__main__":
    asyncio.run(buat_admin())
