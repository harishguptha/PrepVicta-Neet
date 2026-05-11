"use client";

import Image from "next/image";

export default function EliteTopBar() {
  return (
    <header className="sticky top-0 border-b border-slate-200 bg-white flex justify-between items-center w-full px-8 py-4 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-600 p-2 -ml-2">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="md:hidden flex items-center gap-2">
          <Image
            src="/prepvicta-logo.jpeg"
            alt="PrepVicta logo"
            width={30}
            height={30}
            className="h-[30px] w-[30px] rounded-lg object-cover ring-1 ring-slate-200"
            priority
          />
          <div className="text-lg font-bold text-slate-900">PrepVicta NEET</div>
        </div>
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 focus:ring-1 focus:ring-teal-600 focus:bg-white transition-colors outline-none"
              placeholder="Search topics, concepts..."
              type="text"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-full">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
