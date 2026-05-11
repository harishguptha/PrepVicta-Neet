"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const branches = [
  { label: "Digestive System", icon: "restaurant", x: "left-[5%] top-[30%]" },
  { label: "Respiratory System", icon: "air", x: "right-[5%] top-[30%]" },
  { label: "Circulatory System", icon: "favorite", x: "left-[10%] bottom-[15%]" },
  { label: "Nervous System", icon: "psychology", x: "right-[10%] bottom-[15%]" },
];

const tutorSuggestions = [
  "What are the high-yield topics in Human Physiology for NEET?",
  "Explain the connection between nervous and endocrine systems",
  "Create a mnemonic for cranial nerves",
];

export default function MindmapPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "Biology";
  const topic = searchParams.get("topic") ?? "Human Physiology";

  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Link href="/learn" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">AI Study Aids</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] tracking-tight text-on-surface">AI Mindmap Generator</h1>
          <p className="text-[14px] text-on-surface-variant mt-xs">Context: {category} • {topic}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Mindmap Area */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden relative" style={{ minHeight: 500 }}>
            {/* Toolbar */}
            <div className="absolute top-md right-md z-10 flex gap-xs">
              <button className="w-10 h-10 bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-sm flex items-center justify-center hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button className="w-10 h-10 bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-sm flex items-center justify-center hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
            </div>

            {/* Mindmap Visualization */}
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* Center node */}
              <div className="absolute z-10 bg-primary-container text-white px-6 py-4 rounded-2xl shadow-lg">
                <span className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold">{topic}</span>
              </div>

              {/* Connection lines (decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500">
                <line x1="400" y1="250" x2="150" y2="150" stroke="#c6c6cd" strokeWidth="2" />
                <line x1="400" y1="250" x2="650" y2="150" stroke="#c6c6cd" strokeWidth="2" />
                <line x1="400" y1="250" x2="180" y2="380" stroke="#c6c6cd" strokeWidth="2" />
                <line x1="400" y1="250" x2="620" y2="380" stroke="#c6c6cd" strokeWidth="2" />
              </svg>

              {/* Branch nodes */}
              {branches.map((branch) => (
                <div key={branch.label} className={`absolute ${branch.x} z-10`}>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 shadow-sm flex items-center gap-sm hover:shadow-md transition-shadow cursor-pointer">
                    <span className="material-symbols-outlined text-secondary text-[20px]">{branch.icon}</span>
                    <span className="text-[14px] font-medium text-on-surface">{branch.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-sm">
            <button className="flex items-center gap-xs bg-secondary text-on-secondary text-[14px] font-semibold px-4 py-2.5 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Regenerate
            </button>
            <button className="flex items-center gap-xs bg-surface-container-lowest text-on-surface text-[14px] font-semibold px-4 py-2.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
            </button>
            <button className="flex items-center gap-xs bg-surface-container-lowest text-on-surface text-[14px] font-semibold px-4 py-2.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">note_add</span> Add to My Notes
            </button>
          </div>
        </div>

        {/* Tutor Sidebar */}
        <div className="flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm sticky top-md">
            <div className="p-md border-b border-outline-variant/20 flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">Experienced Tutor</h3>
            </div>

            <div className="p-md space-y-md">
              <div className="bg-surface-container-low rounded-lg p-sm">
                <p className="text-[12px] font-medium text-secondary uppercase tracking-wider mb-xs">Strategy</p>
                <p className="text-[14px] text-on-surface">Focus on interconnections between systems — NEET loves questions that bridge topics.</p>
              </div>

              <div>
                <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-sm">High-Yield Topics</p>
                <div className="flex flex-wrap gap-xs">
                  {["Neural Control", "Excretion", "Breathing", "Digestion", "Circulation"].map((t) => (
                    <span key={t} className="bg-surface-container-high text-on-surface text-[12px] font-medium px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-sm">Suggested Prompts</p>
                <div className="space-y-xs">
                  {tutorSuggestions.map((s) => (
                    <button key={s} className="w-full text-left text-[14px] text-on-surface-variant hover:text-on-surface p-sm rounded-lg hover:bg-surface-container-low transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-md border-t border-outline-variant/20">
              <div className="relative">
                <input
                  className="w-full bg-surface-container text-on-surface text-[14px] rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50"
                  placeholder={`Ask the tutor about ${topic}...`}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-on-secondary-fixed-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
