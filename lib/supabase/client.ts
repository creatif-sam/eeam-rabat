import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { getBrowserSession, type BrowserSession } from "@/app/actions/session"

/**
 * Browser Supabase client.
 *
 * The session cookies are httpOnly, so the browser can't read them. Instead,
 * each request asks the server (once per token lifetime) for the current
 * short-lived access token. Queries then run as the logged-in user and RLS
 * applies; the refresh token never leaves the httpOnly cookie. Logged-out
 * visitors fall back to the public anon key.
 *
 * `supabase.auth.getUser()` keeps working through a small shim; other
 * `auth.*` calls must go through server actions.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Cached = { session: BrowserSession; until: number }
let cache: Cached | null = null
let inflight: Promise<Cached> | null = null
let client: SupabaseClient | null = null

async function currentSession(): Promise<BrowserSession> {
  // During server-side rendering there is no browser session to fetch
  if (typeof window === "undefined") return null
  if (cache && Date.now() < cache.until) return cache.session
  inflight ??= getBrowserSession()
    .catch(() => null)
    .then((session) => {
      // Refresh a minute before expiry; re-check logged-out state every minute
      // (capped at 5 min so a logout is picked up quickly)
      const until = session
        ? Math.min(session.expiresAt * 1000 - 60_000, Date.now() + 5 * 60_000)
        : Date.now() + 60_000
      cache = { session, until }
      inflight = null
      return cache
    })
  return (await inflight).session
}

/** Forget the cached token (e.g. after logging out or in). */
export function resetBrowserSession() {
  cache = null
}

const authShim = {
  async getUser() {
    const session = await currentSession()
    return session
      ? { data: { user: session.user }, error: null }
      : { data: { user: null }, error: { name: "AuthSessionMissingError", message: "Auth session missing!" } }
  },
}

export function createClient(): SupabaseClient {
  if (client) return client
  // supabase-js asks for a token while constructing (for Realtime, unused
  // here). Skip that call: pages create the client during render, where
  // server functions must not be invoked. Real queries fetch the token.
  let constructing = true
  const base = createSupabaseClient(URL, ANON_KEY, {
    // Returning null makes supabase-js use the anon key (logged-out visitors)
    accessToken: async () => (constructing ? null : (await currentSession())?.accessToken ?? null),
  })
  constructing = false
  client = new Proxy(base, {
    get(target, prop, receiver) {
      if (prop === "auth") return authShim
      return Reflect.get(target, prop, receiver)
    },
  }) as SupabaseClient
  return client
}
