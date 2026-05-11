import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type Role = "student" | "elite" | "admin";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginBody = await req.json();
    const email = body.email?.toLowerCase().trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const result = await query(
      `SELECT u.id, u.email, u.name, u.role,
              (sp.id IS NOT NULL) AS is_onboarded
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.email = $1 AND u.password_hash = $2`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const row = result.rows[0] as { id: string; email: string; name: string; role: Role; is_onboarded: boolean };
    const { is_onboarded, ...user } = row;
    return NextResponse.json({ user, is_onboarded });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
