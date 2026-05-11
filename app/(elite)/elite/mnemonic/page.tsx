"use client";

const recentCards = [
  {
    subject: "Biology",
    tag: "Taxonomy",
    mnemonic: "King Philip Came Over For Good Soup",
    items: ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"],
    accent: "bg-slate-900",
  },
  {
    subject: "Chemistry",
    tag: "Redox",
    mnemonic: "OIL RIG",
    items: ["Oxidation Is Loss (of electrons)", "Reduction Is Gain (of electrons)"],
    accent: "bg-slate-400",
  },
];

const libraryItems = [
  { title: "WBC Types", mnemonic: "Never Let Monkeys Eat Bananas", meta: "Biology • Saved 2d ago" },
  { title: "EM Spectrum", mnemonic: "Roman Men Invented Very Unusual X-Ray Guns", meta: "Physics • Saved 1w ago" },
  { title: "Essential Amino Acids", mnemonic: "PVT TIM HALL", meta: "Biology • Saved 2w ago" },
];

export default function EliteMnemonicPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Hero & Input Section */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-900 text-white p-2 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Mnemonic Generator</h2>
            </div>
            <p className="text-slate-600 text-base mb-8">
              Transform complex NEET classifications, pathways, and formulas into unforgettable memory aids. Enter a topic or paste a list below.
            </p>
            <div className="bg-slate-50 rounded-lg p-2 flex items-center border border-slate-200 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-all shadow-sm">
              <span className="material-symbols-outlined text-slate-400 ml-3">edit_note</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder:text-slate-400 px-4 py-3 outline-none"
                placeholder="e.g., Essential Amino Acids, Kreb's Cycle intermediates..."
                type="text"
              />
              <button className="bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Generate New
              </button>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Recent Generations */}
          <section className="xl:col-span-8 flex flex-col gap-4">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-lg font-semibold text-slate-900">Recent Generations</h3>
              <button className="text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-teal-600 transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filter
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentCards.map((card) => (
                <div key={card.mnemonic} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full">
                  <div className={`absolute top-0 left-0 w-1 h-full ${card.accent} rounded-l-xl`} />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full uppercase">{card.subject}</span>
                    <span className="text-xs font-bold text-slate-500 px-2 py-1 border border-slate-200 rounded-md">{card.tag}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{card.mnemonic}</h4>
                  <ul className="text-sm text-slate-600 space-y-1 mb-6 border-l-2 border-slate-200 pl-4 flex-1">
                    {card.items.map((item) => (
                      <li key={item}><strong>{item.charAt(0)}</strong>{item.slice(1)}</li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    {[
                      { icon: "bookmark", label: "Save" },
                      { icon: "edit", label: "Edit" },
                    ].map((a) => (
                      <button key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-500 hover:text-teal-600 text-sm">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button className="p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-500 hover:text-teal-600">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personal Library */}
          <aside className="xl:col-span-4 bg-white rounded-xl border border-slate-200 flex flex-col max-h-[600px] shadow-sm">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>local_library</span>
                <h3 className="text-lg font-semibold text-slate-900">Personal Library</h3>
              </div>
              <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">12 Saved</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
              {libraryItems.map((item) => (
                <div key={item.title} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">{item.title}</h5>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">more_vert</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{item.mnemonic}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.meta}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <button className="w-full py-2 border border-slate-300 text-slate-700 text-sm rounded-md hover:bg-slate-50 transition-colors font-medium">
                View Full Library
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
