import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RuntimeEnvSource } from './env';

export function getSupabaseClient(event: RuntimeEnvSource): SupabaseClient {
  const url = getRuntimeEnv(event, 'SUPABASE_URL')!;
  const key = getRuntimeEnv(event, 'SUPABASE_SECRET_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}
