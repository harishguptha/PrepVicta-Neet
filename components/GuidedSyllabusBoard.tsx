"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface MaterialFile {
  name: string;
  relativePath: string;
  sizeBytes: number;
}

interface MaterialCategory {
  category: string;
  files: MaterialFile[];
}

interface GuidedSyllabusBoardProps {
  categories?: MaterialCategory[];
}

type ProgressState = Record<string, number>;

const STORAGE_KEY = "guided-neet-syllabus-progress-v1";

function parseTopicLabel(fileName: string) {
  const noExt = fileName.replace(/\.[^.]+$/, "");
  return noExt
    .replace(/^Ch\d+_/i, "")
    .replace(/^NEET_\d+_/i, "")
    .replace(/_/g, " ")
    .trim();
}

function parseChapterLabel(fileName: string) {
  const match = fileName.match(/^(Ch\d+)/i);
  return match ? match[1].toUpperCase() : "Topic";
}

function loadProgress(categories: MaterialCategory[]): ProgressState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ProgressState) : {};

    const cleaned: ProgressState = {};
    for (const category of categories) {
      const cappedValue = Math.max(0, Math.min(parsed[category.category] ?? 0, category.files.length));
      cleaned[category.category] = cappedValue;
    }

    return cleaned;
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function GuidedSyllabusBoard({ categories: initialCategories = [] }: GuidedSyllabusBoardProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MaterialCategory[]>(initialCategories);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(initialCategories.length === 0);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress(initialCategories));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isAlreadySynced, setIsAlreadySynced] = useState(false);

  const normalized = useMemo(() => {
    return categories.map((category) => {
      const sortedFiles = [...category.files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const currentIndex = progress[category.category] ?? 0;
      const currentTopic = currentIndex < sortedFiles.length ? sortedFiles[currentIndex] : null;
      const completedCount = Math.min(currentIndex, sortedFiles.length);

      return {
        category: category.category,
        files: sortedFiles,
        currentIndex,
        currentTopic,
        completedCount,
      };
    });
  }, [categories, progress]);

  const totalTopics = normalized.reduce((sum, category) => sum + category.files.length, 0);
  const completedTopics = normalized.reduce((sum, category) => sum + category.completedCount, 0);
  const completionPct = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  async function trackEvent(eventName: string, metadata: Record<string, unknown>) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventSource: "guided_syllabus_board",
          userEmail: user?.email,
          metadata,
        }),
      });
    } catch {
      // Tracking should not break UX.
    }
  }

  useEffect(() => {
    if (initialCategories.length > 0) return;

    let cancelled = false;
    async function loadCategories() {
      setIsCategoriesLoading(true);
      try {
        const response = await fetch("/api/materials");
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        const loadedCategories = (payload?.categories ?? []) as MaterialCategory[];
        setCategories(loadedCategories);
        setProgress((prev) => ({ ...loadProgress(loadedCategories), ...prev }));
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setIsCategoriesLoading(false);
      }
    }
    void loadCategories();
    return () => {
      cancelled = true;
    };
    // initialCategories is set on mount in current usage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSyncStatus() {
      try {
        const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
        const response = await fetch(`/api/materials/sync-status${query}`);
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled) return;
        const synced = Boolean(payload?.synced);
        setIsAlreadySynced(synced);
        if (synced) {
          setSyncMessage(
            `Materials already synced (${payload.filesIndexed ?? 0} files, ${payload.chunksIndexed ?? 0} chunks).`
          );
        }
      } catch {
        // fail silently for status fetch
      }
    }
    void loadSyncStatus();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const markComplete = (categoryName: string, totalInCategory: number) => {
    setProgress((prev) => {
      const nextValue = Math.min((prev[categoryName] ?? 0) + 1, totalInCategory);
      const next = { ...prev, [categoryName]: nextValue };
      saveProgress(next);
      return next;
    });
    void trackEvent("topic_marked_complete", { category: categoryName, totalInCategory });
    toast.success("Progress updated");
  };

  const syncMaterialsToAi = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    await trackEvent("materials_sync_started", { categoryCount: categories.length });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "http://127.0.0.1:8000"}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail ?? "Failed to sync study materials.");
      }

      const payload = await response.json();
      await fetch("/api/materials/sync-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          synced: true,
          filesIndexed: payload.files_indexed ?? 0,
          chunksIndexed: payload.chunks_indexed ?? 0,
          userEmail: user?.email,
        }),
      });
      setIsAlreadySynced(true);
      setSyncMessage(`Synced ${payload.files_indexed} files and ${payload.chunks_indexed} chunks to AI.`);
      toast.success("Materials synced successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync study materials.";
      setSyncMessage(message);
      await trackEvent("materials_sync_failed", { message });
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm flex flex-col gap-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
          <div>
            <p className="text-[13px] text-on-surface-variant">
              Showing your next topic in each category. Complete one to unlock the next.
            </p>
            <p className="text-[13px] font-medium text-on-surface mt-1">
              {completedTopics} / {totalTopics} topics completed ({completionPct}%)
            </p>
          </div>
          {!isAlreadySynced ? (
            <button
              onClick={syncMaterialsToAi}
              disabled={isSyncing}
              className="shrink-0 bg-tertiary text-on-tertiary text-[13px] font-semibold tracking-[0.05em] px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSyncing ? "Syncing..." : "Sync Materials to AI"}
            </button>
          ) : (
            <span className="shrink-0 text-[12px] font-semibold text-tertiary">Synced</span>
          )}
        </div>
        {syncMessage ? <p className="text-[12px] text-on-surface-variant">{syncMessage}</p> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {isCategoriesLoading ? (
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
            <p className="text-[14px] text-on-surface-variant">Loading syllabus...</p>
          </div>
        ) : null}
        {normalized.map((category) => {
          if (!category.currentTopic) {
            return (
              <div key={category.category} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
                <div className="flex items-center justify-between mb-sm">
                  <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">{category.category}</h3>
                  <span className="text-[12px] text-on-surface-variant">Completed</span>
                </div>
                <p className="text-[14px] text-on-surface-variant">All topics in this category are complete.</p>
              </div>
            );
          }

          const topicName = parseTopicLabel(category.currentTopic.name);
          const chapterLabel = parseChapterLabel(category.currentTopic.name);

          return (
            <div key={category.category} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between gap-sm">
                <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">{category.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-on-surface-variant">
                    {category.currentIndex + 1} / {category.files.length}
                  </span>
                  <button
                    onClick={() => {
                      const open = expandedCategory !== category.category;
                      setExpandedCategory((prev) => (prev === category.category ? null : category.category));
                      void trackEvent("view_all_toggle", { category: category.category, open });
                    }}
                    className="text-[12px] font-semibold text-secondary hover:underline"
                  >
                    {expandedCategory === category.category ? "Hide" : "View All"}
                  </button>
                </div>
              </div>
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mt-sm">{topicName}</h3>
              <p className="text-[14px] text-on-surface-variant">{chapterLabel}</p>
              <div className="mt-md flex flex-col sm:flex-row gap-sm">
                <Link
                  href={`/prepai?category=${encodeURIComponent(category.category)}&topic=${encodeURIComponent(topicName)}&source=${encodeURIComponent(category.currentTopic.relativePath)}`}
                  onClick={() => {
                    void trackEvent("start_learning_clicked", {
                      category: category.category,
                      topic: topicName,
                      source: category.currentTopic?.relativePath ?? null,
                    });
                  }}
                  className="flex-1 text-center bg-primary text-on-primary text-[14px] font-semibold tracking-[0.05em] py-2.5 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
                >
                  Start Learning
                </Link>
                <button
                  onClick={() => markComplete(category.category, category.files.length)}
                  className="flex-1 sm:flex-none bg-secondary text-on-secondary text-[14px] font-semibold tracking-[0.05em] px-4 py-2.5 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors shadow-sm"
                >
                  Mark Complete
                </button>
              </div>
              {expandedCategory === category.category ? (
                <div className="mt-md space-y-2">
                  <p className="text-[12px] font-medium text-on-surface-variant">Syllabus in this category</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {category.files.map((file, index) => {
                      const isCurrent = index === category.currentIndex;
                      return (
                        <div
                          key={file.relativePath}
                          className={`rounded-lg border border-outline-variant/30 px-3 py-2 ${
                            isCurrent ? "bg-secondary-container/20" : "bg-surface-container-low opacity-80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={`text-[13px] ${isCurrent ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                              {parseTopicLabel(file.name)}
                            </span>
                            {!isCurrent ? (
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">lock</span>
                            ) : (
                              <span className="text-[11px] font-semibold text-secondary">Current</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
