import {
  ShieldCheck,
  Database,
  Users,
  Lock,
  Clock,
  UserCheck,
  HeartHandshake,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg">
          <ShieldCheck className="text-white" size={32} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Politique de confidentialité et de protection des données
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          L'Église Évangélique au Maroc (EEAM), paroisse de Rabat s'engage à protéger
          les informations personnelles confiées par ses membres,
          visiteurs et partenaires.
        </p>
      </div>

      {/* Registration Button */}
      <div className="text-center mb-8">
        <Link
          href="/#services"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={18} />
          Accéder aux formulaires d'inscription
        </Link>
      </div>

      {/* Content */}
      <section className="space-y-6">
        <PolicyItem
          icon={Database}
          title="Données collectées"
          text="Les informations collectées via nos formulaires peuvent inclure le nom, le prénom, les coordonnées, la date de naissance ainsi que toute information volontairement fournie."
        />

        <PolicyItem
          icon={Users}
          title="Utilisation des données"
          text="Les données sont utilisées exclusivement pour l’organisation des activités de l’église, la gestion des membres, la communication interne, l’accompagnement pastoral et les événements."
        />

        <PolicyItem
          icon={Lock}
          title="Confidentialité"
          text="Les données personnelles sont strictement confidentielles et ne sont ni vendues, ni partagées, ni cédées à des tiers sans consentement explicite, sauf obligation légale."
        />

        <PolicyItem
          icon={ShieldCheck}
          title="Sécurité des données"
          text="Des mesures de sécurité techniques et organisationnelles sont mises en place afin de protéger les données contre tout accès non autorisé, toute perte ou toute divulgation."
        />

        <PolicyItem
          icon={Clock}
          title="Durée de conservation"
          text="Les données sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément aux besoins de l’église."
        />

        <PolicyItem
          icon={UserCheck}
          title="Droits des personnes"
          text="Chaque personne dispose d’un droit d’accès, de rectification et de suppression de ses données personnelles, en contactant l’administration de l’église."
        />

        <PolicyItem
          icon={HeartHandshake}
          title="Engagement de l’église"
          text="L’église s’engage à traiter toutes les données avec respect, responsabilité et transparence, dans un esprit de confiance et de bienveillance."
        />
      </section>
    </div>
  );
}

/* Sub component */

function PolicyItem({
  icon: Icon,
  title,
  text
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 p-6 bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
          <Icon className="text-cyan-600" size={22} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {title}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
