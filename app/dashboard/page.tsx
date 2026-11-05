import { createSupabaseServerClient } from "@/lib/supabase/server"
import DashboardHome from "@/components/dashboard/home/DashboardHome"

const ADMIN_ROLES = ["admin", "pastor"]

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, role, full_name")
    .eq("id", user?.id)
    .maybeSingle()

  const role = (profile?.role ?? "").trim().toLowerCase()
  const isAdmin = ADMIN_ROLES.includes(role)

  // Fetch stats, formations and next event in parallel
  const [
    { count: totalMembers },
    { count: totalCommissions },
    { count: pendingLeaderRequests },
    { count: totalPrayerRequests },
    { count: pendingCounsellingRequests },
    { count: pendingGroupRequests },
    { count: pendingVolunteerRequests },
    { count: pendingApprovals },
    { data: formations },
    { data: events },
  ] = await Promise.all([
    supabase.from("member_registrations").select("*", { count: "exact", head: true }),
    supabase.from("groupes_commissions").select("*", { count: "exact", head: true }),
    supabase.from("commission_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("pastoral_counselling").select("*", { count: "exact", head: true }),
    supabase.from("group_join_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("volunteer_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase
      .from("formations")
      .select("*")
      .eq("statut", "en_cours")
      .order("date_debut", { ascending: true })
      .limit(2),
    supabase
      .from("events")
      .select("*")
      .gt("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(1),
  ])

  const homeFormations = (formations ?? []).map((formation, i) => ({
    id: String(formation.id ?? i),
    title: formation.titre,
    description: formation.description ?? null,
    image: formation.couleur
      ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
      : "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    duration: `${formation.sessions_total} sessions`,
  }))

  const next = events?.[0]
  const upcomingEvent = next
    ? {
        title: next.title,
        start_time: next.start_time ?? null,
        end_time: next.end_time ?? null,
        location: next.location ?? null,
        event_date: next.event_date,
      }
    : null

  return (
    <DashboardHome
      isAdmin={isAdmin}
      firstName={profile?.full_name ? profile.full_name.split(" ")[0] : null}
      stats={{
        totalMembers: totalMembers ?? 0,
        totalCommissions: totalCommissions ?? 0,
        pendingLeaderRequests: pendingLeaderRequests ?? 0,
        totalPrayerRequests: totalPrayerRequests ?? 0,
        pendingCounsellingRequests: pendingCounsellingRequests ?? 0,
        pendingGroupRequests: pendingGroupRequests ?? 0,
        pendingVolunteerRequests: pendingVolunteerRequests ?? 0,
        pendingApprovals: pendingApprovals ?? 0,
      }}
      formations={homeFormations}
      upcomingEvent={upcomingEvent}
    />
  )
}
