"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseChapterLabel(sourcePath: string) {
  const fileName = sourcePath.split("/").pop() ?? "";
  const match = fileName.match(/^(Ch\d+)/i);
  return match ? match[1].toUpperCase() : "Topic";
}

interface LessonBlockResponse {
  answer: string;
  citations: string[];
  block_index: number;
  total_blocks: number;
  has_next: boolean;
}

export default function DeepLearningPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "Biology";
  const topic = searchParams.get("topic") ?? "Human Reproduction";
  const source = searchParams.get("source") ?? "";
  const chapterLabel = parseChapterLabel(source);
  const [blockIndex, setBlockIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonText, setLessonText] = useState<string>("");
  const [citations, setCitations] = useState<string[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [totalBlocks, setTotalBlocks] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const autoLoadedKey = useRef<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "http://127.0.0.1:8000";

  const lessonPrompt = useMemo(() => `Teach me ${topic} from basics for NEET 2026.`, [topic]);

  const loadBlock = async (nextIndex: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/teach/context-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: lessonPrompt,
          category,
          topic,
          source_path: source,
          block_index: nextIndex,
          block_size: 2,
          history: [],
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail ?? "Failed to load AI lesson block.");
      }

      const payload = (await response.json()) as LessonBlockResponse;
      setLessonText(payload.answer);
      setCitations(payload.citations ?? []);
      setBlockIndex(payload.block_index ?? 0);
      setHasNext(Boolean(payload.has_next));
      setTotalBlocks(payload.total_blocks ?? 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI lesson block.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const key = `${category}:${topic}:${source}`;
    if (autoLoadedKey.current === key) return;
    autoLoadedKey.current = key;
    void loadBlock(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, topic, source]);

  return (
    <div className="pv-lesson-page">
      <div>
        <div className="pv-page-breadcrumb">
          <Link href="/learn" className="pv-page-breadcrumb-link">Learning Centre</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <span>{category}</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className="pv-page-breadcrumb-current">{topic}</span>
        </div>

        <article className="pv-lesson-card">
          <header className="pv-lesson-header">
            <div className="pv-lesson-meta">
              <span className="pv-badge-secondary">{chapterLabel}</span>
              <span className="pv-lesson-block">Block {blockIndex + 1} / {totalBlocks}</span>
            </div>
            <h1 className="pv-lesson-title">{topic}</h1>
            <p className="pv-lesson-subtitle">
              AI-guided learning from your selected NEET material.
            </p>
          </header>

          <div className="pv-lesson-body">
            {isLoading ? (
              <div className="pv-lesson-status pv-lesson-status-info">
                <p>Reading context block and generating lesson...</p>
              </div>
            ) : error ? (
              <div className="pv-lesson-status pv-lesson-status-error">
                <p>{error}</p>
              </div>
            ) : (
              <div className="pv-lesson-text prose max-w-none text-on-surface text-[15px] leading-[1.75]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lessonText}</ReactMarkdown>
              </div>
            )}

            {citations.length > 0 && (
              <div className="pv-lesson-sources">
                <p className="pv-lesson-sources-title">Context Sources</p>
                <ul className="pv-lesson-source-list">
                  {citations.map((citation) => (
                    <li key={citation}>{citation}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pv-lesson-actions">
              <button
                onClick={() => void loadBlock(blockIndex)}
                disabled={isLoading}
                className="pv-lesson-button pv-lesson-button-secondary"
              >
                Refresh Block
              </button>
              <button
                onClick={() => void loadBlock(blockIndex + 1)}
                disabled={isLoading || !hasNext}
                className="pv-lesson-button pv-lesson-button-primary"
              >
                Next Context Block
              </button>
            </div>
          </div>
        </article>
      </div>

      <aside className="pv-ai-tutor-card">
        <div className="pv-ai-tutor-header">
          <span className="material-symbols-outlined pv-ai-tutor-icon" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <div>
            <p className="pv-ai-tutor-title">Experienced Tutor</p>
          </div>
        </div>
        <div className="pv-ai-tutor-content">
          <div className="pv-ai-tutor-panel pv-ai-tutor-panel-soft">
            <p className="pv-ai-tutor-label">Nudge</p>
            <p>Complete each context block and then continue to the next to build full chapter mastery.</p>
          </div>
          <div className="pv-ai-tutor-panel pv-ai-tutor-panel-soft">
            <p className="pv-ai-tutor-label">Current Context</p>
            <p>{category} • {chapterLabel} • {topic}</p>
          </div>
          <div className="pv-ai-tutor-panel pv-ai-tutor-panel-warning">
            <p className="pv-ai-tutor-label">Study Tip</p>
            <p>Ask tutor doubts after each block to lock in retention before moving to the next block.</p>
          </div>
        </div>
        <div className="pv-ai-tutor-footer">
          <Link
            href={`/prepai?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&source=${encodeURIComponent(source)}`}
            className="pv-lesson-button pv-lesson-button-primary pv-ai-tutor-cta"
          >
            <span className="material-symbols-outlined">chat</span>
            Ask AI Tutor
          </Link>
        </div>
      </aside>
    </div>
  );
}
