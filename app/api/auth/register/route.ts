import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterBody = await req.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role::text`,
      [email, password, name]
    );

    const user = result.rows[0] as { id: string; email: string; name: string; role: string };
    return NextResponse.json({ user, is_onboarded: false }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Register API error:", message);
    return NextResponse.json({ error: "Internal server error.", detail: message }, { status: 500 });
  }
}
