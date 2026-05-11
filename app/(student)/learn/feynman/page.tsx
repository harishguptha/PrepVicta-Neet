"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const exampleChips = ["Action Potential", "Krebs Cycle", "Electromagnetic Induction", "Osmosis"];

export default function FeynmanPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "General";
  const topic = searchParams.get("topic") ?? "Concept";
  const [concept, setConcept] = useState("");
  const [simplified, setSimplified] = useState(true);

  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Link href="/learn" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">AI Study Aids</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] tracking-tight text-on-surface">Feynman Simplifier</h1>
          <p className="text-[14px] text-on-surface-variant mt-xs">Context: {category} • {topic}</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
        <label className="block text-[14px] font-semibold tracking-[0.05em] text-on-surface mb-sm">Enter a concept to simplify</label>
        <textarea
          className="w-full bg-surface-container text-on-surface text-[16px] rounded-xl py-4 px-4 h-24 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50 resize-none"
          placeholder={`Describe what you want simplified from ${topic}...`}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-sm mb-md">
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => { setConcept(chip); setSimplified(true); }}
              className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSimplified(true)}
          className="bg-secondary text-on-secondary text-[14px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Simplify
        </button>
      </div>

      {/* Output */}
      {simplified && (
        <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg border border-outline-variant/30 shadow-sm space-y-lg">
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-secondary">lightbulb</span>
              <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Core Idea</h2>
            </div>
            <p className="text-[16px] leading-[1.5] text-on-surface">
              An action potential is an electrical signal that travels along a nerve cell. Think of it like a &quot;wave&quot; of electricity that your body uses to send messages from your brain to your muscles (and back).
            </p>
          </div>

          <div>
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-tertiary-fixed-dim">interests</span>
              <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Analogy: The Stadium Wave</h2>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant/20">
              <p className="text-[16px] leading-[1.5] text-on-surface">
                Imagine a stadium wave: each person stands up briefly and sits back down, and the &quot;wave&quot; appears to travel around the stadium. No single person moves far, but the signal (the wave) travels the entire distance. Similarly, ions flow briefly in and out of each section of the nerve cell, creating a wave-like signal that travels the length of the nerve.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-error">priority_high</span>
              <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Key NEET Takeaway</h2>
            </div>
            <div className="bg-error-container/20 rounded-xl p-md border border-error/20">
              <ul className="space-y-sm text-[14px] text-on-surface">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-error text-[16px] mt-0.5">check_circle</span>
                  Resting potential is -70mV (inside negative)
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-error text-[16px] mt-0.5">check_circle</span>
                  Depolarization: Na+ channels open, membrane becomes positive
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-error text-[16px] mt-0.5">check_circle</span>
                  All-or-none principle: the signal is full strength or nothing
                </li>
              </ul>
            </div>
          </div>

          <button className="bg-primary text-on-primary text-[14px] font-semibold tracking-[0.05em] px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            Test My Understanding
          </button>
        </div>
      )}
    </>
  );
}
