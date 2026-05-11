"use client";

import { useState } from "react";

const kpis = [
  { label: "DAU / MAU Ratio", value: "42.8%", icon: "group", change: "+3.2%", positive: true },
  { label: "Planner Adoption", value: "76%", icon: "event_available", change: "+5.1%", positive: true },
  { label: "Avg. Mock Score", value: "482/720", icon: "quiz", change: "+18pts", positive: true },
  { label: "Monthly Recurring Revenue", value: "₹4.2M", icon: "payments", change: "+12%", positive: true },
];

const students = [
  { id: 1, name: "Akash Gunasekar", email: "akash@prepvicta.com", plan: "Elite Premium", status: "Active", joined: "Jun 2025", lastActive: "10m ago" },
  { id: 2, name: "Raja Shanmugam", email: "raja@prepvicta.com", plan: "Pro Annual", status: "Active", joined: "Jan 2025", lastActive: "1h ago" },
  { id: 3, name: "Pavan Vignesh", email: "pavan@prepvicta.com", plan: "Basic Monthly", status: "Active", joined: "Apr 2025", lastActive: "3h ago" },
];

const statusColors: Record<string, string> = {
  Active: "bg-secondary-container text-on-secondary-container",
  Expired: "bg-error-container text-on-error-container",
  Trial: "bg-tertiary-fixed text-on-tertiary-fixed",
};

export default function AdminDashboardPage() {
  const [page] = useState(1);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-on-surface-variant mb-[6px]">PrepVicta Platform</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[30px] font-bold leading-[1.2] tracking-tight text-on-surface">Admin Dashboard</h1>
          <p className="text-[14px] text-on-surface-variant mt-[6px]">Platform overview and user management.</p>
        </div>
        <div className="hidden md:flex items-center gap-sm">
          <button className="flex items-center gap-xs bg-surface-container-low text-on-surface text-[13px] font-semibold px-4 py-2.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">download</span>
            Export
          </button>
          <button className="flex items-center gap-xs bg-secondary text-on-secondary text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-on-secondary-fixed transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Student
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-lowest rounded-[14px] p-[20px] border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-[14px]">
              <div className="w-9 h-9 rounded-[10px] bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{kpi.icon}</span>
              </div>
              <span className={`text-[12px] font-semibold ${kpi.positive ? "text-secondary" : "text-error"} flex items-center gap-[3px] bg-${kpi.positive ? "secondary" : "error"}-container/60 px-[8px] py-[3px] rounded-full`}>
                <span className="material-symbols-outlined text-[13px]">{kpi.positive ? "trending_up" : "trending_down"}</span>
                {kpi.change}
              </span>
            </div>
            <div className="font-[family-name:var(--font-lexend)] text-[28px] font-bold leading-[1.2] tracking-tight text-on-surface">{kpi.value}</div>
            <p className="text-[13px] text-on-surface-variant mt-[5px] font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Student Management Table */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-md flex items-center justify-between border-b border-outline-variant/20">
          <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Student Management</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="bg-surface-container text-on-surface text-[14px] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50 w-64"
              placeholder="Search students..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Student</th>
                <th className="text-left text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Plan</th>
                <th className="text-left text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Status</th>
                <th className="text-left text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Joined</th>
                <th className="text-left text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Last Active</th>
                <th className="text-right text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-md py-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-sm">
                    <div>
                      <div className="text-[14px] font-medium text-on-surface">{student.name}</div>
                      <div className="text-[12px] text-on-surface-variant">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-md py-sm text-[14px] text-on-surface">{student.plan}</td>
                  <td className="px-md py-sm">
                    <span className={`inline-block text-[12px] font-semibold px-2.5 py-1 rounded-full ${statusColors[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-md py-sm text-[14px] text-on-surface-variant">{student.joined}</td>
                  <td className="px-md py-sm text-[14px] text-on-surface-variant">{student.lastActive}</td>
                  <td className="px-md py-sm text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="Block">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">block</span>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="Extend">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">event_repeat</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-[14px] text-on-surface-variant">Showing {page} to 3 of 3 students</p>
          <div className="flex items-center gap-xs">
            <button className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[14px] text-on-surface-variant hover:bg-surface-container-low transition-colors" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary-container text-white text-[14px] font-semibold">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[14px] text-on-surface-variant hover:bg-surface-container-low transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[14px] text-on-surface-variant hover:bg-surface-container-low transition-colors">3</button>
            <button className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[14px] text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
