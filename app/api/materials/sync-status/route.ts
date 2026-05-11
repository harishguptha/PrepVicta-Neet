import { NextRequest, NextResponse } from "next/server";
import { getSyncState, logLearningEvent, upsertSyncState } from "@/lib/telemetry";

const SYNC_KEY = "neet-2026-materials";

interface SyncStatusBody {
  synced: boolean;
  filesIndexed?: number;
  chunksIndexed?: number;
  userEmail?: string;
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    const row = await getSyncState(SYNC_KEY);
    return NextResponse.json({
      syncKey: SYNC_KEY,
      synced: Boolean(row?.synced),
      filesIndexed: Number(row?.files_indexed ?? 0),
      chunksIndexed: Number(row?.chunks_indexed ?? 0),
      syncedByEmail: row?.synced_by_email ?? null,
      syncedAt: row?.synced_at ?? null,
      userEmail: userEmail ?? null,
    });
  } catch (err) {
    console.error("Sync status GET API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SyncStatusBody;
    const synced = Boolean(body.synced);
    const filesIndexed = Number(body.filesIndexed ?? 0);
    const chunksIndexed = Number(body.chunksIndexed ?? 0);
    const userEmail = body.userEmail?.toLowerCase().trim();

    await upsertSyncState({
      syncKey: SYNC_KEY,
      synced,
      filesIndexed,
      chunksIndexed,
      syncedByEmail: userEmail,
    });

    await logLearningEvent({
      eventName: synced ? "materials_sync_success" : "materials_sync_update",
      eventSource: "guided_syllabus_board",
      userEmail,
      metadata: {
        syncKey: SYNC_KEY,
        filesIndexed,
        chunksIndexed,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sync status POST API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
