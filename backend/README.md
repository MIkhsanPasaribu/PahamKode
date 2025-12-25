# PahamKode Backend

Backend API untuk sistem analisis semantik error pemrograman.

## Setup

1. **Install dependencies:**

```bash
pip install -r requirements.txt
```

2. **Setup environment variables:**

```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

3. **Generate Prisma Client:**

```bash
prisma generate
```

4. **Push schema ke database:**

```bash
prisma db push
```

5. **Run development server:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Analisis Error

- `POST /api/analyze` - Analisis error semantik

### Riwayat

- `GET /api/history/{id_mahasiswa}` - Dapatkan riwayat submisi
- `GET /api/history/{id_mahasiswa}/{id_submisi}` - Detail submisi

### Pola Kesalahan

- `GET /api/patterns/{id_mahasiswa}` - Dapatkan pola kesalahan
- `GET /api/patterns/{id_mahasiswa}/tren` - Analisis tren
- `GET /api/patterns/{id_mahasiswa}/progress` - Progress belajar

## Testing

```bash
# Type checking dengan pyright
pyright app/
```

## Dokumentasi API

Setelah server berjalan, akses:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
