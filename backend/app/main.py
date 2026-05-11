from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pinecone.exceptions import PineconeApiException
from pinecone import Pinecone, ServerlessSpec
from pydantic import BaseModel, Field
from pypdf.errors import LimitReachedError, PdfReadError
from pypdf import PdfReader

load_dotenv()
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "neet-2026-materials")
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "default")
MATERIALS_ROOT = Path(os.getenv("MATERIALS_ROOT", "../NEET 2026 Material")).resolve()
SUPABASE_HOST = os.getenv("SUPABASE_HOST", "")
SUPABASE_USER = os.getenv("SUPABASE_USER", "")


def infer_supabase_project_ref() -> str:
    if SUPABASE_USER.startswith("postgres."):
        return SUPABASE_USER.split(".", 1)[1].strip()
    host_match = re.search(r"(?:db|aws-[^./]+)\.([a-z0-9]+)\.supabase\.co", SUPABASE_HOST)
    if host_match:
        return host_match.group(1)
    return ""


SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", infer_supabase_project_ref())
SUPABASE_URL = (os.getenv("SUPABASE_URL") or (f"https://{SUPABASE_PROJECT_REF}.supabase.co" if SUPABASE_PROJECT_REF else "")).rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_API_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "neet-2026-materials")
SUPABASE_STORAGE_PREFIX = os.getenv("SUPABASE_STORAGE_PREFIX", "").strip("/")
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is required.")
if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY is required.")

openai_client = OpenAI(api_key=OPENAI_API_KEY)
pinecone_client = Pinecone(api_key=PINECONE_API_KEY)

app = FastAPI(title="PrepVicta AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: str
    content: str


class TeachRequest(BaseModel):
    question: str = Field(min_length=3)
    category: str | None = None
    topic: str | None = None
    source_path: str | None = None
    history: list[HistoryMessage] = Field(default_factory=list)


class TeachResponse(BaseModel):
    answer: str
    citations: list[str]


class TeachBlockRequest(BaseModel):
    question: str = Field(default="Teach this topic step by step for NEET.")
    category: str | None = None
    topic: str | None = None
    source_path: str | None = None
    block_index: int = 0
    block_size: int = 2
    history: list[HistoryMessage] = Field(default_factory=list)


class TeachBlockResponse(BaseModel):
    answer: str
    citations: list[str]
    block_index: int
    total_blocks: int
    has_next: bool


class IngestRequest(BaseModel):
    namespace: str = PINECONE_NAMESPACE
    max_files: int | None = None
    force: bool = False


def sanitize_topic(file_name: str) -> str:
    stem = Path(file_name).stem
    stem = re.sub(r"^Ch\d+_", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"^NEET_\d+_", "", stem, flags=re.IGNORECASE)
    return stem.replace("_", " ").strip()


def chunk_text(text: str, chunk_size: int = 1400, overlap: int = 220) -> list[str]:
    clean = " ".join(text.split())
    if not clean:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(clean):
        end = min(start + chunk_size, len(clean))
        chunks.append(clean[start:end])
        if end >= len(clean):
            break
        start = max(0, end - overlap)
    return chunks


def is_supabase_storage_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET)


@app.on_event("startup")
def log_material_source_bootstrap() -> None:
    logger.info(
        "material-source bootstrap supabase_configured=%s bucket=%s local_root=%s",
        is_supabase_storage_configured(),
        SUPABASE_STORAGE_BUCKET,
        MATERIALS_ROOT,
    )


def supabase_headers(include_json_content_type: bool = False) -> dict[str, str]:
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }
    if include_json_content_type:
        headers["Content-Type"] = "application/json"
    return headers


def supabase_request(method: str, endpoint: str, payload: dict[str, Any] | None = None) -> Any:
    if not is_supabase_storage_configured():
        raise RuntimeError("Supabase storage is not configured.")

    url = f"{SUPABASE_URL}{endpoint}"
    data = None
    headers = supabase_headers(include_json_content_type=payload is not None)
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    request = Request(url=url, data=data, headers=headers, method=method)
    try:
        with urlopen(request, timeout=60) as response:
            raw = response.read()
            if not raw:
                return None
            return json.loads(raw.decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"Supabase storage request failed: {detail}") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase storage unavailable: {exc.reason}") from exc


def list_supabase_pdf_objects() -> list[dict[str, Any]]:
    if not is_supabase_storage_configured():
        return []

    queue: list[str] = [SUPABASE_STORAGE_PREFIX] if SUPABASE_STORAGE_PREFIX else [""]
    files: list[dict[str, Any]] = []
    visited: set[str] = set()

    while queue:
        prefix = queue.pop(0)
        if prefix in visited:
            continue
        visited.add(prefix)

        payload = {
            "prefix": prefix,
            "limit": 1000,
            "offset": 0,
            "sortBy": {"column": "name", "order": "asc"},
        }
        items = supabase_request("POST", f"/storage/v1/object/list/{SUPABASE_STORAGE_BUCKET}", payload) or []
        for item in items:
            name = item.get("name")
            if not name:
                continue
            full_path = f"{prefix}/{name}" if prefix else name
            is_folder = item.get("id") is None
            if is_folder:
                queue.append(full_path)
                continue
            if not full_path.lower().endswith(".pdf"):
                continue
            size_bytes = int((item.get("metadata") or {}).get("size") or 0)
            files.append(
                {
                    "relative_path": full_path,
                    "name": Path(full_path).name,
                    "size_bytes": size_bytes,
                    "storage": "supabase",
                }
            )

    return sorted(files, key=lambda item: item["relative_path"])


def download_supabase_object(relative_path: str) -> bytes:
    if not is_supabase_storage_configured():
        raise RuntimeError("Supabase storage is not configured.")

    safe_path = quote(relative_path, safe="/")
    endpoint = f"/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{safe_path}"
    url = f"{SUPABASE_URL}{endpoint}"
    request = Request(url=url, headers=supabase_headers(), method="GET")
    try:
        with urlopen(request, timeout=120) as response:
            return response.read()
    except HTTPError as exc:
        if exc.code == 404:
            raise HTTPException(status_code=404, detail="File not found in Supabase storage.") from exc
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"Supabase download failed: {detail}") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase storage unavailable: {exc.reason}") from exc


def collect_local_material_records(root: Path) -> list[dict[str, Any]]:
    if not root.exists():
        return []
    records: list[dict[str, Any]] = []
    for path in sorted([p for p in root.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf"]):
        records.append(
            {
                "relative_path": path.relative_to(root).as_posix(),
                "name": path.name,
                "size_bytes": path.stat().st_size,
                "storage": "local",
                "absolute_path": path,
            }
        )
    return records


def collect_material_records() -> list[dict[str, Any]]:
    if is_supabase_storage_configured():
        records = list_supabase_pdf_objects()
        if records:
            return records
    return collect_local_material_records(MATERIALS_ROOT)


def detect_material_source(records: list[dict[str, Any]]) -> str:
    if not records:
        if is_supabase_storage_configured():
            return "supabase (configured, but empty or inaccessible)"
        return f"local ({MATERIALS_ROOT})"
    first_source = records[0].get("storage", "local")
    if first_source == "supabase":
        return f"supabase bucket '{SUPABASE_STORAGE_BUCKET}'"
    return f"local folder '{MATERIALS_ROOT}'"


def read_pdf_pages_from_bytes(pdf_bytes: bytes) -> tuple[list[str], int]:
    reader = PdfReader(BytesIO(pdf_bytes), strict=False)
    pages: list[str] = []
    skipped_pages = 0
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except LimitReachedError:
            # Skip pathological streams that exceed pypdf decompression guard rails.
            pages.append("")
            skipped_pages += 1
        except Exception:
            pages.append("")
            skipped_pages += 1
    return pages, skipped_pages


def read_pdf_pages(path: Path) -> tuple[list[str], int]:
    return read_pdf_pages_from_bytes(path.read_bytes())


def collect_material_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return sorted([path for path in root.rglob("*") if path.is_file() and path.suffix.lower() == ".pdf"])


def resolve_material_path(relative_path: str) -> Path | None:
    normalized = relative_path.replace("\\", "/").strip()
    if not normalized or ".." in normalized:
        return None
    absolute = (MATERIALS_ROOT / normalized).resolve()
    if not str(absolute).startswith(str(MATERIALS_ROOT.resolve())):
        return None
    if not absolute.exists() or not absolute.is_file():
        return None
    return absolute


def ensure_index(index_name: str) -> Any:
    existing = pinecone_client.list_indexes()
    names = existing.names() if hasattr(existing, "names") else [item.get("name") for item in existing]
    if index_name not in names:
        try:
            pinecone_client.create_index(
                name=index_name,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud=PINECONE_CLOUD, region=PINECONE_REGION),
            )
        except PineconeApiException as exc:
            # Concurrent requests may race to create the same index.
            if getattr(exc, "status", None) != 409 and "ALREADY_EXISTS" not in str(exc):
                raise
    return pinecone_client.Index(index_name)


def retrieve_context_matches(
    index: Any,
    *,
    question: str,
    category: str | None,
    source_path: str | None,
    top_k: int = 8,
) -> list[dict[str, Any]]:
    query_embedding = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=question,
    ).data[0].embedding

    filter_payload: dict[str, Any] = {}
    if category:
        filter_payload["category"] = {"$eq": category}
    if source_path:
        filter_payload["source_path"] = {"$eq": source_path}

    query_kwargs: dict[str, Any] = {
        "vector": query_embedding,
        "top_k": top_k,
        "include_metadata": True,
        "namespace": PINECONE_NAMESPACE,
    }
    if filter_payload:
        query_kwargs["filter"] = filter_payload

    results = index.query(**query_kwargs)
    matches = results.get("matches", [])

    if not matches and filter_payload:
        query_kwargs.pop("filter")
        results = index.query(**query_kwargs)
        matches = results.get("matches", [])

    return matches


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/materials/index")
def materials_index() -> dict[str, list[dict[str, Any]]]:
    files = collect_material_records()
    logger.info("materials/index source=%s files=%s", detect_material_source(files), len(files))
    grouped: dict[str, list[dict[str, Any]]] = {}

    for file_record in files:
        relative_path = file_record["relative_path"]
        category = relative_path.split("/")[0] if "/" in relative_path else "General"
        grouped.setdefault(category, []).append(
            {
                "name": file_record["name"],
                "relativePath": relative_path,
                "sizeBytes": file_record["size_bytes"],
            }
        )

    categories = []
    for category_name in sorted(grouped.keys()):
        files_sorted = sorted(grouped[category_name], key=lambda item: item["name"])
        categories.append({"category": category_name, "files": files_sorted})

    return {"categories": categories}


@app.get("/materials/download")
def materials_download(path: str):
    relative_path = unquote(path)
    if not relative_path:
        raise HTTPException(status_code=400, detail="Invalid file path.")

    if is_supabase_storage_configured():
        logger.info("materials/download source=supabase path=%s", relative_path)
        file_bytes = download_supabase_object(relative_path)
        ext = Path(relative_path).suffix.lower()
        file_name = Path(relative_path).name
    else:
        logger.info("materials/download source=local path=%s", relative_path)
        absolute_path = resolve_material_path(relative_path)
        if not absolute_path:
            raise HTTPException(status_code=400, detail="Invalid file path.")
        try:
            file_bytes = absolute_path.read_bytes()
        except OSError as exc:
            raise HTTPException(status_code=404, detail="File not found.") from exc
        ext = absolute_path.suffix.lower()
        file_name = absolute_path.name

    mime_by_ext = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".txt": "text/plain",
        ".mp3": "audio/mpeg",
    }
    content_type = mime_by_ext.get(ext, "application/octet-stream")

    return Response(
        content=file_bytes,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{file_name}"'},
    )


@app.post("/ingest")
def ingest_documents(payload: IngestRequest) -> dict[str, int | str]:
    files = collect_material_records()
    logger.info("ingest source=%s files=%s namespace=%s", detect_material_source(files), len(files), payload.namespace)
    if payload.max_files is not None:
        files = files[: payload.max_files]
    if not files:
        raise HTTPException(status_code=400, detail="No PDF files found in configured materials source.")

    index = ensure_index(PINECONE_INDEX_NAME)

    files_indexed = 0
    files_failed = 0
    pages_skipped = 0
    chunks_indexed = 0
    vectors_batch: list[dict[str, Any]] = []

    for file_record in files:
        relative_path = file_record["relative_path"]
        category = relative_path.split("/")[0] if "/" in relative_path else "General"
        topic = sanitize_topic(file_record["name"])
        try:
            if file_record["storage"] == "supabase":
                file_bytes = download_supabase_object(relative_path)
                pages, skipped_pages_for_file = read_pdf_pages_from_bytes(file_bytes)
            else:
                pages, skipped_pages_for_file = read_pdf_pages(file_record["absolute_path"])
            pages_skipped += skipped_pages_for_file
        except (PdfReadError, LimitReachedError, OSError, ValueError):
            files_failed += 1
            continue
        page_count = 0

        for page_number, page_text in enumerate(pages, start=1):
            for chunk_idx, chunk in enumerate(chunk_text(page_text)):
                chunk_id = hashlib.sha1(f"{relative_path}:{page_number}:{chunk_idx}".encode("utf-8")).hexdigest()
                embedding = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=chunk).data[0].embedding
                vectors_batch.append(
                    {
                        "id": chunk_id,
                        "values": embedding,
                        "metadata": {
                            "category": category,
                            "topic": topic,
                            "source_path": relative_path,
                            "file_name": file_record["name"],
                            "page": page_number,
                            "text": chunk,
                        },
                    }
                )
                chunks_indexed += 1
                page_count += 1

                if len(vectors_batch) >= 40:
                    index.upsert(vectors=vectors_batch, namespace=payload.namespace)
                    vectors_batch = []

        if page_count > 0:
            files_indexed += 1

    if vectors_batch:
        index.upsert(vectors=vectors_batch, namespace=payload.namespace)

    return {
        "status": "success",
        "files_indexed": files_indexed,
        "files_failed": files_failed,
        "pages_skipped": pages_skipped,
        "chunks_indexed": chunks_indexed,
        "index": PINECONE_INDEX_NAME,
        "namespace": payload.namespace,
    }


@app.post("/teach", response_model=TeachResponse)
def teach(payload: TeachRequest) -> TeachResponse:
    index = ensure_index(PINECONE_INDEX_NAME)

    matches = retrieve_context_matches(
        index,
        question=payload.question,
        category=payload.category,
        source_path=payload.source_path,
        top_k=8,
    )

    contexts: list[str] = []
    citations: list[str] = []

    for match in matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if not text:
            continue
        source_path = metadata.get("source_path", "unknown")
        page = metadata.get("page", "?")
        contexts.append(f"Source: {source_path} (page {page})\n{text}")
        citations.append(f"{source_path} (page {page})")

    if not contexts:
        contexts.append("No indexed context found. Answer with fundamental NEET-level teaching approach.")

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are PrepAI, an NEET tutor. Explain clearly, use stepwise teaching, memory aids, and exam strategy. "
                "Prefer evidence from context. If context is missing, state that and teach from fundamentals."
            ),
        }
    ]

    for item in payload.history[-8:]:
        role = "assistant" if item.role == "assistant" else "user"
        messages.append({"role": role, "content": item.content})

    context_block = "\n\n---\n\n".join(contexts[:6])
    prompt = (
        f"Student category: {payload.category or 'General'}\n"
        f"Current topic: {payload.topic or 'Not provided'}\n"
        f"Question: {payload.question}\n\n"
        f"Reference context:\n{context_block}\n\n"
        "Respond in a concise NEET teaching style with:\n"
        "1) concept explanation\n2) common trap\n3) quick recall point."
    )
    messages.append({"role": "user", "content": prompt})

    completion = openai_client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.35,
    )

    answer = completion.choices[0].message.content or "I could not generate a response."

    unique_citations = list(dict.fromkeys(citations))[:5]
    return TeachResponse(answer=answer, citations=unique_citations)


@app.post("/teach/context-block", response_model=TeachBlockResponse)
def teach_context_block(payload: TeachBlockRequest) -> TeachBlockResponse:
    index = ensure_index(PINECONE_INDEX_NAME)

    matches = retrieve_context_matches(
        index,
        question=payload.question,
        category=payload.category,
        source_path=payload.source_path,
        top_k=18,
    )

    contexts: list[dict[str, str]] = []
    for match in matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if not text:
            continue
        source_path = metadata.get("source_path", "unknown")
        page = metadata.get("page", "?")
        contexts.append(
            {
                "context": f"Source: {source_path} (page {page})\n{text}",
                "citation": f"{source_path} (page {page})",
            }
        )

    if not contexts:
        completion = openai_client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are PrepAI, an NEET tutor. Teach from fundamentals when context is unavailable.",
                },
                {
                    "role": "user",
                    "content": (
                        f"Topic: {payload.topic or 'NEET topic'}\n"
                        f"Question: {payload.question}\n"
                        "Teach clearly with 3 sections: explanation, exam trap, quick recall."
                    ),
                },
            ],
            temperature=0.35,
        )
        answer = completion.choices[0].message.content or "I could not generate a lesson."
        return TeachBlockResponse(
            answer=answer,
            citations=[],
            block_index=0,
            total_blocks=1,
            has_next=False,
        )

    block_size = max(1, payload.block_size)
    blocks = [contexts[i : i + block_size] for i in range(0, len(contexts), block_size)]
    total_blocks = len(blocks)
    block_index = max(0, min(payload.block_index, total_blocks - 1))
    selected_block = blocks[block_index]
    context_block = "\n\n---\n\n".join(item["context"] for item in selected_block)
    citations = [item["citation"] for item in selected_block]

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are PrepAI, an NEET tutor. Teach in progressive blocks. "
                "Return markdown with headings and bullet points, keep it concise and actionable."
            ),
        }
    ]
    for item in payload.history[-8:]:
        role = "assistant" if item.role == "assistant" else "user"
        messages.append({"role": role, "content": item.content})

    messages.append(
        {
            "role": "user",
            "content": (
                f"You are teaching block {block_index + 1} of {total_blocks}.\n"
                f"Category: {payload.category or 'General'}\n"
                f"Topic: {payload.topic or 'NEET topic'}\n"
                f"Student request: {payload.question}\n\n"
                f"Reference context block:\n{context_block}\n\n"
                "Respond with markdown sections:\n"
                "## Concept\n## Exam Focus\n## Quick Recall"
            ),
        }
    )

    completion = openai_client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.35,
    )
    answer = completion.choices[0].message.content or "I could not generate a lesson block."

    return TeachBlockResponse(
        answer=answer,
        citations=list(dict.fromkeys(citations)),
        block_index=block_index,
        total_blocks=total_blocks,
        has_next=block_index < (total_blocks - 1),
    )
