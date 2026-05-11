# PrepVicta AI Backend (FastAPI)

This backend provides NEET tutoring with RAG using OpenAI + Pinecone. Materials are read from **Supabase Storage** in production (with local folder fallback for development).

## Features

- `POST /ingest`: Parses PDF material files, chunks text, creates embeddings, and uploads vectors to Pinecone.
- `POST /teach`: Retrieves relevant chunks and generates a tutor-style answer with citations.
- `GET /health`: Health check endpoint.

## Setup

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Create `.env` from `.env.example` and set:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME` (optional custom index)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`

Optional:
   - `SUPABASE_STORAGE_PREFIX` (if files are inside a subfolder of the bucket)
   - `SUPABASE_PROJECT_REF` (if you prefer deriving `SUPABASE_URL`)
   - Existing env compatibility: backend can infer project ref from `SUPABASE_USER=postgres.<project-ref>`
   - `MATERIALS_ROOT` local fallback (defaults to `../NEET 2026 Material`)

3. Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

4. Ingest materials once:

```bash
curl -X POST http://127.0.0.1:8000/ingest -H "Content-Type: application/json" -d "{}"
```

## Storage source selection

- If Supabase storage env vars are set, backend uses Supabase bucket files for:
  - `GET /materials/index`
  - `GET /materials/download`
  - `POST /ingest`
- If Supabase storage is not configured, backend falls back to local `MATERIALS_ROOT`.

## Frontend integration

Set this in the Next.js `.env` file for client calls:

```bash
NEXT_PUBLIC_AI_BACKEND_URL=http://127.0.0.1:8000
```
