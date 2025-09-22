import { Client } from "pg"

let client: Client | null = null

export async function getDb(): Promise<Client> {
  if (client) return client
  const url = process.env.DATABASE_URL ?? "postgres://nextpace:nextpace@localhost:5432/nextpace"
  client = new Client({ connectionString: url })
  await client.connect()
  await ensureSchema(client)
  return client
}

async function ensureSchema(c: Client) {
  await c.query(`
    create table if not exists activities (
      id bigserial primary key,
      provider text not null,
      provider_activity_id text not null,
      garmin_user_id text not null,
      activity_type text not null,
      start_time_seconds integer not null,
      start_time_offset_seconds integer not null,
      duration_seconds integer not null,
      distance_meters double precision not null,
      active_kilocalories integer not null,
      device_name text,
      raw_payload jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(provider, provider_activity_id)
    );
  `)
}


