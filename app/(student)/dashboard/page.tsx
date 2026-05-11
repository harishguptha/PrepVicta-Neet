"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

interface ProfileData {
  examYear: number;
  daysToExam: number;
  examDate: string;
  studyStreakDays: number;
  plannerAdherence: number;
  syllabusCompleted: number;
  syllabusTotal: number;
  targetScore: number;
  estimatedScoreLow: number;
  estimatedScoreHigh: number;
  revisionPercent: number;
  pendingTasksToday: number;
}

function Skeleton({ width = "100%", height = 16 }: { width?: string | number; height?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius: 6,
        background: "var(--border-1)",
        opacity: 0.5,
        verticalAlign: "middle",
      }}
    />
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    fetch(`/api/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.daysToExam === "number") setProfile(data as ProfileData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const p = profile;

  // Midpoint estimate for display
  const estimatedScore = p
    ? p.estimatedScoreLow === 0 && p.estimatedScoreHigh === 0
      ? null
      : Math.round((p.estimatedScoreLow + p.estimatedScoreHigh) / 2)
    : null;

  // Start score: assume ~0 when syllabus just begun, or derive from low estimate
  const startScore = p ? Math.max(0, (p.estimatedScoreLow ?? 0) - Math.round(p.syllabusCompleted * 1.5)) : null;
  const improvement = estimatedScore !== null && startScore !== null ? estimatedScore - startScore : null;

  const syllabusPercent = p && p.syllabusTotal > 0
    ? Math.round((p.syllabusCompleted / p.syllabusTotal) * 100)
    : 0;

  return (
    <>
      <div className="pv-screen-hdr">
        <div>
          <div className="pv-h1">Estimated NEET Score</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
            {loading
              ? "Loading your progress…"
              : p
              ? `NEET ${p.examYear} · ${p.daysToExam} days left · ${p.examDate}`
              : "Complete onboarding to see your score estimate."}
          </div>
        </div>
        <span style={{
          fontSize: 11,
          padding: "5px 12px",
          background: "var(--gold-bg)",
          color: "var(--gold)",
          borderRadius: 999,
          fontWeight: 700,
          border: "1px solid rgba(185,120,22,0.22)",
        }}>
          {loading ? "Loading" : p ? "Live" : "No data"}
        </span>
      </div>

      <div className="pv-focus-rail" style={{ marginBottom: 16 }}>
        <div className="pv-focus-copy">
          <span className="pv-step-kicker">Score estimate</span>
          <strong>
            {loading
              ? "Calculating your estimated score…"
              : estimatedScore !== null
              ? `Estimated score: ${p!.estimatedScoreLow}–${p!.estimatedScoreHigh} / ${p!.targetScore} target`
              : "Score tracking begins after your first week of activity."}
          </strong>
          <span>
            {p
              ? `${p.syllabusCompleted}/${p.syllabusTotal} chapters covered · ${p.plannerAdherence}% planner adherence`
              : "Study consistently to generate an accurate estimate."}
          </span>
        </div>
        <button className="pv-primary-action">View plan</button>
      </div>

      <div className="pv-report-card">
        <div className="pv-rp-hdr">
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            PrepVicta · NEET {loading ? "—" : p?.examYear ?? "—"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
            Estimated NEET Score:{" "}
            {loading ? <Skeleton width={60} height={18} /> : estimatedScore !== null ? estimatedScore : "—"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Target: {loading ? "—" : p?.targetScore ?? "—"} · {loading ? "—" : `${p?.daysToExam ?? "—"} days to exam`}
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div className="pv-verdict-sentence">
            {loading ? (
              <Skeleton width="80%" />
            ) : estimatedScore !== null ? (
              <>
                Current estimate is <span>{estimatedScore}</span>.
                {estimatedScore >= (p!.targetScore ?? 650)
                  ? " You are on track for your target score."
                  : ` ${(p!.targetScore ?? 650) - estimatedScore} marks to reach your target of ${p!.targetScore}.`}
              </>
            ) : (
              "Complete more study sessions to generate your score estimate."
            )}
          </div>

          <div className="pv-label" style={{ marginBottom: 8 }}>Progress inputs</div>
          <div className="pv-verdict-3" style={{ marginBottom: 16 }}>
            <div className="pv-v3-cell">
              <div className="pv-v3-lbl">Study streak</div>
              <div className="pv-v3-num" style={{ color: "var(--jade)" }}>
                {loading ? <Skeleton width={32} height={20} /> : p?.studyStreakDays ?? 0}
              </div>
              <div className="pv-v3-sub">days active</div>
            </div>
            <div className="pv-v3-cell">
              <div className="pv-v3-lbl">Tasks pending</div>
              <div className="pv-v3-num" style={{ color: "var(--gold)" }}>
                {loading ? <Skeleton width={32} height={20} /> : p?.pendingTasksToday ?? 0}
              </div>
              <div className="pv-v3-sub">today</div>
            </div>
            <div className="pv-v3-cell">
              <div className="pv-v3-lbl">Syllabus done</div>
              <div className="pv-v3-num" style={{ color: "var(--jade)" }}>
                {loading ? <Skeleton width={32} height={20} /> : `${syllabusPercent}%`}
              </div>
              <div className="pv-v3-sub">{loading ? "" : `${p?.syllabusCompleted ?? 0}/${p?.syllabusTotal ?? 97} chapters`}</div>
            </div>
          </div>

          <div className="pv-label" style={{ marginBottom: 8 }}>Estimated score journey</div>
          <div className="pv-journey-strip">
            <div>
              <div className="pv-js-num">{loading ? <Skeleton width={36} /> : startScore ?? "—"}</div>
              <div className="pv-js-lbl">Start</div>
            </div>
            <div style={{ color: "var(--border-2)", fontSize: 16 }}>----</div>
            <div style={{ textAlign: "center" }}>
              <div className="pv-js-gain-num">
                {loading ? <Skeleton width={60} /> : improvement !== null ? `+${improvement} marks` : "Tracking…"}
              </div>
              <div className="pv-js-gain-lbl">total improvement</div>
            </div>
            <div style={{ color: "var(--border-2)", fontSize: 16 }}>----</div>
            <div>
              <div className="pv-js-num" style={{ color: "var(--jade)" }}>
                {loading ? <Skeleton width={36} /> : estimatedScore ?? "—"}
              </div>
              <div className="pv-js-lbl">Current</div>
            </div>
          </div>

          {p && p.plannerAdherence < 60 && (
            <div style={{
              background: "var(--gold-bg)",
              border: "1px solid rgba(185,120,22,0.22)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                Planner adherence low
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                You are completing {p.plannerAdherence}% of daily plans. Aim for 80%+ to stay on your score trajectory.
              </div>
            </div>
          )}

          {p && p.revisionPercent < 30 && (
            <div style={{
              background: "var(--gold-bg)",
              border: "1px solid rgba(185,120,22,0.22)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                Revision needed
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                Only {p.revisionPercent}% of covered chapters have been revised. Spaced revision is critical for NEET retention.
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.7 }}>
            Score estimate is derived from syllabus coverage, planner adherence, and revision rate.
            It updates automatically as you complete study sessions.
          </div>
        </div>
      </div>
    </>
  );
}
