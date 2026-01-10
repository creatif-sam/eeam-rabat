import { Calendar, ChevronRight, Clock, MapPin, Play } from "lucide-react"

const featuredContent = [
  {
    title: "Formation Leadership",
    description: "Développer les compétences de direction",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    duration: "6 sessions",
    type: "Formation",
    color: "from-purple-600 to-blue-600"
  },
  {
    title: "Gestion d'équipe",
    description: "Principes de management spirituel",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    duration: "4 modules",
    type: "Formation",
    color: "from-rose-600 to-orange-600"
  }
]

export default function DashboardHome() {
  return (
    <>
      {/* Alert placeholder */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Photo de profil manquante
            </h3>
            <p className="text-amber-800 mb-3">
              Ajoute une photo pour personnaliser ton expérience
            </p>
            <button className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium">
              Télécharger maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <p className="text-cyan-100 font-medium mb-2">
            Bon retour parmi nous
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            Espace Leadership
          </h1>
          <p className="text-cyan-50 text-lg max-w-2xl">
            Gestion et supervision de l'église. Tableau de bord des leaders
          </p>
        </div>
      </div>

      {/* Featured Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Formations Leadership
          </h2>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredContent.map((card, i) => (
            <div
              key={i}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> {card.duration}
                  </span>
                  <button className="text-cyan-600 font-semibold flex items-center gap-1">
                    Commencer <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Event */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Calendar size={32} className="text-white" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold mb-2">
              Prochain événement
            </span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Cours de Discipulat avec Jonathan Santos
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-rose-500" />
                <span className="font-medium">
                  Dans 5 jours, 21h
                </span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-rose-500" />
                <span>En visioconférence</span>
              </span>
            </div>
            <p className="text-gray-700 mb-4">
              Janvier 2026 à 20h. Jeudi
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg">
              S'inscrire maintenant
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
