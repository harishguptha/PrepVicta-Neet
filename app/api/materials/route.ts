import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const backendUrl =
    process.env.AI_BACKEND_URL ??
    process.env.NEXT_PUBLIC_AI_BACKEND_URL ??
    "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${backendUrl}/materials/index`, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ categories: [] }, { status: 200 });
    }
    const payload = await response.json();
    return NextResponse.json({ categories: payload?.categories ?? [] });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
