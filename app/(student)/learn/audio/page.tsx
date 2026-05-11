"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function parseChapterLabel(sourcePath: string) {
  const fileName = sourcePath.split("/").pop() ?? "";
  const match = fileName.match(/^(Ch\d+)/i);
  return match ? match[1].toUpperCase() : "Topic";
}

const transcriptLines = [
  { time: "14:30", text: "The neural control and coordination in humans involves the central nervous system..." },
  { time: "15:00", text: "The brain, being the central processing unit, receives sensory inputs from various receptors..." },
  { time: "15:22", text: "The cerebrum is responsible for higher mental functions like memory, reasoning, and learning..." },
  { time: "15:42", text: "Reflex actions are involuntary responses that bypass the brain, traveling through the spinal cord...", active: true },
  { time: "16:05", text: "The autonomic nervous system regulates involuntary functions such as heart rate and digestion..." },
];

export default function AudioLearningPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "Biology";
  const topic = searchParams.get("topic") ?? "Neural Control";
  const source = searchParams.get("source") ?? "";
  const chapterLabel = parseChapterLabel(source);

  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Link href="/learn" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Audio Vault</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">{topic}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Player + Transcript */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          {/* Player Card */}
          <div className="bg-primary-container rounded-xl p-md text-white">
            <div className="flex items-center justify-between mb-md">
              <div>
                <h2 className="font-[family-name:var(--font-lexend)] text-[20px] font-semibold">{topic}</h2>
                <p className="text-[14px] text-on-primary-container mt-xs">{chapterLabel} • {category}</p>
              </div>
              <div className="flex items-center gap-xs bg-white/10 rounded-full px-sm py-xs">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span className="text-[12px] font-medium">1.5x</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-sm">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full w-[35%]" />
              </div>
              <div className="flex justify-between mt-xs text-[12px] text-on-primary-container">
                <span>15:42</span>
                <span>45:00</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-lg">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">skip_previous</span>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">replay_10</span>
              </button>
              <button className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-on-secondary-fixed-variant transition-colors">
                <span className="material-symbols-outlined text-on-secondary text-[32px]">pause</span>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">forward_10</span>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">skip_next</span>
              </button>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant/20 flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">subtitles</span>
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">Live Transcript</h3>
            </div>
            <div className="p-md space-y-sm max-h-[300px] overflow-y-auto">
              {transcriptLines.map((line) => (
                <div
                  key={line.time}
                  className={`flex gap-sm p-sm rounded-lg transition-colors ${line.active ? "bg-secondary-container/20 border-l-2 border-secondary" : "hover:bg-surface-container-low"}`}
                >
                  <span className={`text-[12px] font-medium shrink-0 mt-0.5 ${line.active ? "text-secondary" : "text-on-surface-variant"}`}>
                    {line.time}
                  </span>
                  <p className={`text-[14px] ${line.active ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
            <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-md">Related Materials</h3>
            <div className="space-y-sm">
              {[
                { icon: "menu_book", label: `E-Book: ${topic}`, link: `/learn/deep-learning?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&source=${encodeURIComponent(source)}` },
                { icon: "style", label: "Flashcards: Nervous System", link: "#" },
                { icon: "quiz", label: `Quick Quiz: ${chapterLabel}`, link: `/tests?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&source=${encodeURIComponent(source)}` },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.link}
                  className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">{item.icon}</span>
                  <span className="text-[14px] text-on-surface">{item.label}</span>
                  <span className="material-symbols-outlined text-outline text-[16px] ml-auto">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-secondary-container/20 rounded-xl p-md border border-secondary/20">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h3 className="font-[family-name:var(--font-lexend)] text-[16px] font-semibold text-on-surface">AI Insight</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant">
              Based on your learning pattern, you retain 40% more when combining audio with the e-book. Try the dual-mode study!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
