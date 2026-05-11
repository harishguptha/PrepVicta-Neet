"use client";

const branches = [
  { label: "Digestive System", desc: "Enzymes, absorption mechanisms, disorders.", badge: "Must Do", badgeColor: "bg-teal-50 text-teal-700", position: "top-[20%] left-[10%]" },
  { label: "Respiratory System", desc: "Exchange of gases, transport, regulation.", badge: "Should Do", badgeColor: "bg-amber-50 text-amber-700", position: "top-[20%] right-[10%]" },
  { label: "Circulatory System", desc: "ECG, cardiac cycle, double circulation.", badge: "Must Do", badgeColor: "bg-teal-50 text-teal-700", position: "bottom-[20%] left-[10%]" },
  { label: "Nervous System", desc: "Neural impulses, CNS vs PNS, reflex action.", badge: "Must Do", badgeColor: "bg-teal-50 text-teal-700", position: "bottom-[20%] right-[10%]" },
];

const linkages = [
  { title: "ECG & Cardiac Cycle", desc: "Frequently paired in assertion-reason questions. Understand the electrical to mechanical mapping." },
  { title: "Hormonal Regulation", desc: "Connect digestive juices with their specific regulating hormones (Secretin, CCK)." },
  { title: "Counter Current Mechanism", desc: "Crucial for Excretory system. Ensure you can trace the osmolarity gradient visually." },
];

export default function EliteMindmapPage() {
  return (
    <main className="flex-1 flex overflow-hidden p-8 gap-8">
      {/* Mindmap Canvas */}
      <section className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">account_tree</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Human Physiology</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Regenerate
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              Add to My Notes
            </button>
          </div>
        </div>
        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-slate-50/50 flex items-center justify-center p-12">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 800, minHeight: 600 }}>
            <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#cbd5e1" strokeWidth={2} />
            <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#cbd5e1" strokeWidth={2} />
            <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#cbd5e1" strokeWidth={2} />
            <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#cbd5e1" strokeWidth={2} />
          </svg>
          <div className="relative w-full max-w-4xl h-[600px]">
            {/* Central Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 text-white px-8 py-5 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold text-center mb-1">Human Physiology</h3>
              <p className="text-[10px] text-center text-slate-300 uppercase tracking-widest font-bold">Weightage: 20%</p>
            </div>
            {/* Branch Nodes */}
            {branches.map((b) => (
              <div key={b.label} className={`absolute ${b.position} z-10 w-[220px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-900 transition-colors cursor-pointer group`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{b.label}</h4>
                  <span className={`${b.badgeColor} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>{b.badge}</span>
                </div>
                <p className="text-[13px] text-slate-600 leading-tight">{b.desc}</p>
              </div>
            ))}
          </div>
          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 transition-colors text-slate-600">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="h-px bg-slate-200 w-full" />
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 transition-colors text-slate-600">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tutor Sidebar */}
      <aside className="w-[360px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">psychology</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Experienced Tutor</h3>
            <p className="text-slate-500 uppercase text-[10px] tracking-wider font-bold">AI Strategic Context</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* NEET Strategy */}
          <div className="relative bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-2">
            <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-1 border border-blue-100 rounded-full">
              <span className="material-symbols-outlined text-blue-600 text-[14px]">target</span>
              <span className="text-[10px] text-blue-600 uppercase font-bold">NEET Strategy</span>
            </div>
            <p className="text-sm text-slate-800 mt-2">
              Human Physiology consistently accounts for <strong>12-15 questions</strong> in the NEET Biology section. Focus heavily on understanding mechanisms rather than just rote memorization.
            </p>
          </div>
          {/* High-Yield Linkages */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">key</span>
              High-Yield Linkages
            </h4>
            <ul className="space-y-3">
              {linkages.map((l) => (
                <li key={l.title} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-900 font-semibold">{l.title}</p>
                    <p className="text-[13px] text-slate-600 mt-0.5">{l.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-px bg-slate-200 w-full" />
          {/* Suggested Prompts */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Ask a specific question</h4>
            <div className="flex flex-col gap-3">
              {[
                "Explain the sliding filament theory simply.",
                "What is the exact sequence of a reflex arc?",
              ].map((q) => (
                <button key={q} className="text-left w-full p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-900 hover:bg-slate-50 transition-all text-[13px] text-slate-600">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Chat Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="relative">
            <input
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg text-sm outline-none transition-all placeholder:text-slate-400"
              placeholder="Type your query..."
              type="text"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}
