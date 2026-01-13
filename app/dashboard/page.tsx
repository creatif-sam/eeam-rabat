import { Calendar, ChevronRight, Clock, MapPin, Play, Settings, Edit } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import WelcomeMessageEditor from "@/components/WelcomeMessageEditor"

export default async function DashboardHome() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user?.id)
    .maybeSingle()

  const hasAvatar = profile?.avatar_url

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

  return (
    <>
      {/* Alert placeholder - only show if no avatar */}
      {!hasAvatar && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 mb-1 text-sm md:text-base">
                Photo de profil manquante
              </h3>
              <p className="text-amber-800 mb-3 text-sm md:text-base">
                Ajoute une photo pour personnaliser ton expérience
              </p>
              <a href="/dashboard/profile" className="px-4 py-2 md:px-5 md:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium inline-block text-sm md:text-base">
                Télécharger maintenant
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <WelcomeMessageEditor />
          </div>
          <p className="text-cyan-100 font-medium mb-2 text-sm md:text-base">
            Bon retour parmi nous
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            Espace Leadership
          </h1>
          <p className="text-cyan-50 text-base md:text-lg max-w-2xl">
            Gestion et supervision de l'église. Tableau de bord des leaders
          </p>
        </div>
      </div>

      {/* Featured Content */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Formations Leadership
          </h2>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2 justify-center sm:justify-start text-sm md:text-base">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredContent.length > 0 ? featuredContent.map((card, i) => (
            <a
              key={card.id || i}
              href="/dashboard/formations"
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-60`} />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-semibold text-gray-800">
                    {card.type}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                    <Play size={24} className="text-cyan-600 ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base line-clamp-2">
                  {card.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> {card.duration}
                  </span>
                  <span className="text-cyan-600 font-semibold flex items-center gap-1 text-sm md:text-base">
                    Voir détails <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </a>
          )) : (
            <div className="col-span-2 text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune formation active</h3>
              <p className="text-gray-500">Les formations disponibles apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Event */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 md:p-8 border border-rose-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Calendar size={24} className="text-white md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold mb-2">
              Prochain événement
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Cours de Discipulat avec Jonathan Santos
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 md:gap-4 text-gray-600 mb-3 md:mb-4">
              <span className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-rose-500" />
                <span className="font-medium">
                  Dans 5 jours, 21h
                </span>
              </span>
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-rose-500" />
                <span>En visioconférence</span>
              </span>
            </div>
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              Janvier 2026 à 20h. Jeudi
            </p>
            <button className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-rose-600 hover:to-pink-700 transition-all text-sm md:text-base">
              S'inscrire maintenant
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
