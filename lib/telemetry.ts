import { query } from "@/lib/db";

export async function ensureTelemetryTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS material_sync_state (
      id SERIAL PRIMARY KEY,
      sync_key VARCHAR(120) UNIQUE NOT NULL,
      synced BOOLEAN NOT NULL DEFAULT FALSE,
      files_indexed INT DEFAULT 0,
      chunks_indexed INT DEFAULT 0,
      synced_by_email VARCHAR(255),
      synced_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS learning_event_logs (
      id SERIAL PRIMARY KEY,
      event_name VARCHAR(120) NOT NULL,
      event_source VARCHAR(120) NOT NULL,
      user_email VARCHAR(255),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function logLearningEvent(params: {
  eventName: string;
  eventSource: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  await ensureTelemetryTables();
  await query(
    `INSERT INTO learning_event_logs (event_name, event_source, user_email, metadata)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [
      params.eventName,
      params.eventSource,
      params.userEmail ?? null,
      JSON.stringify(params.metadata ?? {}),
    ]
  );
}

export async function getSyncState(syncKey: string) {
  await ensureTelemetryTables();
  const result = await query(
    `SELECT sync_key, synced, files_indexed, chunks_indexed, synced_by_email, synced_at
     FROM material_sync_state
     WHERE sync_key = $1
     LIMIT 1`,
    [syncKey]
  );
  return result.rows[0] ?? null;
}

export async function upsertSyncState(params: {
  syncKey: string;
  synced: boolean;
  filesIndexed: number;
  chunksIndexed: number;
  syncedByEmail?: string;
}) {
  await ensureTelemetryTables();
  await query(
    `INSERT INTO material_sync_state (sync_key, synced, files_indexed, chunks_indexed, synced_by_email, synced_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CASE WHEN $2 THEN NOW() ELSE NULL END, NOW())
     ON CONFLICT (sync_key)
     DO UPDATE SET
       synced = EXCLUDED.synced,
       files_indexed = EXCLUDED.files_indexed,
       chunks_indexed = EXCLUDED.chunks_indexed,
       synced_by_email = EXCLUDED.synced_by_email,
       synced_at = CASE WHEN EXCLUDED.synced THEN NOW() ELSE material_sync_state.synced_at END,
       updated_at = NOW()`,
    [
      params.syncKey,
      params.synced,
      params.filesIndexed,
      params.chunksIndexed,
      params.syncedByEmail ?? null,
    ]
  );
}
