"use client";

import { useState } from "react";

interface PrepAIDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function PrepAIDrawer({ open, onClose }: PrepAIDrawerProps) {
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-container-lowest border-l border-outline-variant shadow-2xl z-50 flex flex-col">
        <div className="p-md border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-[20px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface">PrepAI Tutor</h3>
              <p className="text-[12px] text-on-surface-variant">Context: Human Physiology</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-md">
          <div className="flex gap-sm">
            <div className="w-8 h-8 rounded-full bg-secondary shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-[16px]">smart_toy</span>
            </div>
            <div className="bg-surface-container rounded-xl rounded-tl-none p-sm max-w-[85%]">
              <p className="text-[14px] text-on-surface">
                Welcome! I&apos;m your AI study companion. I can help you understand concepts, create mnemonics, solve doubts, and plan your revision. What would you like to work on?
              </p>
            </div>
          </div>
          <div className="flex gap-sm justify-end">
            <div className="bg-primary-container rounded-xl rounded-tr-none p-sm max-w-[85%]">
              <p className="text-[14px] text-white">
                Explain the difference between spermatogenesis and oogenesis.
              </p>
            </div>
          </div>
          <div className="flex gap-sm">
            <div className="w-8 h-8 rounded-full bg-secondary shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-[16px]">smart_toy</span>
            </div>
            <div className="bg-surface-container rounded-xl rounded-tl-none p-sm max-w-[85%]">
              <p className="text-[14px] text-on-surface">
                Great question! Here&apos;s a concise comparison:
              </p>
              <p className="text-[14px] text-on-surface mt-2">
                <strong>Spermatogenesis</strong> produces 4 functional sperm from each primary spermatocyte, occurs continuously after puberty, and involves equal cytoplasmic division.
              </p>
              <p className="text-[14px] text-on-surface mt-2">
                <strong>Oogenesis</strong> produces 1 functional ovum + 3 polar bodies, begins during fetal life (arrested at prophase I), and involves unequal division to preserve cytoplasm.
              </p>
            </div>
          </div>
        </div>

        <div className="p-md border-t border-outline-variant/30">
          <div className="flex flex-wrap gap-2 mb-sm">
            <button className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              Solve a doubt
            </button>
            <button className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              Motivate me
            </button>
            <button className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              Strategy tips
            </button>
          </div>
          <div className="relative">
            <input
              className="w-full bg-surface-container text-on-surface text-[16px] rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50"
              placeholder="Ask anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-secondary text-on-secondary flex items-center justify-center hover:bg-on-secondary-fixed-variant transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
