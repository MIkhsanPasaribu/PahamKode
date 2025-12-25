"""
Script untuk membuat admin user menggunakan Motor (PyMongo async driver).

Script ini menggantikan create_admin.py yang menggunakan Prisma,
karena Prisma + Cosmos DB tidak compatible (Error 17276).

Motor bekerja 100% dengan Cosmos DB MongoDB API.
"""

import asyncio
import sys
from getpass import getpass


async def buat_admin():
    """
    Buat admin user baru dengan Motor (async PyMongo)
    """
    
    print("=" * 60)
    print("🔧 PAHAMKODE - CREATE ADMIN USER (MOTOR)")
    print("=" * 60)
    print()
    
    # Import dependencies
    try:
        from app.config import settings
        from app.repositories.user_repository import buat_user, cari_user_by_email
        from app.utils.auth import hash_password
        print("✅ Dependencies loaded")
    except ImportError as e:
        print(f"❌ Error importing dependencies: {e}")
        print("   Make sure you're in the backend/ directory and venv is activated")
        sys.exit(1)
    
    print()
    print("📝 Masukkan informasi admin:")
    print("-" * 60)
    
    # Input data
    email = input("Email admin: ").strip()
    
    if not email or "@" not in email:
        print("❌ Email tidak valid!")
        sys.exit(1)
    
    nama = input("Nama lengkap (optional): ").strip()
    if not nama:
        nama = None
    
    password = getpass("Password: ")
    password_confirm = getpass("Konfirmasi password: ")
    
    if password != password_confirm:
        print("❌ Password tidak cocok!")
        sys.exit(1)
    
    if len(password) < 6:
        print("❌ Password minimal 6 karakter!")
        sys.exit(1)
    
    print()
    print("-" * 60)
    print(f"📌 Email: {email}")
    print(f"📌 Nama: {nama or '(tidak diisi)'}")
    print(f"📌 Role: admin")
    print(f"📌 Tingkat kemahiran: pemula")
    print("-" * 60)
    
    konfirmasi = input("\n✅ Lanjutkan? (y/n): ").strip().lower()
    
    if konfirmasi != 'y':
        print("❌ Dibatalkan")
        sys.exit(0)
    
    print()
    print("🔄 Membuat admin user...")
    
    try:
        # Connect ke database
        from app.database import sambungkan_database, putuskan_database
        await sambungkan_database()
        print("✅ Terhubung ke Cosmos DB")
        
        # Check apakah email sudah ada
        existing = await cari_user_by_email(email)
        if existing:
            print(f"❌ Email {email} sudah terdaftar!")
            await putuskan_database()
            sys.exit(1)
        
        # Hash password
        password_hash = hash_password(password)
        print("✅ Password di-hash")
        
        # Buat user dengan Motor
        user = await buat_user(
            email=email,
            nama=nama,
            password_hash=password_hash,
            role="admin",
            tingkat_kemahiran="pemula"
        )
        
        print()
        print("=" * 60)
        print("✅ ADMIN USER BERHASIL DIBUAT!")
        print("=" * 60)
        print(f"ID: {user['id']}")
        print(f"Email: {user['email']}")
        print(f"Nama: {user.get('nama', '(tidak diisi)')}")
        print(f"Role: {user['role']}")
        print(f"Created at: {user['createdAt']}")
        print("=" * 60)
        print()
        print("🎉 Admin user siap digunakan untuk login!")
        print()
        
        # Disconnect
        await putuskan_database()
        
    except ValueError as e:
        print(f"❌ Validation error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(buat_admin())
    except KeyboardInterrupt:
        print("\n❌ Dibatalkan oleh user")
        sys.exit(1)
