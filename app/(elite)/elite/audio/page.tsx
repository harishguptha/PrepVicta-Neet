"use client";

export default function EliteAudioPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Audio Player & Transcript */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Audio Player Card */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[48px] text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>headphones</span>
            </div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-slate-900 text-xs font-bold mb-4">
                <span className="material-symbols-outlined text-[14px]">science</span>
                Biology Module
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Human Physiology: Neural Control</h2>
              <p className="text-base text-slate-600">Dr. Alok Sharma &bull; Chapter 4 &bull; 45 Mins</p>
            </div>
            {/* Progress */}
            <div className="w-full max-w-2xl mb-8">
              <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2 cursor-pointer">
                <div className="absolute left-0 top-0 h-full bg-slate-900 rounded-full" style={{ width: "35%" }} />
                <div className="absolute left-[20%] top-0 h-full w-0.5 bg-white opacity-70" />
                <div className="absolute left-[50%] top-0 h-full w-0.5 bg-white opacity-70" />
                <div className="absolute left-[80%] top-0 h-full w-0.5 bg-white opacity-70" />
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>15:42</span>
                <span>45:00</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-8 w-full">
              {["skip_previous", "replay_10"].map((icon) => (
                <button key={icon} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </button>
              ))}
              <button className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-sm hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
              </button>
              {["forward_10", "skip_next"].map((icon) => (
                <button key={icon} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </button>
              ))}
            </div>
            {/* Secondary controls */}
            <div className="w-full max-w-2xl flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">speed</span>
                  1.25x
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">segment</span>
                  Chapters
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark_add</span>
                Bookmark Moment
              </button>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-slate-900">Live Transcript</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-md hover:bg-slate-50 text-slate-600 font-bold text-sm">A-</button>
                <button className="p-2 rounded-md hover:bg-slate-50 text-slate-600 font-bold text-sm">A+</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-lg text-slate-600 leading-relaxed">
              <p className="hover:text-slate-900 cursor-pointer transition-colors">
                <span className="text-slate-900 font-semibold mr-2 text-sm">14:20</span>
                Moving on to the generation and conduction of nerve impulses. Neurons are excitable cells because their membranes are in a polarized state.
              </p>
              <p className="hover:text-slate-900 cursor-pointer transition-colors">
                <span className="text-slate-900 font-semibold mr-2 text-sm">15:05</span>
                Do you know why the membrane of a neuron is polarized? Different types of ion channels are present on the neural membrane. These ion channels are selectively permeable to different ions.
              </p>
              <div className="relative -mx-6 px-6 py-4 bg-blue-50 border-l-4 border-slate-900">
                <p className="text-slate-900 font-semibold">
                  <span className="text-slate-900 font-bold mr-2 text-sm">15:42</span>
                  When a neuron is not conducting any impulse, i.e., resting, the axonal membrane is comparatively more permeable to potassium ions (K+) and nearly impermeable to sodium ions (Na+).
                </p>
              </div>
              <p className="hover:text-slate-900 cursor-pointer transition-colors opacity-70">
                <span className="text-slate-900 font-semibold mr-2 text-sm">16:10</span>
                Similarly, the membrane is impermeable to negatively charged proteins present in the axoplasm. Consequently, the axoplasm inside the axon contains high concentration of K+ and negatively charged proteins.
              </p>
              <p className="hover:text-slate-900 cursor-pointer transition-colors opacity-50">
                <span className="text-slate-900 font-semibold mr-2 text-sm">16:45</span>
                In contrast, the fluid outside the axon contains a low concentration of K+, a high concentration of Na+ and thus form a concentration gradient.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Materials */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-slate-900 px-1">Related Study Materials</h3>
          {[
            { priority: "MUST REVIEW", pcolor: "bg-red-100 text-red-800", icon: "menu_book", title: "NCERT Chapter 21", desc: "Read sections 21.3 on Nerve Impulses to reinforce audio concepts.", cta: "Open E-Book" },
            { priority: "SHOULD DO", pcolor: "bg-slate-200 text-slate-700", icon: "style", title: "Neural Control Deck", desc: "35 AI-generated flashcards based on this lecture's key terms.", cta: "Practice Now" },
            { priority: "COULD DO", pcolor: "bg-slate-200 text-slate-700", icon: "quiz", title: "Quick Knowledge Check", desc: "10 MCQ questions on Resting Membrane Potential.", cta: "Start Quiz" },
          ].map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className={`absolute top-4 right-4 ${card.pcolor} font-bold text-[10px] px-2 py-1 rounded`}>{card.priority}</div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-900 group-hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-1">{card.title}</h4>
              <p className="text-sm text-slate-600 mb-4">{card.desc}</p>
              <div className="flex items-center justify-between text-slate-900 text-sm font-semibold">
                {card.cta}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
          {/* AI Insight */}
          <div className="mt-4 p-5 rounded-xl bg-slate-900 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[18px] text-white">auto_awesome</span>
                <span className="font-bold text-[11px] text-white tracking-wider">AI INSIGHT</span>
              </div>
              <p className="text-sm mb-3 text-slate-200">Students who review the visual diagrams alongside this audio module score 15% higher on related MCQs.</p>
              <button className="text-xs font-semibold underline underline-offset-2 hover:text-white transition-colors">View Diagrams</button>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-10" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
