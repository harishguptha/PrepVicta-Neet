import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get("path") ?? "";
  if (!relativePath) {
    return NextResponse.json({ error: "Missing file path." }, { status: 400 });
  }

  const backendUrl =
    process.env.AI_BACKEND_URL ??
    process.env.NEXT_PUBLIC_AI_BACKEND_URL ??
    "http://127.0.0.1:8000";
  const target = `${backendUrl}/materials/download?path=${encodeURIComponent(relativePath)}`;

  return NextResponse.redirect(target);
}
