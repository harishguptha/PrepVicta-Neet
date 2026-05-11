import { NextRequest, NextResponse } from "next/server";
import { logLearningEvent } from "@/lib/telemetry";

interface LogBody {
  eventName: string;
  eventSource: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LogBody;
    const eventName = body.eventName?.trim();
    const eventSource = body.eventSource?.trim();
    const userEmail = body.userEmail?.toLowerCase().trim();

    if (!eventName || !eventSource) {
      return NextResponse.json({ error: "eventName and eventSource are required." }, { status: 400 });
    }

    await logLearningEvent({
      eventName,
      eventSource,
      userEmail,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logs API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
