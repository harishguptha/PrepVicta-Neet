import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type Role = "student" | "elite" | "admin";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const result = await query(
      `SELECT id, email, name, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const user = result.rows[0] as { id: string; email: string; name: string; role: Role };
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Get user API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
