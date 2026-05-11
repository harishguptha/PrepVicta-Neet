export type PlannerPriority = "must" | "should" | "could";

export interface PlannerStep {
  title: string;
  meta: string;
}

export interface PlannerTrend {
  label: string;
  score: number;
}

export interface PlannerMetric {
  label: string;
  value: string;
  note: string;
  progress: number;
}

export interface PlannerTask {
  priority: PlannerPriority;
  subject: string;
  title: string;
  duration: string;
  why: string;
  unlock: string;
  skipCost: string;
  value: string;
  actionLabel: string;
  done?: boolean;
}

export interface PlannerPlan {
  dateLine: string;
  progressLabel: string;
  progressPercent: number;
  progressCount: string;
  winPathLabel: string;
  verdict: string;
  consequence: string;
  steps: PlannerStep[];
  primaryAction: string;
  totalTime: string;
  shortSessionAction: string;
  score: {
    current: number;
    delta: string;
    targetText: string;
    targetScore: number;
    progressPercent: number;
    trend: PlannerTrend[];
  };
  risk: {
    title: string;
    text: string;
  };
  quickWin: {
    title: string;
    text: string;
  };
  metrics: PlannerMetric[];
  progressNudge: {
    text: string;
    cta: string;
  };
  agentChips: string[];
  tasks: PlannerTask[];
}

export const fallbackPlannerPlan: PlannerPlan = {
  dateLine: "Backup NEET plan for today",
  progressLabel: "Progress",
  progressPercent: 33,
  progressCount: "1/3",
  winPathLabel: "Today's Score Path",
  verdict: "Finish one scoring Physics block, one NCERT Biology recall block, and one Chemistry retention block.",
  consequence: "Skipping this leaves easy marks exposed in formulas, NCERT facts, and repeated mock errors.",
  steps: [
    { title: "Physics error recovery", meta: "45 min - solve only missed-pattern numericals" },
    { title: "Biology NCERT recall", meta: "25 min - active recall from marked lines" },
    { title: "Chemistry formula lock", meta: "20 min - reactions, exceptions, and quick test" },
  ],
  primaryAction: "Start first scoring block",
  totalTime: "~90 min total",
  shortSessionAction: "Only 15 min? Do Biology NCERT recall",
  score: {
    current: 565,
    delta: "+35 marks trend from recent practice",
    targetText: "Next target: protect 70 recoverable marks",
    targetScore: 635,
    progressPercent: 72,
    trend: [
      { label: "M1", score: 420 },
      { label: "M2", score: 450 },
      { label: "M3", score: 490 },
      { label: "M4", score: 530 },
      { label: "M5", score: 565 },
    ],
  },
  risk: {
    title: "Highest risk today",
    text: "Unreviewed mistakes are more dangerous than new chapters. Clear the last mock's repeated error types first.",
  },
  quickWin: {
    title: "Fastest useful start",
    text: "Write 10 formulas or NCERT facts from memory, then check gaps immediately.",
  },
  metrics: [
    { label: "Syllabus done", value: "65%", note: "63 / 97 chapters", progress: 65 },
    { label: "Planner adherence", value: "90%", note: "27 of 30 days", progress: 90 },
  ],
  progressNudge: {
    text: "Keep today's plan small enough to finish. Completion matters more than adding a fourth task.",
    cta: "View progress",
  },
  agentChips: ["I missed 3 days", "High-scoring chapters first", "I am weak in Physics", "Lighter day today"],
  tasks: [
    {
      priority: "must",
      subject: "Physics",
      title: "Current Electricity: circuit error drill",
      duration: "45 min",
      why: "Circuit numericals give quick score recovery when error patterns are fixed.",
      unlock: "Unlocks: 12-question timed circuit set",
      skipCost: "~10-14 marks remain at risk",
      value: "Highest scoring repair task",
      actionLabel: "Start Task",
    },
    {
      priority: "should",
      subject: "Biology",
      title: "Human Physiology: NCERT active recall",
      duration: "25 min",
      why: "Biology marks are protected by exact NCERT recall, not passive rereading.",
      unlock: "Unlocks: 20-line rapid recall check",
      skipCost: "Easy factual marks can slip",
      value: "High accuracy retention block",
      actionLabel: "Start Revision",
    },
    {
      priority: "could",
      subject: "Chemistry",
      title: "Chemical Kinetics: formula and graph check",
      duration: "20 min",
      why: "Short Chemistry review prevents formula confusion in timed tests.",
      unlock: "Unlocks: 8-question formula sprint",
      skipCost: "Formula mix-ups continue",
      value: "Good finishing task",
      actionLabel: "Start Task",
    },
  ],
};
