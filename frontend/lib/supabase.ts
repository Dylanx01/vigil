import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Realtime scores ───────────────────────────────────

export function subscribeToScores(
  callback: (payload: any) => void
) {
  return supabase
    .channel("scores_risque")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "scores_risque" },
      callback
    )
    .subscribe()
}

// ─── Realtime signalements ─────────────────────────────

export function subscribeToSignalements(
  callback: (payload: any) => void
) {
  return supabase
    .channel("signalements")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "signalements" },
      callback
    )
    .subscribe()
}