-- Run manually SQL editor (or CLI). Not executed by any build/deploy step.

-- Shares expire 30 days after creation (matches SHARE_TTL_DAYS in
-- server/utils/shareConfig.ts). `shares:cleanup` (server/tasks/shares/cleanup.ts,
-- run on a daily Cloudflare Cron Trigger) deletes rows past this timestamp;
-- GET /api/share/[id] also filters on it so expired-but-not-yet-purged rows
-- 404 immediately.
create table if not exists well_shares (
  id text primary key,
  well_json text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists well_shares_expires_at_idx on well_shares (expires_at);
alter table well_shares enable row level security;
