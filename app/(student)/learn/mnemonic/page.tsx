"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const recentMnemonics = [
  {
    title: "Taxonomy Order",
    content: "King Philip Came Over For Good Spaghetti",
    meaning: "Kingdom → Phylum → Class → Order → Family → Genus → Species",
    tag: "Biology",
  },
  {
    title: "OIL RIG",
    content: "Oxidation Is Loss, Reduction Is Gain",
    meaning: "Remember electron transfer in redox reactions",
    tag: "Chemistry",
  },
  {
    title: "Roy G. Biv",
    content: "Red, Orange, Yellow, Green, Blue, Indigo, Violet",
    meaning: "Visible spectrum order by wavelength",
    tag: "Physics",
  },
];

const savedMnemonics = [
  { title: "WBC Types", subject: "Biology" },
  { title: "EM Spectrum Order", subject: "Physics" },
  { title: "Amino Acid Groups", subject: "Biology" },
  { title: "Electrochemical Series", subject: "Chemistry" },
];

export default function MnemonicPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "General";
  const topic = searchParams.get("topic") ?? "Topic";

  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Link href="/learn" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">AI Study Aids</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] tracking-tight text-on-surface">Mnemonic Generator</h1>
          <p className="text-[14px] text-on-surface-variant mt-xs">Context: {category} • {topic}</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
        <label className="block text-[14px] font-semibold tracking-[0.05em] text-on-surface mb-sm">Enter a topic or list to memorize</label>
        <div className="relative">
          <input
            className="w-full bg-surface-container text-on-surface text-[16px] rounded-xl py-4 pl-4 pr-36 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50"
            placeholder={`Generate memory hooks for ${topic}...`}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary text-on-secondary text-[14px] font-semibold px-4 py-2.5 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Generate New
          </button>
        </div>
      </div>

      {/* Recent Generations */}
      <section className="flex flex-col gap-md">
        <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Recent Generations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {recentMnemonics.map((mnemonic) => (
            <div key={mnemonic.title} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">{mnemonic.title}</h3>
                <span className="bg-surface-container-high text-on-surface text-[12px] font-medium px-2 py-1 rounded">{mnemonic.tag}</span>
              </div>
              <div className="bg-secondary-container/20 rounded-lg p-sm mb-sm">
                <p className="text-[16px] font-medium text-secondary">{mnemonic.content}</p>
              </div>
              <p className="text-[14px] text-on-surface-variant mb-md">{mnemonic.meaning}</p>
              <div className="flex gap-sm">
                <button className="flex-1 text-[12px] font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant/30 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">bookmark</span> Save
                </button>
                <button className="flex-1 text-[12px] font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant/30 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                </button>
                <button className="flex-1 text-[12px] font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant/30 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">share</span> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Library */}
      <section className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Personal Library</h2>
          <span className="text-[14px] font-semibold text-secondary">12 Saved</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm divide-y divide-outline-variant/20">
          {savedMnemonics.map((item) => (
            <div key={item.title} className="flex items-center justify-between px-md py-sm hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
                <span className="text-[16px] text-on-surface">{item.title}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-[12px] text-on-surface-variant">{item.subject}</span>
                <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
