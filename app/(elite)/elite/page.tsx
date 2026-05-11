"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const tools = [
  {
    label: "Feynman Simplifier",
    desc: "Break complex concepts into simple analogies",
    icon: "psychology",
    href: "/elite/feynman",
    color: "bg-teal-50 text-teal-700",
  },
  {
    label: "Audio Vault",
    desc: "Expert lectures with live transcripts",
    icon: "headset",
    href: "/elite/audio",
    color: "bg-blue-50 text-blue-700",
  },
  {
    label: "Mnemonic Generator",
    desc: "Turn lists and pathways into unforgettable aids",
    icon: "lightbulb",
    href: "/elite/mnemonic",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "AI Mindmap",
    desc: "Visualize chapter relationships interactively",
    icon: "account_tree",
    href: "/elite/mindmap",
    color: "bg-purple-50 text-purple-700",
  },
];

const stats = [
  { label: "Concepts Simplified", value: "48", icon: "psychology" },
  { label: "Audio Hours", value: "12.5", icon: "headset" },
  { label: "Mnemonics Saved", value: "23", icon: "lightbulb" },
  { label: "Mindmaps Created", value: "9", icon: "account_tree" },
];

export default function EliteDashboardPage() {
  const { user } = useAuth();
  const [materialCategories, setMaterialCategories] = useState<Array<{
    category: string;
    files: Array<{ name: string; relativePath: string; sizeBytes: number }>;
  }>>([]);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const res = await fetch("/api/materials");
        if (!res.ok) return;
        const data = await res.json();
        setMaterialCategories(data.categories ?? []);
      } catch {
        // ignore loading failure; dashboard still renders.
      }
    };
    void loadMaterials();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full">
              Elite Premium
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name ?? "Student"}
          </h1>
          <p className="text-slate-600 mt-2 text-base max-w-2xl">
            Your personalized AI study toolkit is ready. Pick up where you left off or explore a new concept.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600 text-[22px]">{s.icon}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* AI Study Tools */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">AI Study Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tool.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">{tool.label}</h3>
                    <p className="text-sm text-slate-600">{tool.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* NEET 2026 Materials */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">NEET 2026 Materials</h2>
            <span className="text-xs text-slate-500">{materialCategories.reduce((sum, c) => sum + c.files.length, 0)} files</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {materialCategories.map((category) => (
              <div key={category.category} className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">{category.category}</h3>
                {category.files.length === 0 ? (
                  <p className="text-xs text-slate-500">No documents yet.</p>
                ) : (
                  <div className="space-y-2">
                    {category.files.slice(0, 4).map((file) => (
                      <a
                        key={file.relativePath}
                        href={`/api/materials/download?path=${encodeURIComponent(file.relativePath)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-teal-700 hover:text-teal-900 hover:underline block truncate"
                      >
                        {file.name}
                      </a>
                    ))}
                    {category.files.length > 4 && (
                      <p className="text-xs text-slate-500">+{category.files.length - 4} more</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-xs text-teal-600 font-semibold hover:text-teal-800 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-slate-200">
            {[
              { tool: "Feynman Simplifier", topic: "Action Potential in Neurons", time: "2 hrs ago", icon: "psychology" },
              { tool: "Audio Vault", topic: "Human Physiology: Neural Control", time: "5 hrs ago", icon: "headset" },
              { tool: "Mnemonic Generator", topic: "Essential Amino Acids (PVT TIM HALL)", time: "Yesterday", icon: "lightbulb" },
              { tool: "AI Mindmap", topic: "Human Physiology - Full Chapter", time: "Yesterday", icon: "account_tree" },
            ].map((a, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600 text-[20px]">{a.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.topic}</p>
                  <p className="text-xs text-slate-500">{a.tool}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="text-[11px] font-bold tracking-wider uppercase">AI Insight</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Based on your recent activity, you&apos;re excelling in Biology but your Physics accuracy on neural & electrical topics needs attention. Consider using the Feynman Simplifier for Electromagnetic Induction next.
            </p>
            <button className="mt-3 text-xs font-semibold text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors">
              Start Now
            </button>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-[0.05]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
      </div>
    </div>
  );
}
