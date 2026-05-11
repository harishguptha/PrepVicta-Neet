"use client";

export default function EliteFeynmanPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1 block">AI Study Aids</span>
          <h2 className="text-3xl font-bold text-slate-900">Feynman Simplifier</h2>
          <p className="text-slate-600 mt-2 max-w-2xl text-base">
            Enter a complex NEET concept, and your AI tutor will break it down using simple analogies, ensuring you truly understand the core principles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <label className="block text-lg font-semibold text-slate-900 mb-3" htmlFor="concept-input">
                Concept to Simplify
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 resize-none transition-colors mb-4 placeholder:text-slate-400 outline-none"
                id="concept-input"
                placeholder="e.g., Action Potential in Neurons, Le Chatelier's Principle..."
                rows={4}
              />
              <button className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Simplify Concept
              </button>
            </div>
            {/* Example Topics */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-teal-600">lightbulb</span>
                Need inspiration?
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Krebs Cycle", "Bohr Model", "Thermodynamics"].map((t) => (
                  <button key={t} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[500px]">
              {/* AI Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-teal-700 text-[18px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Action Potential</h3>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Simplified Explanation</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-md hover:bg-slate-200" title="Save">
                    <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-md hover:bg-slate-200" title="Copy">
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Explanation Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">The Core Idea</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed">
                    An action potential is essentially the way nerve cells (neurons) communicate. It&apos;s a brief electrical signal that travels down the neuron, carrying information to other cells.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 text-[20px]">compare_arrows</span>
                    <h4 className="text-lg font-semibold text-slate-900">The Analogy: The Stadium Wave</h4>
                  </div>
                  <div className="bg-teal-50 border border-teal-100 p-5 rounded-lg space-y-4">
                    <p className="text-sm text-slate-800 leading-relaxed">
                      Think of a neuron like a long row of fans in a sports stadium. When the game is quiet, everyone is sitting down. This is the <strong className="text-teal-700">Resting Potential</strong>.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
                      <li><strong className="text-slate-900">Depolarization (Standing up):</strong> Suddenly, someone starts a wave. A few people stand up, prompting the people next to them to stand up. In the cell, this is sodium (Na+) channels opening, letting positive charge rush in.</li>
                      <li><strong className="text-slate-900">Repolarization (Sitting down):</strong> As soon as people stand up, they immediately sit back down so the wave can continue past them. In the cell, potassium (K+) channels open, letting positive charge rush out, resetting the balance.</li>
                      <li><strong className="text-slate-900">Refractory Period (Taking a breath):</strong> After sitting down, a person needs a second to catch their breath before they can do the wave again. The neuron also needs a brief moment to reset its ions before firing another signal.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border-l-4 border-teal-600">
                  <span className="material-symbols-outlined text-teal-600 mt-0.5">key</span>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">Key NEET Takeaway</h5>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Remember the sequence: Resting (-70mV) → Depolarization (Na+ in) → Repolarization (K+ out) → Hyperpolarization → Resting. It&apos;s an all-or-nothing event.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button className="bg-white border border-slate-300 text-slate-700 text-sm font-medium py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                  Test My Understanding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
