import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { POST as generatePlan } from "@/app/api/planner/route";

interface OnboardingPayload {
  email: string;
  fullName: string;
  stage: string;
  attemptYear: number;
  dailyStudyHours: string;
  strongestSubject: string;
  weakestSubject: string;
  confidence: string;
  preferredTimes: string[];
}

function studyHoursToNumber(value: string): number | null {
  if (value === "1-2 hrs") return 1.5;
  if (value === "2-4 hrs") return 3;
  if (value === "4-6 hrs") return 5;
  if (value === "6+ hrs") return 6;
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function confidenceToNumber(value: string): number | null {
  if (value === "Low") return 1;
  if (value === "Medium") return 2;
  if (value === "High") return 3;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function POST(req: NextRequest) {
  try {
    const body: OnboardingPayload = await req.json();

    const {
      email,
      fullName,
      stage,
      attemptYear,
      dailyStudyHours,
      strongestSubject,
      weakestSubject,
      confidence,
      preferredTimes,
    } = body;

    if (!email || !fullName || !stage || !attemptYear) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const userResult = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;
    const dailyStudyHoursValue = studyHoursToNumber(dailyStudyHours);
    const confidenceValue = confidenceToNumber(confidence);

    await query(
      `UPDATE users SET name = $1 WHERE id = $2`,
      [fullName, userId]
    );

    await query(
      `WITH updated AS (
        UPDATE student_profiles
        SET stage = $2,
            attempt_year = $3,
            daily_study_hours = $4,
            strongest_subject = $5,
            weakest_subject = $6,
            confidence = $7,
            preferred_times = $8,
            metadata = metadata || $9::jsonb,
            onboarding_completed_at = COALESCE(onboarding_completed_at, NOW()),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING id
      )
      INSERT INTO student_profiles (
        user_id, stage, attempt_year,
        daily_study_hours,
        strongest_subject, weakest_subject, confidence, preferred_times,
        onboarding_completed_at, metadata
      )
      SELECT $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM updated)`,
      [
        userId,
        stage,
        attemptYear,
        dailyStudyHoursValue,
        strongestSubject,
        weakestSubject,
        confidenceValue,
        preferredTimes,
        JSON.stringify({
          daily_study_hours_label: dailyStudyHours,
          confidence_label: confidence,
        }),
      ]
    );

    // Generate and persist both plans in parallel. Non-critical — onboarding succeeds even if these fail.
    try {
      const makeReq = (body: object) =>
        new Request("http://localhost/api/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

      await Promise.all([
        // 365-day master plan (stored against exam date)
        generatePlan(makeReq({ user: { id: userId, email, name: fullName }, type: "master" })),
        // Today's daily plan (stored against CURRENT_DATE)
        generatePlan(makeReq({ user: { id: userId, email, name: fullName } })),
      ]);
    } catch (planErr) {
      console.error("Onboarding plan generation failed:", planErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
