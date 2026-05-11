import fs from "fs";
import path from "path";
import { fallbackPlannerPlan, type PlannerPlan, type PlannerPriority, type PlannerTask } from "@/lib/planner";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// ── DB helpers ─────────────────────────────────────────────────────────────

function parseDurationMin(duration: string): number {
  const n = parseInt(duration.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

async function getUserId(email: string): Promise<string | null> {
  try {
    const res = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    return (res.rows[0]?.id as string) ?? null;
  } catch {
    return null;
  }
}

async function resolveUserId(user?: PlannerRequestBody["user"]): Promise<string | null> {
  if (user?.id) {
    try {
      const res = await query(`SELECT id FROM users WHERE id = $1`, [user.id]);
      return (res.rows[0]?.id as string) ?? null;
    } catch {
      return null;
    }
  }
  return user?.email ? getUserId(user.email) : null;
}

async function savePlanToDB(
  userId: string,
  plan: PlannerPlan,
  source: "llm" | "fallback",
  modelName: string | null,
  requestText: string | null,
): Promise<void> {
  try {
    await query(
      `UPDATE student_planner_plans SET status = 'superseded', updated_at = NOW()
       WHERE user_id = $1 AND plan_date = CURRENT_DATE AND status = 'active'`,
      [userId],
    );

    const planResult = await query(
      `INSERT INTO student_planner_plans (
         user_id, plan_date, request_text, source, model_name, status,
         date_line, verdict, consequence, primary_action, total_time,
         short_session_action, progress_percent, plan_json
       ) VALUES ($1, CURRENT_DATE, $2, $3, $4, 'active', $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
       RETURNING id`,
      [
        userId, requestText, source, modelName,
        plan.dateLine, plan.verdict, plan.consequence, plan.primaryAction,
        parseDurationMin(plan.totalTime), plan.shortSessionAction, plan.progressPercent,
        JSON.stringify(plan),
      ],
    );

    const planId = planResult.rows[0]?.id as string | undefined;
    if (!planId) return;

    for (const task of plan.tasks) {
      await query(
        `INSERT INTO student_planner_tasks (
           plan_id, user_id, subject, title, note, duration_min, priority,
           status, is_done, plan_date, why, unlock, skip_cost, value_label, action_label
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false, CURRENT_DATE, $8, $9, $10, $11, $12)`,
        [
          planId, userId, task.subject, task.title, task.why,
          parseDurationMin(task.duration), task.priority,
          task.why, task.unlock, task.skipCost, task.value, task.actionLabel,
        ],
      );
    }
  } catch (err) {
    console.error("savePlanToDB error:", err);
  }
}

// ── Master plan helpers ────────────────────────────────────────────────────

function buildMasterPlanPrompt(
  profile: StudentProfile,
  daysToExam: number,
  planHistory: unknown[],
  taskHistory: unknown[],
): string {
  const yamlPath = path.join(process.cwd(), "backend", "prompts", "prompt.yaml");
  const yamlContent = fs.readFileSync(yamlPath, "utf8");

  // Extract indented block after "system_prompt: |"
  const lines = yamlContent.split("\n");
  const startIdx = lines.findIndex((l) => l.startsWith("system_prompt:")) + 1;
  const promptText = lines
    .slice(startIdx)
    .map((l) => l.replace(/^ {2}/, ""))
    .join("\n")
    .trim();

  const vars: Record<string, string> = {
    stage:                String(profile.stage ?? "Class 12"),
    attempt_year:         String(profile.attempt_year ?? new Date().getFullYear() + 1),
    days_to_exam:         String(daysToExam),
    daily_study_hours:    String(profile.daily_study_hours ?? "4-6 hrs"),
    strongest_subject:    String(profile.strongest_subject ?? "Biology"),
    weakest_subject:      String(profile.weakest_subject ?? "Chemistry"),
    confidence:           String(profile.confidence ?? "Medium"),
    preferred_times:      (profile.preferred_times ?? ["Evening"]).join(", "),
    target_score:         String(profile.target_score ?? 650),
    estimated_score_low:  String(profile.estimated_score_low ?? 0),
    estimated_score_high: String(profile.estimated_score_high ?? 0),
    syllabus_completed:   String(profile.syllabus_completed ?? 0),
    syllabus_total:       String(profile.syllabus_total ?? 97),
    planner_adherence:    String(profile.planner_adherence ?? 0),
    study_streak_days:    String(profile.study_streak_days ?? 0),
    revision_percent:     String(profile.revision_percent ?? 0),
    plan_history:         planHistory.length ? JSON.stringify(planHistory) : "No previous plans",
    task_history:         taskHistory.length ? JSON.stringify(taskHistory) : "No previous tasks",
  };

  return Object.entries(vars).reduce(
    (prompt, [key, value]) => prompt.replaceAll(`{{${key}}}`, value),
    promptText,
  );
}

async function saveMasterPlanToDB(
  userId: string,
  masterPlan: Record<string, unknown>,
  source: "llm" | "fallback",
  modelName: string | null,
): Promise<void> {
  try {
    const profRes = await query(
      `SELECT attempt_year FROM student_profiles WHERE user_id = $1`,
      [userId],
    );
    const attemptYear = profRes.rows[0]?.attempt_year as number | undefined;
    const examDateStr = nextMayExamDate(attemptYear ?? null).toISOString().slice(0, 10);

    await query(
      `UPDATE student_planner_plans SET status = 'superseded', updated_at = NOW()
       WHERE user_id = $1 AND plan_date = $2 AND status = 'active'`,
      [userId, examDateStr],
    );
    await query(
      `INSERT INTO student_planner_plans (
         user_id, plan_date, source, model_name, status, plan_json
       ) VALUES ($1, $2, $3, $4, 'active', $5::jsonb)`,
      [userId, examDateStr, source, modelName, JSON.stringify(masterPlan)],
    );
  } catch (err) {
    console.error("saveMasterPlanToDB error:", err);
  }
}

// ── GET — load plan from DB ────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");
  const type = searchParams.get("type") ?? "daily";
  if (!email && !userId) return Response.json({ error: "Missing userId or email" }, { status: 400 });

  try {
    let res;

    if (type === "master") {
      res = await query(
        `SELECT pp.plan_json, pp.source
         FROM student_planner_plans pp
         JOIN users u ON u.id = pp.user_id
         JOIN student_profiles sp ON sp.user_id = pp.user_id
         WHERE ($1::uuid IS NOT NULL AND pp.user_id = $1::uuid OR $2::text IS NOT NULL AND u.email = $2)
           AND pp.plan_date = CASE
             WHEN make_date(sp.attempt_year, 5, 1) < CURRENT_DATE
             THEN make_date(sp.attempt_year + 1, 5, 1)
             ELSE make_date(sp.attempt_year, 5, 1)
           END
           AND (pp.status = 'active' OR pp.status IS NULL)
         ORDER BY CASE WHEN pp.status = 'active' THEN 0 ELSE 1 END, pp.created_at DESC
         LIMIT 1`,
        [userId, email],
      );
    } else {
      res = await query(
        `SELECT pp.id, pp.plan_json, pp.source, pp.date_line, pp.verdict, pp.consequence,
                pp.primary_action, pp.total_time, pp.short_session_action, pp.progress_percent
         FROM student_planner_plans pp
         JOIN users u ON u.id = pp.user_id
         WHERE ($1::uuid IS NOT NULL AND pp.user_id = $1::uuid OR $2::text IS NOT NULL AND u.email = $2)
           AND pp.plan_date = CURRENT_DATE
           AND (pp.status = 'active' OR pp.status IS NULL)
         ORDER BY CASE WHEN pp.status = 'active' THEN 0 ELSE 1 END, pp.created_at DESC
         LIMIT 1`,
        [userId, email],
      );
    }

    if (res.rows.length === 0) {
      return Response.json({ error: "No plan found" }, { status: 404 });
    }

    const row = res.rows[0];
    if (type === "master") {
      return Response.json({ plan: row.plan_json, source: row.source });
    }

    const taskRes = await query(
      `SELECT subject, title, note, duration_min, priority, is_done, why, unlock,
              skip_cost, value_label, action_label
       FROM student_planner_tasks
       WHERE plan_id = $1
       ORDER BY
         CASE priority WHEN 'must' THEN 0 WHEN 'should' THEN 1 WHEN 'could' THEN 2 ELSE 3 END,
         created_at ASC`,
      [row.id],
    );

    const rowPlan = row.plan_json && Object.keys(row.plan_json).length
      ? row.plan_json
      : {
          dateLine: row.date_line,
          verdict: row.verdict,
          consequence: row.consequence,
          primaryAction: row.primary_action,
          totalTime: row.total_time ? `${row.total_time} min` : undefined,
          shortSessionAction: row.short_session_action,
          progressPercent: row.progress_percent,
        };
    const tasks = taskRes.rows.map((task) => ({
      priority: normalizePriority(task.priority),
      subject: text(task.subject, "Physics"),
      title: text(task.title, "Study task"),
      duration: task.duration_min ? `${task.duration_min} min` : "30 min",
      why: text(task.why ?? task.note, "Complete this block to keep today's plan on track."),
      unlock: text(task.unlock, "Unlocks the next study block"),
      skipCost: text(task.skip_cost, "This task remains pending"),
      value: text(task.value_label, "Important task"),
      actionLabel: text(task.action_label, "Start Task"),
      done: Boolean(task.is_done),
    }));

    return Response.json({
      plan: normalizePlan({ ...rowPlan, ...(tasks.length ? { tasks } : {}) }),
      source: row.source,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/planner error:", message);
    // Return 404 so the UI shows "No plan yet" rather than a hard error
    return Response.json({ error: "No plan found" }, { status: 404 });
  }
}

const invokeUrl = "https://api.mistral.ai/v1/chat/completions";
// Mistral's API generally expects names like `mistral-medium-latest`.
// If an invalid model is configured, we retry once with a safe fallback.
const configuredModel = process.env.MISTRAL_MODEL ?? "mistral-medium-latest";
const fallbackTimeoutMs = 18000;

interface PlannerRequestBody {
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  request?: string;
  type?: "master" | "daily";
}

interface StudentProfile {
  stage: string | null;
  attempt_year: number | null;
  daily_study_hours: string | null;
  strongest_subject: string | null;
  weakest_subject: string | null;
  confidence: string | null;
  preferred_times: string[] | null;
  target_score: number | null;
  estimated_score_low: number | null;
  estimated_score_high: number | null;
  syllabus_completed: number | null;
  syllabus_total: number | null;
  planner_adherence: number | null;
  study_streak_days: number | null;
  revision_percent: number | null;
}

function nextMayExamDate(attemptYear: number | null | undefined) {
  const today = new Date();
  const year = Number(attemptYear) || today.getFullYear() + 1;
  // NEET is typically in May. Use May 1 as a stable anchor.
  const candidate = new Date(year, 4, 1);
  if (candidate.getTime() < today.getTime()) return new Date(year + 1, 4, 1);
  return candidate;
}

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

async function loadStudentProfile(email?: string): Promise<StudentProfile | null> {
  if (!email) return null;
  try {
    const res = await query(
      `SELECT sp.stage, sp.attempt_year,
              COALESCE(sp.metadata->>'daily_study_hours_label', sp.daily_study_hours::text, sp.metadata->>'daily_study_hours') AS daily_study_hours,
              sp.strongest_subject, sp.weakest_subject,
              COALESCE(sp.metadata->>'confidence_label', sp.confidence::text) AS confidence,
              sp.preferred_times,
              sp.target_score, sp.estimated_score_low, sp.estimated_score_high,
              sp.syllabus_completed, sp.syllabus_total,
              sp.planner_adherence, sp.study_streak_days, sp.revision_percent
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE u.email = $1
       LIMIT 1`,
      [email],
    );
    return (res.rows?.[0] as StudentProfile | undefined) ?? null;
  } catch {
    return null;
  }
}

async function loadPlanHistory(userId: string | null): Promise<unknown[]> {
  if (!userId) return [];
  try {
    const res = await query(
      `SELECT plan_date, verdict, total_time, progress_percent
       FROM student_planner_plans
       WHERE user_id = $1 AND status = 'active' AND plan_date != CURRENT_DATE
       ORDER BY plan_date DESC LIMIT 7`,
      [userId],
    );
    return res.rows;
  } catch {
    return [];
  }
}

async function loadTaskHistory(userId: string | null): Promise<unknown[]> {
  if (!userId) return [];
  try {
    const res = await query(
      `SELECT subject, title, status, is_done, duration_min, priority, plan_date
       FROM student_planner_tasks
       WHERE user_id = $1
       ORDER BY plan_date DESC LIMIT 50`,
      [userId],
    );
    return res.rows;
  } catch {
    return [];
  }
}

function clampPercent(value: unknown, fallback: number) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePriority(value: unknown): PlannerPriority {
  return value === "should" || value === "could" || value === "must" ? value : "must";
}

function normalizeTask(value: unknown, fallback: PlannerTask): PlannerTask {
  const task = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    priority: normalizePriority(task.priority ?? fallback.priority),
    subject: text(task.subject, fallback.subject),
    title: text(task.title, fallback.title),
    duration: text(task.duration, fallback.duration),
    why: text(task.why, fallback.why),
    unlock: text(task.unlock, fallback.unlock),
    skipCost: text(task.skipCost, fallback.skipCost),
    value: text(task.value, fallback.value),
    actionLabel: text(task.actionLabel, fallback.actionLabel),
    done: Boolean(task.done ?? fallback.done),
  };
}

function normalizePlan(raw: unknown): PlannerPlan {
  const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const fallback = fallbackPlannerPlan;
  const score = obj.score && typeof obj.score === "object" ? obj.score as Record<string, unknown> : {};

  const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
  const rawTasks = Array.isArray(obj.tasks) ? obj.tasks : [];
  const rawMetrics = Array.isArray(obj.metrics) ? obj.metrics : [];
  const rawTrend = Array.isArray(score.trend) ? score.trend : [];

  return {
    dateLine: text(obj.dateLine, fallback.dateLine),
    progressLabel: text(obj.progressLabel, fallback.progressLabel),
    progressPercent: clampPercent(obj.progressPercent, fallback.progressPercent),
    progressCount: text(obj.progressCount, fallback.progressCount),
    winPathLabel: text(obj.winPathLabel, fallback.winPathLabel),
    verdict: text(obj.verdict, fallback.verdict),
    consequence: text(obj.consequence, fallback.consequence),
    steps: fallback.steps.map((step, index) => {
      const next = rawSteps[index] && typeof rawSteps[index] === "object" ? rawSteps[index] as Record<string, unknown> : {};
      return {
        title: text(next.title, step.title),
        meta: text(next.meta, step.meta),
      };
    }),
    primaryAction: text(obj.primaryAction, fallback.primaryAction),
    totalTime: text(obj.totalTime, fallback.totalTime),
    shortSessionAction: text(obj.shortSessionAction, fallback.shortSessionAction),
    score: {
      current: Number(score.current) || fallback.score.current,
      delta: text(score.delta, fallback.score.delta),
      targetText: text(score.targetText, fallback.score.targetText),
      targetScore: Number(score.targetScore) || fallback.score.targetScore,
      progressPercent: clampPercent(score.progressPercent, fallback.score.progressPercent),
      trend: fallback.score.trend.map((point, index) => {
        const next = rawTrend[index] && typeof rawTrend[index] === "object" ? rawTrend[index] as Record<string, unknown> : {};
        return {
          label: text(next.label, point.label),
          score: Number(next.score) || point.score,
        };
      }),
    },
    risk: {
      title: text((obj.risk as Record<string, unknown> | undefined)?.title, fallback.risk.title),
      text: text((obj.risk as Record<string, unknown> | undefined)?.text, fallback.risk.text),
    },
    quickWin: {
      title: text((obj.quickWin as Record<string, unknown> | undefined)?.title, fallback.quickWin.title),
      text: text((obj.quickWin as Record<string, unknown> | undefined)?.text, fallback.quickWin.text),
    },
    metrics: fallback.metrics.map((metric, index) => {
      const next = rawMetrics[index] && typeof rawMetrics[index] === "object" ? rawMetrics[index] as Record<string, unknown> : {};
      return {
        label: text(next.label, metric.label),
        value: text(next.value, metric.value),
        note: text(next.note, metric.note),
        progress: clampPercent(next.progress, metric.progress),
      };
    }),
    progressNudge: {
      text: text((obj.progressNudge as Record<string, unknown> | undefined)?.text, fallback.progressNudge.text),
      cta: text((obj.progressNudge as Record<string, unknown> | undefined)?.cta, fallback.progressNudge.cta),
    },
    agentChips: Array.isArray(obj.agentChips) && obj.agentChips.length
      ? obj.agentChips.slice(0, 4).map((chip, index) => text(chip, fallback.agentChips[index] ?? "Adjust plan"))
      : fallback.agentChips,
    tasks: fallback.tasks.map((task, index) => normalizeTask(rawTasks[index], task)),
  };
}

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Planner response did not contain JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function plannerTimeoutMs() {
  const configured = Number(process.env.PLANNER_API_TIMEOUT_MS);
  if (!Number.isFinite(configured) || configured <= 0) return fallbackTimeoutMs;
  return Math.max(1000, Math.min(30000, Math.round(configured)));
}

function buildFallbackPlan(body: PlannerRequestBody, profile?: StudentProfile | null): PlannerPlan {
  const requestText = (body.request ?? "").toLowerCase();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const examDate = nextMayExamDate(profile?.attempt_year ?? null);
  const daysLeft = daysBetween(new Date(), examDate);
  const examLine = `NEET in ${daysLeft} days`;

  const isLight = requestText.includes("light") || requestText.includes("lighter") || requestText.includes("less");
  const missedDays = requestText.includes("missed") || requestText.includes("backlog");
  const physicsFocus = requestText.includes("physics");
  const chemistryFocus = requestText.includes("chem");
  const biologyFocus = requestText.includes("bio");
  const highScoring = requestText.includes("high") || requestText.includes("scoring");

  if (isLight) {
    return {
      ...fallbackPlannerPlan,
      dateLine: `${today} | ${examLine} • lighter recovery plan`,
      verdict: "Keep momentum with one Physics repair set, one Biology recall set, and one tiny Chemistry check.",
      consequence: "Trying a heavy plan today increases skip risk. A finished light plan protects consistency.",
      steps: [
        { title: "Physics formula recall", meta: "20 min - write and apply 8 formulas" },
        { title: "Biology NCERT lines", meta: "15 min - marked lines only" },
        { title: "Chemistry reaction check", meta: "10 min - named reactions or formulas" },
      ],
      totalTime: "~45 min total",
      shortSessionAction: "Only 15 min? Do Biology marked lines",
      tasks: [
        {
          priority: "must",
          subject: "Physics",
          title: "Electrostatics: 8-formula recall sprint",
          duration: "20 min",
          why: "A small Physics block keeps formulas active without draining the day.",
          unlock: "Unlocks: short numerical warm-up",
          skipCost: "Formula recall weakens before practice",
          value: "Best light-day score protection",
          actionLabel: "Start Sprint",
        },
        {
          priority: "should",
          subject: "Biology",
          title: "Human Physiology: marked NCERT lines",
          duration: "15 min",
          why: "Exact line recall protects Biology accuracy with low effort.",
          unlock: "Unlocks: 10-question recall check",
          skipCost: "Easy facts stay fragile",
          value: "Fast retention win",
          actionLabel: "Start Recall",
        },
        {
          priority: "could",
          subject: "Chemistry",
          title: "Biomolecules: one-page reaction review",
          duration: "10 min",
          why: "Short review prevents avoidable memory slips.",
          unlock: "Unlocks: 5-question quick check",
          skipCost: "Low immediate risk",
          value: "Good if energy remains",
          actionLabel: "Start Review",
        },
      ],
    };
  }

  if (missedDays) {
    return {
      ...fallbackPlannerPlan,
      dateLine: `${today} | ${examLine} • backlog restart plan`,
      verdict: "Do not repay all missed days. Restart with the three highest-return tasks only.",
      consequence: "Trying to cover every missed topic today usually creates another missed day tomorrow.",
      steps: [
        { title: "Restart with errors", meta: "45 min - last mock mistakes only" },
        { title: "Recover NCERT memory", meta: "25 min - Biology active recall" },
        { title: "Close one Chemistry gap", meta: "20 min - formula plus test" },
      ],
      risk: {
        title: "Backlog rule",
        text: "Do not add new chapters until today's three recovery blocks are finished.",
      },
      quickWin: {
        title: "First 10 minutes",
        text: "List the last 5 questions you got wrong and write the reason beside each.",
      },
      tasks: [
        {
          priority: "must",
          subject: "Physics",
          title: "Last mock Physics mistakes: redo without solutions",
          duration: "45 min",
          why: "Backlog recovery starts fastest by fixing mistakes already proven to cost marks.",
          unlock: "Unlocks: corrected error log",
          skipCost: "~15 marks can repeat in the next mock",
          value: "Highest recovery task",
          actionLabel: "Start Recovery",
        },
        {
          priority: "should",
          subject: "Biology",
          title: "Genetics: NCERT definitions and exceptions",
          duration: "25 min",
          why: "Genetics facts and terms are easy to regain after a break.",
          unlock: "Unlocks: 20-line recall check",
          skipCost: "Definitions stay shaky",
          value: "Stabilizes restart",
          actionLabel: "Start Revision",
        },
        {
          priority: "could",
          subject: "Chemistry",
          title: "Chemical Kinetics: formula substitution drill",
          duration: "20 min",
          why: "A compact formula drill restores confidence without opening a large chapter.",
          unlock: "Unlocks: 8-question sprint",
          skipCost: "Formula hesitation continues",
          value: "Useful closure task",
          actionLabel: "Start Drill",
        },
      ],
    };
  }

  if (physicsFocus) {
    return {
      ...fallbackPlannerPlan,
      dateLine: `${today} | ${examLine} • Physics-first plan`,
      verdict: "Attack Physics with solved-error practice first, then use Biology and Chemistry to protect accuracy.",
      consequence: "Avoiding Physics keeps the biggest score leak open for the next test.",
      steps: [
        { title: "Current Electricity numericals", meta: "50 min - circuits and meter bridge" },
        { title: "Formula correction sheet", meta: "15 min - write missed formulas" },
        { title: "Biology quick recall", meta: "20 min - keep NCERT active" },
      ],
      totalTime: "~85 min total",
      tasks: [
        {
          priority: "must",
          subject: "Physics",
          title: "Current Electricity: circuits, graphs, and units",
          duration: "50 min",
          why: "This is a high-return Physics block with repeated NEET-style patterns.",
          unlock: "Unlocks: 15-question timed Physics set",
          skipCost: "~12-16 marks remain exposed",
          value: "Main score recovery block",
          actionLabel: "Start Physics",
        },
        {
          priority: "should",
          subject: "Physics",
          title: "Mistake log: formulas and unit traps",
          duration: "15 min",
          why: "Most Physics losses repeat through the same formula or unit mistake.",
          unlock: "Unlocks: corrected formula sheet",
          skipCost: "Same mistakes can repeat",
          value: "Prevents repeat loss",
          actionLabel: "Fix Errors",
        },
        {
          priority: "could",
          subject: "Biology",
          title: "Human Physiology: 20 NCERT facts",
          duration: "20 min",
          why: "A short Biology block keeps scoring facts warm after Physics work.",
          unlock: "Unlocks: rapid recall check",
          skipCost: "Low immediate risk",
          value: "Accuracy protection",
          actionLabel: "Start Recall",
        },
      ],
    };
  }

  if (chemistryFocus) {
    return {
      ...fallbackPlannerPlan,
      dateLine: `${today} | ${examLine} • Chemistry-first plan`,
      verdict: "Start with Physical Chemistry calculations, then close one Organic memory gap.",
      consequence: "Skipping Chemistry today keeps formulas and reactions slow during timed practice.",
      steps: [
        { title: "Chemical Kinetics calculations", meta: "40 min - first order and half-life" },
        { title: "Organic reactions", meta: "25 min - named reactions and exceptions" },
        { title: "Biology recall", meta: "20 min - maintain NCERT accuracy" },
      ],
      tasks: [
        {
          priority: "must",
          subject: "Chemistry",
          title: "Chemical Kinetics: first-order numericals",
          duration: "40 min",
          why: "Formula-based Chemistry can recover marks quickly with focused practice.",
          unlock: "Unlocks: 12-question kinetics sprint",
          skipCost: "~8-10 marks stay unstable",
          value: "Highest Chemistry return",
          actionLabel: "Start Chemistry",
        },
        {
          priority: "should",
          subject: "Chemistry",
          title: "Aldehydes and Ketones: named reaction recall",
          duration: "25 min",
          why: "Organic memory gaps are best fixed with active recall and examples.",
          unlock: "Unlocks: reaction map update",
          skipCost: "Reaction confusion continues",
          value: "Memory repair block",
          actionLabel: "Start Recall",
        },
        {
          priority: "could",
          subject: "Biology",
          title: "Ecology: NCERT examples check",
          duration: "20 min",
          why: "Ecology examples are direct scoring facts.",
          unlock: "Unlocks: 10-question NCERT check",
          skipCost: "Low immediate risk",
          value: "Easy marks protection",
          actionLabel: "Start Review",
        },
      ],
    };
  }

  if (biologyFocus || highScoring) {
    return {
      ...fallbackPlannerPlan,
      dateLine: `${today} | ${examLine} • high-scoring plan`,
      verdict: "Maximize return with NCERT Biology first, then a compact Chemistry and Physics check.",
      consequence: "Skipping high-yield NCERT recall risks losing marks that should be secured.",
      steps: [
        { title: "Biology NCERT mastery", meta: "45 min - marked lines and examples" },
        { title: "Chemistry formula sprint", meta: "25 min - quick calculation set" },
        { title: "Physics error check", meta: "20 min - only repeated mistakes" },
      ],
      totalTime: "~90 min total",
      tasks: [
        {
          priority: "must",
          subject: "Biology",
          title: "Genetics and Human Physiology: NCERT active recall",
          duration: "45 min",
          why: "Biology gives the fastest high-accuracy score gain when NCERT recall is exact.",
          unlock: "Unlocks: 30-question Biology accuracy check",
          skipCost: "~15-20 easy marks stay at risk",
          value: "Highest scoring task today",
          actionLabel: "Start Biology",
        },
        {
          priority: "should",
          subject: "Chemistry",
          title: "Solutions and Kinetics: formula sprint",
          duration: "25 min",
          why: "Short numerical Chemistry practice protects formula-based marks.",
          unlock: "Unlocks: 10-question formula test",
          skipCost: "Calculation speed stays low",
          value: "Quick score protection",
          actionLabel: "Start Sprint",
        },
        {
          priority: "could",
          subject: "Physics",
          title: "Current Electricity: 5 mistake patterns",
          duration: "20 min",
          why: "Small Physics repair prevents repeated loss without taking over the plan.",
          unlock: "Unlocks: corrected mistake log",
          skipCost: "Low immediate risk",
          value: "Good repair task",
          actionLabel: "Fix Mistakes",
        },
      ],
    };
  }

  return {
    ...fallbackPlannerPlan,
    dateLine: `${today} | ${examLine} • balanced NEET plan`,
  };
}

function plannerPrompt(body: PlannerRequestBody, profile?: StudentProfile | null) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const examDate = nextMayExamDate(profile?.attempt_year ?? null);
  const daysLeft = daysBetween(new Date(), examDate);
  const examLabel = `NEET (May) in ${daysLeft} days`;

  return `You are PrepVicta's elite NEET planner. Generate the best possible daily plan for a NEET student.

Student:
- Name: ${body.user?.name ?? "Student"}
- Today: ${today}
- Exam timeline: ${examLabel}
- Attempt year: ${profile?.attempt_year ?? "unknown"}
- Stage: ${profile?.stage ?? "unknown"}
- Daily study hours: ${profile?.daily_study_hours ?? "unknown"}
- Strongest: ${profile?.strongest_subject ?? "unknown"}
- Weakest: ${profile?.weakest_subject ?? "unknown"}
- Confidence: ${profile?.confidence ?? "unknown"}
- Preferred study times: ${profile?.preferred_times?.join(", ") ?? "unknown"}
- User request: ${body.request || "Create the highest scoring plan for today."}

Planning rules:
- Plan MUST fit the student's daily study hours and preferred study times.
- Prioritize the weakest subject unless the user explicitly requests otherwise.
- Prioritize score recovery, weak chapters, spaced revision, and realistic time blocks.
- Include exactly 3 win-path steps.
- Include exactly 3 tasks: one must, one should, one could.
- Make the first task the highest-impact task.
- Avoid motivational fluff. Use concise student-facing copy.
- Return only valid JSON. No markdown.

JSON shape:
{
  "dateLine": "string",
  "progressLabel": "string",
  "progressPercent": 0,
  "progressCount": "string",
  "winPathLabel": "string",
  "verdict": "string",
  "consequence": "string",
  "steps": [{"title":"string","meta":"string"}],
  "primaryAction": "string",
  "totalTime": "string",
  "shortSessionAction": "string",
  "score": {
    "current": 0,
    "delta": "string",
    "targetText": "string",
    "targetScore": 0,
    "progressPercent": 0,
    "trend": [{"label":"M1","score":0},{"label":"M2","score":0},{"label":"M3","score":0},{"label":"M4","score":0},{"label":"M5","score":0}]
  },
  "risk": {"title":"string","text":"string"},
  "quickWin": {"title":"string","text":"string"},
  "metrics": [{"label":"string","value":"string","note":"string","progress":0},{"label":"string","value":"string","note":"string","progress":0}],
  "progressNudge": {"text":"string","cta":"string"},
  "agentChips": ["string","string","string","string"],
  "tasks": [{
    "priority": "must",
    "subject": "string",
    "title": "string",
    "duration": "string",
    "why": "string",
    "unlock": "string",
    "skipCost": "string",
    "value": "string",
    "actionLabel": "string",
    "done": false
  }]
}`;
}

async function callPlannerLLM(apiKey: string, prompt: string, model: string) {
  const response = await fetch(invokeUrl, {
    method: "POST",
    signal: AbortSignal.timeout(plannerTimeoutMs()),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You generate strict JSON for a NEET planner UI." },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.45,
      top_p: 1,
      stream: false,
    }),
  });

  const rawText = await response.text();
  let json: unknown = undefined;
  try {
    json = rawText ? JSON.parse(rawText) : undefined;
  } catch {
    // ignore non-json response bodies
  }

  return { response, rawText, json };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as PlannerRequestBody;
  const apiKey = process.env.MISTRAL_API_KEY;
  const [profile, userId] = await Promise.all([
    loadStudentProfile(body.user?.email),
    resolveUserId(body.user),
  ]);

  // ── 365-day master plan branch ──────────────────────────────────────────
  if (body.type === "master") {
    const examDate = nextMayExamDate(profile?.attempt_year ?? null);
    const daysToExam = daysBetween(new Date(), examDate);
    const [planHistory, taskHistory] = await Promise.all([
      loadPlanHistory(userId),
      loadTaskHistory(userId),
    ]);

    if (!apiKey) {
      return Response.json({ error: "Missing MISTRAL_API_KEY." }, { status: 500 });
    }
    try {
      const systemPrompt = buildMasterPlanPrompt(profile ?? {} as StudentProfile, daysToExam, planHistory, taskHistory);
      const attempt = await callPlannerLLM(apiKey, systemPrompt, configuredModel);
      if (!attempt.response.ok) throw new Error(`Model error ${attempt.response.status}`);
      const content = (attempt.json as any)?.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Empty model response");
      const masterPlan = extractJson(content) as Record<string, unknown>;
      if (userId) await saveMasterPlanToDB(userId, masterPlan, "llm", configuredModel);
      return Response.json({ plan: masterPlan, source: "llm" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Master plan generation failed.";
      return Response.json({ error: msg }, { status: 500 });
    }
  }

  if (!apiKey) {
    const plan = buildFallbackPlan(body, profile);
    if (userId) void savePlanToDB(userId, plan, "fallback", null, body.request ?? null);
    return Response.json({ plan, source: "fallback", error: "Missing MISTRAL_API_KEY." });
  }

  try {
    const prompt = plannerPrompt(body, profile);
    const attempt1 = await callPlannerLLM(apiKey, prompt, configuredModel);

    let attempt = attempt1;
    if (
      !attempt1.response.ok &&
      (attempt1.response.status === 400 || attempt1.response.status === 404 || attempt1.response.status === 422) &&
      configuredModel !== "mistral-medium-latest"
    ) {
      attempt = await callPlannerLLM(apiKey, prompt, "mistral-medium-latest");
    }

    if (!attempt.response.ok) {
      const providerMessage =
        (attempt.json as any)?.error?.message ??
        (attempt.json as any)?.message ??
        (attempt.json as any)?.error ??
        attempt.rawText;
      const modelNote =
        attempt === attempt1 ? `model=${configuredModel}` : `model=${configuredModel} (retried mistral-medium-latest)`;
      throw new Error(
        `Planner request failed with ${attempt.response.status} (${modelNote}).${providerMessage ? ` ${String(providerMessage).slice(0, 300)}` : ""}`,
      );
    }

    const data = attempt.json as any;
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Planner response was empty.");
    }

    const plan = normalizePlan(extractJson(content));
    const usedModel = attempt === attempt1 ? configuredModel : "mistral-medium-latest";
    if (userId) await savePlanToDB(userId, plan, "llm", usedModel, body.request ?? null);
    return Response.json({ plan, source: "llm" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner generation failed.";
    const plan = buildFallbackPlan(body, profile);
    if (userId) void savePlanToDB(userId, plan, "fallback", null, body.request ?? null);
    return Response.json({ plan, source: "fallback", error: message }, { status: 200 });
  }
}
