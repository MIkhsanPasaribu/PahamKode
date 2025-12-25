# PahamKode - Analisis Semantik Error Pemrograman

Sistem berbasis AI untuk menganalisis error pemrograman dari sudut pandang **konseptual dan semantik**, bukan hanya sintaks.

## ✅ Status: SEMUA FITUR SUDAH SELESAI!

✅ **Backend Dependencies** - Installed (78 packages)  
✅ **Authentication** - Azure Cosmos DB + JWT Auth  
✅ **AI Provider** - **GitHub Models (FREE!)**  
✅ **History Page** - Complete with detail modal  
✅ **Patterns Page** - Visualization dengan bar charts  
✅ **Progress Dashboard** - Full tracking dengan trends  
✅ **Type Safety** - TypeScript & Python type checking **PASSED!**

**Total**: 8 new files, 4 updated files, ~2,000+ lines of code

📄 Lihat detail lengkap di [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env
DATABASE_URL=mongodb://pahamkode:PASSWORD@pahamkode.mongo.cosmos.azure.com:10255/pahamkode-db?ssl=true
USE_GITHUB_MODELS=true
GITHUB_TOKEN=ghp_xxxxx  # Get from: https://github.com/settings/tokens
GITHUB_MODEL_NAME=gpt-4o-mini
FRONTEND_URL=http://localhost:3000

# Run server
uvicorn app.main:app --reload
```

📘 **Tutorial lengkap**: [GITHUB_MODELS_SETUP.md](GITHUB_MODELS_SETUP.md)

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

### Testing

```bash
# Frontend type check
cd frontend && npx tsc --noEmit  # ✅ PASS

# Backend type check
cd backend && pyright app/  # ✅ PASS
```

---

## 🎯 Core Objectives

1. **Semantic Error Analysis** - Analisis error secara konseptual (MENGAPA error terjadi)
2. **Pattern Mining** - Identifikasi pola kesalahan berulang mahasiswa
3. **Adaptive Explanation** - Penjelasan disesuaikan dengan Bloom's Taxonomy
4. **Personalized Learning** - Rekomendasi pembelajaran yang dipersonalisasi

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js 14)           │
│  TypeScript + Tailwind CSS + Monaco     │
│  Azure Static Web Apps (FREE)           │
└─────────────────────────────────────────┘
                  ↓ HTTPS
┌─────────────────────────────────────────┐
│        BACKEND (FastAPI + Python)       │
│  LangChain + GitHub Models (FREE!)      │
│  Azure VM B1s ($7.59/month)             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    DATABASE (Azure Cosmos DB)           │
│  Prisma ORM + MongoDB API (FREE TIER)   │
└─────────────────────────────────────────┘
```

## 💰 Estimasi Biaya

**Recommended Setup (GitHub Models - FREE!):**

| Service                   | Tier/SKU          | Biaya/Bulan        |
| ------------------------- | ----------------- | ------------------ |
| **Azure Cosmos DB**       | Free Tier         | **$0**             |
| **Azure VM B1s**          | 1 vCPU, 1GB RAM   | **$7.59**          |
| **VM Disk (HDD)**         | Standard HDD 30GB | **$1.54**          |
| **GitHub Models (AI)**    | FREE              | **$0**             |
| **Azure Static Web Apps** | Free Tier         | **$0**             |
| **Total**                 |                   | **$9.13/bulan** ✅ |

**🎉 Hemat 70%+ dengan GitHub Models!** (vs Llama $240+/bulan)

### Capacity

- **GitHub Models**: 15 req/min, 150K tokens/day (~9K requests/month)
- **Perfect untuk**: Student projects, development, low-medium traffic (<10K users)
- **Upgrade path**: Azure OpenAI jika traffic meningkat (~$1.88/10K requests)

📘 **Tutorial lengkap**: [GITHUB_MODELS_SETUP.md](GITHUB_MODELS_SETUP.md)

**Development Setup (GitHub Models - GRATIS):**

- Azure VM B1s: $7.59/bulan
- GitHub Models: $0/bulan (FREE!)
- **Total: $7.59/bulan** ✅

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (via Supabase)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Generate Prisma Client
prisma generate

# Push schema ke database
prisma db push

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dengan konfigurasi Anda

# Run development server
npm run dev
```

Buka browser: http://localhost:3000

## 📁 Project Structure

```
PahamKode/
├── .github/
│   └── copilot-instructions.md    # Comprehensive development guide
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── config.py             # Environment variables
│   │   ├── database.py           # Prisma client
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic models
│   │   ├── services/
│   │   │   ├── ai_service.py     # AI integration (LangChain)
│   │   │   ├── analysis_service.py  # Semantic analysis
│   │   │   └── pattern_service.py   # Pattern mining
│   │   └── routes/
│   │       ├── analyze.py        # Analysis endpoint
│   │       ├── history.py        # History endpoint
│   │       └── patterns.py       # Patterns endpoint
│   └── prisma/
│       └── schema.prisma         # Database schema
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── analyze/
│   │   │   └── page.tsx         # Analysis page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── editor/              # Monaco Editor
│   │   └── analysis/            # Analysis display
│   ├── lib/
│   │   ├── api-client.ts        # Backend API client (type-safe)
│   │   └── supabase.ts          # Supabase client
│   └── types/
│       └── index.ts             # Type definitions
└── docs/
    └── explanation.md           # Project documentation
```

## ✅ Features Implemented

### Backend

- ✅ FastAPI application dengan struktur clean
- ✅ Prisma ORM integration dengan Supabase
- ✅ AI Service dengan LangChain (support Llama/GitHub Models/Azure OpenAI)
- ✅ Semantic Error Analysis service
- ✅ Pattern Mining service
- ✅ API endpoints untuk analyze, history, patterns
- ✅ Type-safe dengan Pydantic schemas

### Frontend

- ✅ Next.js 14 dengan App Router
- ✅ Landing page dengan feature showcase
- ✅ Analysis page dengan Monaco Code Editor
- ✅ Real-time error analysis dengan AI
- ✅ Analysis result display dengan UI yang clean
- ✅ Type-safe API client dengan Zod validation
- ✅ Responsive design dengan Tailwind CSS

## 🧪 Testing

### Backend Type Checking

```bash
cd backend
pyright app/
```

### Frontend Type Checking

```bash
cd frontend
npx tsc --noEmit
```

## 📖 Syarat Pengembangan

✅ **Bahasa**: Full Bahasa Indonesia untuk:

- Nama variabel dan function
- String, comments, dan dokumentasi
- (Kecuali nama file dan library eksternal)

✅ **Code Quality**:

- Best practices & design patterns
- Readable, clean, maintainable
- Scalable, reliable, simple
- Type-safe (TypeScript + Python type hints)

## 🔐 Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://...
USE_LLAMA=false
USE_GITHUB_MODELS=true
GITHUB_TOKEN=ghp_xxxxx
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚧 Roadmap

- [ ] Authentication dengan Supabase Auth
- [ ] History page untuk riwayat submisi
- [ ] Patterns page dengan visualization
- [ ] Progress dashboard per topik
- [ ] Export hasil analisis (PDF)
- [ ] Integration dengan IDE (VS Code extension)

## 📚 Documentation

Untuk dokumentasi lengkap tentang pengembangan, architecture, dan deployment, lihat:

- [Copilot Instructions](.github/copilot-instructions.md) - Comprehensive development guide
- [Project Explanation](docs/explanation.md) - Detailed project documentation

## 👥 Contributors

- Mikhael Sugianto

## 📄 License

MIT License

---

**PahamKode** - Memahami error dari perspektif konseptual 🧠
