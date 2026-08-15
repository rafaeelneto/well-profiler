import type { RuntimeEnvSource } from '../../utils/env';

type CleanupResult =
  | { ok: true; deleted: number }
  | { ok: false; error: string };

/** Runs on the daily cron trigger configured in wrangler.json + nuxt.config.ts's `scheduledTasks`. */
export default defineTask<CleanupResult>({
  meta: {
    name: 'shares:cleanup',
    description: 'Deletes well_shares rows past their expires_at.',
  },
  async run(event) {
    // `TaskEvent.context` is untyped (Nitro tasks are still experimental)
    const supabase = getSupabaseClient(event as unknown as RuntimeEnvSource);

    const { error, count } = await supabase
      .from('well_shares')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[shares:cleanup] failed:', error.message);
      return { result: { ok: false, error: error.message } };
    }

    return { result: { ok: true, deleted: count ?? 0 } };
  },
});
