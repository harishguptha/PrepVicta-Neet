import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT
         sp.attempt_year,
         sp.stage,
         sp.confidence,
         sp.study_streak_days,
         sp.planner_adherence,
         sp.syllabus_completed,
         sp.syllabus_total,
         sp.target_score,
         sp.estimated_score_low,
         sp.estimated_score_high,
         sp.revision_percent,
         CASE
           WHEN make_date(sp.attempt_year, 5, 1) < CURRENT_DATE
           THEN make_date(sp.attempt_year + 1, 5, 1)
           ELSE make_date(sp.attempt_year, 5, 1)
         END AS exam_date,
         GREATEST(0,
           CASE
             WHEN make_date(sp.attempt_year, 5, 1) < CURRENT_DATE
             THEN make_date(sp.attempt_year + 1, 5, 1) - CURRENT_DATE
             ELSE make_date(sp.attempt_year, 5, 1) - CURRENT_DATE
           END
         ) AS days_to_exam,
         CASE
           WHEN make_date(sp.attempt_year, 5, 1) < CURRENT_DATE
           THEN sp.attempt_year + 1
           ELSE sp.attempt_year
         END AS exam_year
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE u.email = $1
       LIMIT 1`,
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const row = result.rows[0] as {
      attempt_year: number;
      stage: string;
      confidence: string;
      study_streak_days: number;
      planner_adherence: number;
      syllabus_completed: number;
      syllabus_total: number;
      target_score: number;
      estimated_score_low: number;
      estimated_score_high: number;
      revision_percent: number;
      exam_date: string;
      days_to_exam: number;
      exam_year: number;
    };

    // Count pending tasks for today
    let pendingTasksToday = 0;
    try {
      const taskRes = await query(
        `SELECT COUNT(*) AS cnt
         FROM planner_tasks pt
         JOIN users u ON u.id = pt.user_id
         WHERE u.email = $1
           AND pt.plan_date = CURRENT_DATE
           AND pt.is_done = false`,
        [email],
      );
      pendingTasksToday = parseInt(taskRes.rows[0]?.cnt ?? "0", 10);
    } catch {
      // table may not exist yet; fall through
    }

    // Format exam date as "1 May 2027"
    const examDateObj = new Date(row.exam_date);
    const examDateFormatted = examDateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return NextResponse.json({
      attemptYear: row.attempt_year,
      examYear: row.exam_year,
      examDate: examDateFormatted,
      daysToExam: Number(row.days_to_exam),
      stage: row.stage,
      confidence: row.confidence,
      studyStreakDays: row.study_streak_days,
      plannerAdherence: row.planner_adherence,
      syllabusCompleted: row.syllabus_completed,
      syllabusTotal: row.syllabus_total,
      targetScore: row.target_score,
      estimatedScoreLow: row.estimated_score_low,
      estimatedScoreHigh: row.estimated_score_high,
      revisionPercent: row.revision_percent,
      pendingTasksToday,
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
