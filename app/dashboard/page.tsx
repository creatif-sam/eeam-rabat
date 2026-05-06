import { Calendar, ChevronRight, Clock, MapPin, Play, Users, HandHeart, ClipboardList, FileText, UserCheck, HeartHandshake, Settings, UserCog, Activity, ShieldCheck } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import WelcomeMessageEditor from "@/components/WelcomeMessageEditor"
import Link from "next/link"

const ADMIN_ROLES = ["admin", "pastor"]

export default async function DashboardHome() {
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

  // Fetch stats in parallel
  const [
    { count: totalMembers },
    { count: totalCommissions },
    { count: pendingLeaderRequests },
    { count: totalPrayerRequests },
    { count: pendingCounsellingRequests },
    { count: pendingGroupRequests },
    { count: pendingVolunteerRequests },
    { count: pendingApprovals },
  ] = await Promise.all([
    supabase.from("member_registrations").select("*", { count: "exact", head: true }),
    supabase.from("groupes_commissions").select("*", { count: "exact", head: true }),
    supabase.from("commission_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("pastoral_counselling").select("*", { count: "exact", head: true }),
    supabase.from("group_join_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("volunteer_requests").select("*", { count: "exact", head: true }).eq("processed", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("approved", false),
  ])

  // Fetch formations data
  const { data: formations } = await supabase
    .from("formations")
    .select("*")
    .eq("statut", "en_cours")
    .order("date_debut", { ascending: true })
    .limit(2)

  // Create featured content from formations data
  const featuredContent = formations?.map(formation => ({
    title: formation.titre,
    description: formation.description,
    image: formation.couleur ? 
      `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80` : // Default image for formations
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    duration: `${formation.sessions_total} sessions`,
    type: "Formation",
    color: formation.couleur || "from-purple-600 to-blue-600",
    id: formation.id,
    statut: formation.statut,
    niveau: formation.niveau
  })) || []

  // Fetch the first upcoming event
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gt("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(1)

  const upcomingEvent = events && events.length > 0 ? events[0] : null;

  return (
    <>
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            {isAdmin && <WelcomeMessageEditor />}
          </div>
          <p className="text-cyan-100 font-medium mb-2 text-sm md:text-base">
            Bon retour parmi nous{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            {isAdmin ? "Espace Administration" : "Espace Membre"}
          </h1>
          <p className="text-cyan-50 text-base md:text-lg max-w-2xl">
            {isAdmin
              ? "Gestion et supervision de l'église — Tableau de bord des leaders"
              : "Bienvenue dans votre espace personnel. Accédez à vos activités et ressources."}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* Pending Approvals Alert for Admin */}
          {(pendingApprovals ?? 0) > 0 && (
            <Link
              href="/dashboard/users"
              className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all mt-6"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm md:text-base">
                  {pendingApprovals} compte{(pendingApprovals ?? 0) > 1 ? "s" : ""} en attente d'approbation
                </p>
                <p className="text-amber-700 dark:text-amber-400 text-xs md:text-sm">Cliquez pour approuver ou rejeter ces comptes</p>
              </div>
              <ChevronRight size={18} className="text-amber-500 shrink-0" />
            </Link>
          )}

          {/* Admin Overview Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {[
              { label: "Membres inscrits", value: totalMembers ?? 0, icon: Users, color: "from-cyan-500 to-blue-600", href: "/dashboard/membres" },
              { label: "Commissions", value: totalCommissions ?? 0, icon: UserCheck, color: "from-violet-500 to-purple-600", href: "/dashboard/groupes" },
              { label: "Requêtes responsables", value: pendingLeaderRequests ?? 0, icon: FileText, color: "from-orange-500 to-amber-600", href: "/dashboard/formulaires" },
              { label: "Sujets de prière", value: totalPrayerRequests ?? 0, icon: HandHeart, color: "from-rose-500 to-pink-600", href: "/dashboard/formulaires" },
              { label: "Entretiens pastoraux", value: pendingCounsellingRequests ?? 0, icon: ClipboardList, color: "from-teal-500 to-emerald-600", href: "/dashboard/formulaires" },
              { label: "Rejoindre commission", value: pendingGroupRequests ?? 0, icon: Users, color: "from-indigo-500 to-blue-700", href: "/dashboard/formulaires" },
              { label: "Bénévoles en attente", value: pendingVolunteerRequests ?? 0, icon: HeartHandshake, color: "from-green-500 to-lime-600", href: "/dashboard/formulaires" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <a key={stat.label} href={stat.href} className="group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{stat.label}</p>
                </a>
              )
            })}
          </div>

          {/* Admin Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Gérer les utilisateurs", icon: UserCog, href: "/dashboard/users", color: "from-rose-500 to-pink-600" },
                { label: "Journal d'activité", icon: Activity, href: "/dashboard/logs", color: "from-violet-500 to-purple-600" },
                { label: "Paramètres", icon: Settings, href: "/dashboard/settings", color: "from-slate-500 to-gray-600" },
                { label: "Membres", icon: Users, href: "/dashboard/membres", color: "from-cyan-500 to-blue-600" },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href} className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Formations */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Formations en cours</h2>
              <Link href="/dashboard/formations" className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2 text-sm md:text-base">
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredContent.length > 0 ? featuredContent.map((card, i) => (
                <Link key={card.id || i} href="/dashboard/formations" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block">
                  <div className="relative h-48 overflow-hidden">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${i < 2 ? "from-red-600 to-rose-600" : card.color} opacity-60`} />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-semibold text-gray-800">{card.type}</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-1 group-hover:text-cyan-600">{card.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2">{card.description}</p>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock size={13} /> {card.duration}</span>
                  </div>
                </Link>
              )) : (
                <div className="col-span-2 text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <Calendar size={24} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune formation active</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Member View */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Événements", desc: "Voir les prochains événements", icon: Calendar, href: "/dashboard/events", color: "from-rose-500 to-pink-600" },
              { label: "Formulaires", desc: "Soumettre une demande", icon: ClipboardList, href: "/dashboard/formulaires", color: "from-teal-500 to-emerald-600" },
              { label: "Rapports", desc: "Consulter les rapports", icon: FileText, href: "/dashboard/rapports", color: "from-violet-500 to-purple-600" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.label} href={item.href} className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 ml-auto shrink-0" />
                </Link>
              )
            })}
          </div>

          {/* Upcoming Event for members */}
          <div className="mt-6 relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 md:p-8 border border-rose-100 dark:border-rose-800 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shrink-0">
                <Calendar size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-full text-xs font-semibold mb-2">Prochain événement</span>
                {upcomingEvent ? (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">{upcomingEvent.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 mb-3 text-sm">
                      <span className="flex items-center gap-1"><Clock size={13} className="text-rose-500" /> {upcomingEvent.start_time} - {upcomingEvent.end_time}</span>
                      <span className="flex items-center gap-1"><MapPin size={13} className="text-rose-500" /> {upcomingEvent.location}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                      {new Date(upcomingEvent.event_date).toLocaleString("fr-FR", { month: "long", year: "numeric", day: "numeric", weekday: "long" })}
                    </p>
                    <Link href="/dashboard/events" className="inline-block px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow hover:from-rose-600 hover:to-pink-700 transition-all text-sm">
                      Voir tous les événements
                    </Link>
                  </>
                ) : (
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucun événement à venir</h3>
                )}
              </div>
            </div>
          </div>

          {/* Formations for members */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Formations disponibles</h2>
              <Link href="/dashboard/formations" className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 text-sm">Voir tout <ChevronRight size={15} /></Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredContent.length > 0 ? featuredContent.map((card, i) => (
                <Link key={card.id || i} href="/dashboard/formations" className="group flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${i === 0 ? "from-red-500 to-rose-600" : "from-purple-500 to-violet-600"} flex items-center justify-center shadow shrink-0`}>
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate group-hover:text-cyan-600">{card.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.duration}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </Link>
              )) : (
                <div className="col-span-2 text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-500 text-sm">
                  Aucune formation active
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
