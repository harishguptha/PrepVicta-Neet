"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlannerPlan, PlannerPriority, PlannerTask } from "@/lib/planner";
import { useAuth } from "@/lib/auth";

const priorityMeta: Record<PlannerPriority, { label: string; meta: string; dot: string; className: string }> = {
  must: { label: "Must Do", meta: "Critical - do first", dot: "var(--blue)", className: "must" },
  should: { label: "Should Do", meta: "Important", dot: "var(--green)", className: "should" },
  could: { label: "Could Do", meta: "Bonus", dot: "var(--jade)", className: "could" },
};

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LoadingPlanner() {
  return (
    <div className="pv-card" style={{ padding: 24 }}>
      <div className="pv-label" style={{ marginBottom: 8 }}>Generating plan</div>
      <div className="pv-h2" style={{ marginBottom: 8 }}>Building the highest-impact schedule for today...</div>
      <div className="pv-prog pv-prog-thick"><div className="pv-prog-fill" style={{ width: "55%" }}></div></div>
    </div>
  );
}

function TaskCard({ task }: { task: PlannerTask }) {
  const meta = priorityMeta[task.priority];

  return (
    <div className={`pv-task-card ${meta.className}${task.done ? " done" : ""}`}>
      <div className="pv-tc-top">
        <div className="pv-tc-subj" style={task.done ? { textDecoration: "line-through" } : undefined}>{task.subject}</div>
        {task.done ? (
          <span style={{ fontSize: 8, fontWeight: 700, color: "var(--jade)", background: "var(--jade-bg)", borderRadius: 4, padding: "2px 6px" }}>Done</span>
        ) : (
          <div className="pv-tc-dur"><ClockIcon />{task.duration}</div>
        )}
      </div>
      <div className="pv-tc-title" style={task.done ? { textDecoration: "line-through", color: "var(--text-3)" } : undefined}>{task.title}</div>
      <div className="pv-tc-why" style={task.done ? { textDecoration: "line-through" } : undefined}>{task.why}</div>
      <div className="pv-tc-skip">{task.skipCost}</div>
      <div className="pv-tc-value">{task.value}</div>
      <button className={`pv-tc-btn ${task.priority === "must" ? "pv-tc-btn-primary" : "pv-tc-btn-soft"}`} disabled={task.done}>
        {task.done ? "Completed" : task.actionLabel}
      </button>
    </div>
  );
}

export default function PlannerPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlannerPlan | null>(null);
  const [source, setSource] = useState<"llm" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noPlan, setNoPlan] = useState(false);
  const [request, setRequest] = useState("");
  const [controlsOpen, setControlsOpen] = useState(false);

  const groupedTasks = useMemo(() => {
    const groups: Record<PlannerPriority, PlannerTask[]> = { must: [], should: [], could: [] };
    plan?.tasks.forEach((task) => groups[task.priority].push(task));
    return groups;
  }, [plan]);

  const requestPlan = useCallback(async (customRequest = "") => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);

    const res = await fetch("/api/planner", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user ? { id: user.id, name: user.name, email: user.email } : undefined,
        request: customRequest,
      }),
    }).finally(() => {
      window.clearTimeout(timeout);
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.plan) {
      throw new Error(data?.error ?? "Planner took too long. Please retry.");
    }
    return data as { plan: PlannerPlan; source?: "llm" | "fallback"; error?: string };
  }, [user]);

  const applyPlannerResponse = useCallback((data: { plan: PlannerPlan; source?: "llm" | "fallback"; error?: string }) => {
    setPlan(data.plan);
    setSource(data.source ?? "llm");
    setError(data.error ?? "");
  }, []);

  const generatePlan = useCallback(async (customRequest = "") => {
    setLoading(true);
    setError("");

    try {
      applyPlannerResponse(await requestPlan(customRequest));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate planner.");
    }
    setLoading(false);
  }, [applyPlannerResponse, requestPlan]);

  // On mount: load today's saved plan from DB. Only regenerate when user explicitly adjusts.
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let active = true;
    const email = user.email;
    const params = new URLSearchParams();
    if (user.id) params.set("userId", user.id);
    params.set("email", email);

    fetch(`/api/planner?${params.toString()}`)
      .then(async (res) => {
        if (!active) return;
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.status === 404) {
          setNoPlan(true);
        } else if (res.ok && data?.plan) {
          applyPlannerResponse(data as { plan: PlannerPlan; source?: "llm" | "fallback"; error?: string });
        } else {
          setError(data?.error ?? "Unable to load planner.");
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load planner.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, applyPlannerResponse]);

  if (loading && !plan) {
    return (
      <>
        <div className="pv-screen-hdr">
          <div>
            <div className="pv-h1">Today&apos;s Plan</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>AI planner is preparing your best next actions.</div>
          </div>
        </div>
        <LoadingPlanner />
      </>
    );
  }

  if (!plan) {
    if (noPlan) {
      return (
        <div className="pv-card">
          <div className="pv-h2" style={{ marginBottom: 8 }}>No plan yet</div>
          <div className="pv-body" style={{ marginBottom: 14 }}>
            Your plan is generated when you finish onboarding. You can also generate one now.
          </div>
          <button
            className="pv-btn pv-btn-ink"
            disabled={loading}
            onClick={() => { setNoPlan(false); void generatePlan(); }}
          >
            {loading ? "Generating..." : "Generate Today's Plan"}
          </button>
        </div>
      );
    }
    return (
      <div className="pv-card">
        <div className="pv-h2" style={{ marginBottom: 8 }}>Planner unavailable</div>
        <div className="pv-body" style={{ marginBottom: 14 }}>{error || "Try again in a moment."}</div>
        <button className="pv-btn pv-btn-ink" onClick={() => generatePlan()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="pv-planner-page">
      <section className="pv-planner-hero">
        <div className="pv-planner-hero-copy">
          <div className="pv-wp-eyebrow">
            <div className="pv-wp-pulse"></div>
            {plan.winPathLabel}
          </div>
          <div className="pv-h1">Today&apos;s Plan</div>
          <div className="pv-planner-date">
            {plan.dateLine}
          </div>
          <div className="pv-wp-verdict">{plan.verdict}</div>
          <div className="pv-wp-consequence">
            Risk if skipped: <span>{plan.consequence}</span>
          </div>

          <div className="pv-wp-cta-row">
            <button className="pv-wp-cta"><CheckIcon />{plan.primaryAction}</button>
            <div className="pv-wp-time"><ClockIcon />{plan.totalTime}</div>
            <button className="pv-wp-secondary">{plan.shortSessionAction}</button>
          </div>
        </div>
        <div className="pv-screen-summary">
          <div className="pv-summary-tile pv-summary-progress">
            <div className="pv-mm-lbl">{plan.progressLabel}</div>
            <div className="pv-mm-num pv-summary-progress-value">{plan.progressPercent}%</div>
            <div className="pv-summary-sub">{plan.progressCount}</div>
            <div className="pv-prog"><div className="pv-prog-fill" style={{ width: `${plan.progressPercent}%` }}></div></div>
          </div>
          {plan.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className="pv-summary-tile pv-summary-metric">
              <div className="pv-mm-lbl">{metric.label}</div>
              <div className="pv-mm-num">{metric.value}</div>
              <div className="pv-mm-note">{metric.note}</div>
              <div className="pv-prog"><div className="pv-prog-fill" style={{ width: `${metric.progress}%` }}></div></div>
            </div>
          ))}
          <button className="pv-btn pv-btn-ghost pv-planner-controls-btn" onClick={() => setControlsOpen(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
            Adjust plan
          </button>
        </div>
      </section>

      {source === "fallback" && error ? (
        <div className="pv-behind-card" style={{ marginBottom: 12 }}>
          <div className="pv-bc-title">Planner API fallback</div>
          <div className="pv-bc-text">{error}</div>
        </div>
      ) : null}

      <div className="pv-battle-grid">
        {(Object.keys(priorityMeta) as PlannerPriority[]).map((priority) => {
          const meta = priorityMeta[priority];
          return (
            <div key={priority} className="pv-battle-col">
              <div className="pv-bc-head">
                <div>
                  <div className="pv-bch-row">
                    <div className="pv-bch-dot" style={{ background: meta.dot }}></div>
                    <div className="pv-bch-label">{meta.label}</div>
                  </div>
                  <div className="pv-bch-meta">{meta.meta}</div>
                </div>
                <div className="pv-bch-count">{groupedTasks[priority].length}</div>
              </div>
              {groupedTasks[priority].map((task) => <TaskCard key={`${task.subject}-${task.title}`} task={task} />)}
            </div>
          );
        })}
      </div>

      <div className="pv-summary-section">
        <div className="pv-summary-card pv-summary-card-risk">
          <div className="pv-bc-title">{plan.risk.title}</div>
          <div className="pv-bc-text">{plan.risk.text}</div>
        </div>
        <div className="pv-summary-card pv-summary-card-secondary">
          <div className="pv-qw-title">{plan.quickWin.title}</div>
          <div className="pv-qw-text">{plan.quickWin.text}</div>
        </div>
      </div>

      {controlsOpen ? (
        <>
          <div className="pv-drawer-overlay" onClick={() => setControlsOpen(false)} />
          <aside className="pv-drawer" role="dialog" aria-modal="true" aria-label="Plan controls">
            <div className="pv-drawer-head">
              <div className="pv-drawer-title">
                <div className="pv-ab-icon">
                  <span className="material-symbols-outlined" style={{ color: "var(--jade)", fontSize: 18 }}>tune</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 850, color: "var(--ink)" }}>Adjust plan</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Quick edits + custom request.</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {source ? (
                  <div className={`pv-badge ${source === "llm" ? "pv-badge-jade" : "pv-badge-fire"}`}>{source === "llm" ? "AI" : "Fallback"}</div>
                ) : null}
                <button className="pv-drawer-close" onClick={() => setControlsOpen(false)} aria-label="Close">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
            </div>

            <div className="pv-drawer-body">
              <div className="pv-plan-controls-kicker">Quick edits</div>
              <div className="pv-drawer-chips">
                {plan.agentChips.slice(0, 4).map((chip) => (
                  <button
                    key={chip}
                    className="pv-drawer-chip"
                    onClick={() => {
                      void generatePlan(chip);
                      setControlsOpen(false);
                    }}
                    disabled={loading}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="pv-plan-controls-kicker" style={{ marginTop: 14 }}>Custom request</div>
              <form
                className="pv-drawer-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void generatePlan(request);
                  setControlsOpen(false);
                }}
              >
                <input
                  className="pv-ab-input"
                  placeholder="e.g. lighter day today, I have 90 minutes"
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                />
                <button className="pv-btn pv-btn-jade pv-btn-full" disabled={loading}>
                  {loading ? "Updating..." : "Update plan"}
                </button>
              </form>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
