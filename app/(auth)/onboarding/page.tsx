"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import styles from "../auth.module.css";

const PLAN_STEPS = [
  { icon: "person_check",   label: "Saving your profile" },
  { icon: "insights",       label: "Analysing your exam timeline" },
  { icon: "auto_awesome",   label: "Building your 365-day study plan" },
  { icon: "calendar_today", label: "Setting up today's schedule" },
];

const stages = [
  { value: "Class 11", icon: "school" },
  { value: "Class 12", icon: "import_contacts" },
  { value: "Repeater", icon: "sync" },
];

const studyHourOptions = [
  { value: "1-2 hrs", icon: "hourglass_empty" },
  { value: "2-4 hrs", icon: "hourglass_bottom" },
  { value: "4-6 hrs", icon: "hourglass_top" },
  { value: "6+ hrs", icon: "hourglass_full" },
];

const subjects = [
  { value: "Physics", icon: "function" },
  { value: "Chemistry", icon: "science" },
  { value: "Biology", icon: "biotech" },
];

const confidenceLevels = [
  { value: "Low", icon: "sentiment_dissatisfied" },
  { value: "Medium", icon: "sentiment_neutral" },
  { value: "High", icon: "sentiment_very_satisfied" },
];

const studyTimes = [
  { value: "Morning", icon: "light_mode" },
  { value: "Afternoon", icon: "wb_sunny" },
  { value: "Evening", icon: "wb_twilight" },
  { value: "Night", icon: "dark_mode" },
];

function ChoiceCards({
  name,
  options,
  selected,
  onSelect,
}: {
  name: string;
  options: { value: string; icon: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className={styles.choiceGrid}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <label
            key={opt.value}
            className={`${styles.choiceCard} ${active ? styles.choiceActive : ""}`}
          >
            <input
              className="sr-only"
              name={name}
              type="radio"
              value={opt.value}
              checked={active}
              onChange={() => onSelect(opt.value)}
            />
            <span className={`material-symbols-outlined ${styles.choiceIcon}`}>{opt.icon}</span>
            <div className={styles.choiceText}>
              <div className={styles.choiceMain}>{opt.value}</div>
              <div className={styles.choiceHint}>Tap to select</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function MultiChoiceCards({
  name,
  options,
  selected,
  toggle,
}: {
  name: string;
  options: { value: string; icon: string }[];
  selected: string[];
  toggle: (v: string) => void;
}) {
  return (
    <div className={styles.choiceGrid}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`${styles.choiceCard} ${active ? styles.choiceActive : ""}`}
          >
            <input
              className="sr-only"
              name={name}
              type="checkbox"
              value={opt.value}
              checked={active}
              onChange={() => toggle(opt.value)}
            />
            <span className={`material-symbols-outlined ${styles.choiceIcon}`}>{opt.icon}</span>
            <div className={styles.choiceText}>
              <div className={styles.choiceMain}>{opt.value}</div>
              <div className={styles.choiceHint}>{active ? "Selected" : "Select"}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [stage, setStage] = useState("");
  const [attemptYear, setAttemptYear] = useState("2026");
  const [studyHours, setStudyHours] = useState("");
  const [strongest, setStrongest] = useState("");
  const [weakest, setWeakest] = useState("");
  const [confidence, setConfidence] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  // Advance the loading screen messages while the API call runs.
  // Delays are tuned to the expected duration of profile save + two LLM calls.
  useEffect(() => {
    if (!saving) { setLoadingStep(0); return; }
    const delays = [0, 1800, 5000, 13000];
    const timers = delays.map((d, i) => window.setTimeout(() => setLoadingStep(i), d));
    return () => timers.forEach(window.clearTimeout);
  }, [saving]);

  const progress = (step / TOTAL_STEPS) * 100;

  const toggleTime = (val: string) => {
    setSelectedTimes((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return fullName.trim().length > 0 && stage !== "";
      case 2: return attemptYear !== "" && studyHours !== "";
      case 3: return strongest !== "" && weakest !== "" && confidence !== "";
      case 4: return selectedTimes.length > 0;
      default: return true;
    }
  };

  const handleGetStarted = async () => {
    if (!user) {
      setError("Session expired. Please go back to login and try again.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: fullName.trim(),
          stage,
          attemptYear: parseInt(attemptYear),
          dailyStudyHours: studyHours,
          strongestSubject: strongest,
          weakestSubject: weakest,
          confidence,
          preferredTimes: selectedTimes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save your profile. Please try again.");
        setSaving(false);
        return;
      }

      localStorage.setItem("prepvicta_onboarded", "1");
      router.push(user.role === "elite" ? "/elite" : "/dashboard");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleGetStarted();
    }
  };

  const stepTitles: Record<number, { heading: string; sub: string }> = {
    1: { heading: "Tell us about yourself", sub: "We'll personalize your NEET preparation journey." },
    2: { heading: "Your NEET timeline", sub: "Help us plan your study schedule effectively." },
    3: { heading: "Subject strengths", sub: "We'll focus your AI planner on what matters most." },
    4: { heading: "When do you study?", sub: "We'll schedule tasks during your peak hours." },
  };

  if (saving) {
    const pct = Math.round(((loadingStep + 1) / PLAN_STEPS.length) * 100);
    return (
      <div className={styles.page}>
        <div className={styles.formPanel}>
          <section className={styles.formWrap}>
            <div className={styles.card}>
              <div className={styles.topBar} />
              <div style={{ padding: "40px 24px 36px", textAlign: "center" }}>

                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 44, color: "var(--jade)", display: "block", marginBottom: 14 }}
                >
                  {PLAN_STEPS[loadingStep].icon}
                </span>

                <div className={styles.stepTitle} style={{ marginBottom: 6 }}>
                  Setting up your PrepVicta
                </div>
                <div className={styles.stepSub} style={{ marginBottom: 22 }}>
                  Generating your personalised study plan — this takes about 20 seconds.
                </div>

                <div className={styles.progressTrack} style={{ marginBottom: 28 }}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%`, transition: "width 1.4s ease" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
                  {PLAN_STEPS.map((s, i) => {
                    const done    = i < loadingStep;
                    const current = i === loadingStep;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          opacity: i > loadingStep ? 0.3 : 1,
                          transition: "opacity 0.5s ease",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 20,
                            color: done ? "var(--jade)" : current ? "var(--blue)" : "var(--text-3)",
                            transition: "color 0.4s ease",
                          }}
                        >
                          {done ? "check_circle" : current ? "pending" : "radio_button_unchecked"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: current ? 700 : 400,
                            color: done ? "var(--jade)" : current ? "var(--ink)" : "var(--text-3)",
                            transition: "color 0.4s ease",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <section className={styles.formWrap}>
          <div className={styles.card}>
            <div className={styles.topBar} />

            <div className={styles.obTop}>
              <div className={styles.brandTop}>
                <Image
                  src="/prepvicta-logo.jpeg"
                  alt="PrepVicta logo"
                  width={36}
                  height={36}
                  className={styles.logo}
                  priority
                />
                <div>
                  <div className={styles.brandName} style={{ fontSize: 18 }}>PrepVicta</div>
                  <div className={styles.brandTagline} style={{ fontSize: 12 }}>Secure onboarding</div>
                </div>
              </div>

              <div className={styles.pill}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
                Step {step}/{TOTAL_STEPS}
              </div>
            </div>

            <div style={{ padding: "0 18px 14px" }}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className={styles.obBody}>
              <div className={styles.stepTitle}>{stepTitles[step].heading}</div>
              <div className={styles.stepSub}>{stepTitles[step].sub}</div>

              {error && (
                <div className={styles.error}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    error
                  </span>
                  <div>{error}</div>
                </div>
              )}

              <div style={{ height: 18 }} />

              {step === 1 && (
                <div className={styles.obGrid}>
                  <div className={styles.field} style={{ maxWidth: 520 }}>
                    <label htmlFor="fullName">Full name</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>person</span>
                      <input
                        className={styles.input}
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className={styles.field} style={{ marginBottom: 6 }}>
                      <label>Current class / stage</label>
                    </div>
                    <ChoiceCards name="stage" options={stages} selected={stage} onSelect={setStage} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label htmlFor="attemptYear">NEET attempt year</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>event</span>
                      <select
                        className={styles.input}
                        id="attemptYear"
                        value={attemptYear}
                        onChange={(e) => setAttemptYear(e.target.value)}
                      >
                        <option disabled value="">
                          Select target year
                        </option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className={styles.field} style={{ marginBottom: 6 }}>
                      <label>Daily study hours</label>
                    </div>
                    <ChoiceCards name="studyHours" options={studyHourOptions} selected={studyHours} onSelect={setStudyHours} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.grid2}>
                  <div>
                    <div className={styles.field} style={{ marginBottom: 6 }}>
                      <label>Strongest subject</label>
                    </div>
                    <ChoiceCards name="strongestSubject" options={subjects} selected={strongest} onSelect={setStrongest} />
                  </div>
                  <div>
                    <div className={styles.field} style={{ marginBottom: 6 }}>
                      <label>Weakest subject</label>
                    </div>
                    <ChoiceCards name="weakestSubject" options={subjects} selected={weakest} onSelect={setWeakest} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.field} style={{ marginBottom: 6 }}>
                      <label>Self-confidence level</label>
                    </div>
                    <ChoiceCards name="confidence" options={confidenceLevels} selected={confidence} onSelect={setConfidence} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className={styles.field} style={{ marginBottom: 6 }}>
                    <label>Preferred study times (select all that apply)</label>
                  </div>
                  <MultiChoiceCards name="studyTime" options={studyTimes} selected={selectedTimes} toggle={toggleTime} />
                  {selectedTimes.length === 0 && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#EF4444", display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                      Select at least one time to continue.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.obActions}>
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className={styles.secondaryBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                  BACK
                </button>
              ) : (
                <Link href="/login" className={styles.secondaryBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                  LOGIN
                </Link>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || saving}
                className={styles.primaryBtn}
                style={{ width: "auto", paddingLeft: 18, paddingRight: 18 }}
              >
                {saving ? "SAVING..." : step < TOTAL_STEPS ? "NEXT" : "FINISH"}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {saving ? "progress_activity" : step < TOTAL_STEPS ? "arrow_forward" : "rocket_launch"}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <Link className={styles.mutedLink} href="/login">Back to Login</Link>
            <span className={styles.dot}>•</span>
            <span>Support Helpdesk</span>
          </div>
        </section>
      </div>
    </div>
  );
}
