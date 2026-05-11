"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function SelectSyllabusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/prepai";
  const toolLabel = searchParams.get("label") ?? "learning tool";

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [progress] = useState<ProgressState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProgressState) : {};
    } catch {
      return {};
    }
  });

  async function trackEvent(eventName: string, metadata: Record<string, unknown>) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventSource: "select_syllabus_page",
          userEmail: user?.email,
          metadata,
        }),
      });
    } catch {
      // Tracking should not break UX.
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/materials");
        const payload = await response.json();
        if (cancelled) return;
        const loadedCategories = (payload?.categories ?? []) as MaterialCategory[];
        setCategories(loadedCategories);
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allCategories = useMemo(() => ["All", ...categories.map((category) => category.category)], [categories]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return categories
      .filter((category) => activeCategory === "All" || category.category === activeCategory)
      .map((category) => {
        const sortedFiles = [...category.files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        const currentIndex = Math.max(0, Math.min(progress[category.category] ?? 0, sortedFiles.length));
        const unlockedFile = currentIndex < sortedFiles.length ? sortedFiles[currentIndex] : null;
        if (!unlockedFile) {
          return { ...category, files: [] as MaterialFile[] };
        }
        if (!normalizedQuery) {
          return { ...category, files: [unlockedFile] };
        }
        const topicLabel = parseTopicLabel(unlockedFile.name).toLowerCase();
        const isMatch = topicLabel.includes(normalizedQuery) || unlockedFile.name.toLowerCase().includes(normalizedQuery);
        return { ...category, files: isMatch ? [unlockedFile] : [] };
      })
      .filter((category) => category.files.length > 0);
  }, [activeCategory, categories, progress, query]);

  const openToolWithSyllabus = (category: string, file: MaterialFile) => {
    const topic = parseTopicLabel(file.name);
    void trackEvent("syllabus_selected_for_tool", {
      toolLabel,
      nextPath,
      category,
      topic,
      source: file.relativePath,
    });
    const separator = nextPath.includes("?") ? "&" : "?";
    router.push(
      `${nextPath}${separator}category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&source=${encodeURIComponent(file.relativePath)}`
    );
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm text-[14px] text-on-surface-variant">
        <Link href="/learn" className="hover:text-on-surface transition-colors">Learning Centre</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Select Syllabus</span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
        <h1 className="font-[family-name:var(--font-lexend)] text-[28px] font-semibold leading-[1.25] tracking-tight text-on-surface">
          Select Syllabus for {toolLabel}
        </h1>
        <p className="text-[14px] text-on-surface-variant mt-xs">
          Choose one of your currently unlocked chapters and continue with your selected learning tool.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm space-y-sm">
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                void trackEvent("syllabus_category_filter_changed", { category, toolLabel });
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                activeCategory === category
                  ? "bg-secondary text-on-secondary border-secondary"
                  : "bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container-high"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <input
          className="w-full bg-surface-container text-on-surface text-[14px] rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
          placeholder="Search topic..."
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            void trackEvent("syllabus_search_updated", { query: value, toolLabel });
          }}
        />
      </div>

      {isLoading ? (
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <p className="text-[14px] text-on-surface-variant">Loading syllabus...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <p className="text-[14px] text-on-surface-variant">No unlocked topics found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {filteredCategories.map((category) => (
            <div key={category.category} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-sm">
                <h2 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">{category.category}</h2>
                <span className="text-[12px] text-on-surface-variant">{category.files.length} topics</span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {category.files.map((file) => (
                  <button
                    key={file.relativePath}
                    onClick={() => openToolWithSyllabus(category.category, file)}
                    className="w-full text-left rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 hover:border-secondary/40 hover:bg-surface-container-high transition-colors"
                  >
                    <p className="text-[14px] font-medium text-on-surface">{parseTopicLabel(file.name)}</p>
                    <p className="text-[12px] text-on-surface-variant">{parseChapterLabel(file.name)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
