"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Activity,
  Phone,
  Mail,
  Plus,
  Download,
  ChevronRight,
  FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function J5AnnexeTab() {
  const supabase = createClient();

  const [selectedView, setSelectedView] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [annexInfo, setAnnexInfo] = useState<any>(null);
  const [annexStats, setAnnexStats] = useState<any>({
    members: 0,
    attendance: 0,
    growth: 0,
    events: 0,
    revenue: 0,
    leaders: 0
  });

  const [leaders, setLeaders] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      const { data: config } = await supabase
        .from("j5_annexe_config")
        .select("*")
        .single();

      const { count: members } = await supabase
        .from("member_registrations")
        .select("*", { count: "exact", head: true })
        .eq("paroisse", "J5");

      const { data: lastStats } = await supabase
        .from("j5_monthly_stats")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1)
        .single();

      const { data: monthly } = await supabase
        .from("j5_monthly_stats")
        .select("*")
        .order("year")
        .order("month");

      const { data: leadersData } = await supabase
        .from("groups")
        .select("*")
        .eq("category", "leadership")
        .eq("active", true);

      const { data: groupsData } = await supabase
        .from("groups")
        .select("*")
        .neq("category", "leadership")
        .eq("active", true);

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .ilike("location", "%J5%")
        .order("event_date");

      const { data: reportsData } = await supabase
        .from("j5_reports")
        .select("*")
        .order("report_date", { ascending: false });

      const { data: revenueRows } = await supabase
        .from("transactions_financieres")
        .select("montant");

      const revenue =
        revenueRows?.reduce((s, r) => s + Number(r.montant), 0) || 0;

      setAnnexInfo(config);
      setMonthlyStats(monthly || []);
      setLeaders(leadersData || []);
      setGroups(groupsData || []);
      setEvents(eventsData || []);
      setReports(reportsData || []);

      setAnnexStats({
        members: members || 0,
        attendance: lastStats?.attendance || 0,
        growth: lastStats?.growth || 0,
        events: eventsData?.length || 0,
        revenue,
        leaders: leadersData?.length || 0
      });

      setLoading(false);
    };

    loadAll();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-600">Chargement...</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#b92b39" }}
          >
            <Building2 size={24} className="sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {annexInfo?.full_name || "Annexe J5"}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">{annexInfo?.location}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base">
            <Download size={18} />
            Exporter
          </button>
          <button
            className="px-4 py-2 text-white rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
            style={{ backgroundColor: "#b92b39" }}
          >
            <Plus size={18} />
            Ajouter activité
          </button>
        </div>
      </div>

      {/* View selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="sm:hidden">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm w-full"
          >
            <option value="overview">Vue d'ensemble</option>
            <option value="members">Membres</option>
            <option value="events">Événements</option>
            <option value="reports">Rapports</option>
          </select>
        </div>
        <div className="hidden sm:flex gap-2 bg-white p-1 rounded-xl w-fit">
        {["overview", "members", "events", "reports"].map(v => (
          <button
            key={v}
            onClick={() => setSelectedView(v)}
            className={`px-6 py-2 rounded-lg ${
              selectedView === v
                ? "text-white"
                : "text-gray-600"
            }`}
            style={{
              backgroundColor:
                selectedView === v ? "#b92b39" : "transparent"
            }}
          >
            {v === "overview"
              ? "Vue d’ensemble"
              : v === "members"
              ? "Membres"
              : v === "events"
              ? "Événements"
              : "Rapports"}
          </button>
        ))}
      </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Stat icon={Users} label="Membres" value={annexStats.members} />
        <Stat icon={Activity} label="Assiduité" value={`${annexStats.attendance}%`} />
        <Stat icon={TrendingUp} label="Croissance" value={`+${annexStats.growth}`} />
        <Stat icon={Calendar} label="Événements" value={annexStats.events} />
        <Stat
          icon={DollarSign}
          label="Revenus"
          value={`${(annexStats.revenue / 1000).toFixed(0)}K`}
        />
        <Stat icon={Users} label="Leaders" value={annexStats.leaders} />
      </div>

      {selectedView === "overview" && (
        <>
          {/* Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Informations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InfoRow icon={MapPin} label="Adresse" value={annexInfo?.address} />
              <InfoRow icon={Phone} label="Téléphone" value={annexInfo?.phone} />
              <InfoRow icon={Mail} label="Email" value={annexInfo?.email} />
              <div>
                <p className="text-sm text-gray-500">Responsables</p>
                <p className="font-medium text-sm sm:text-base">
                  {annexInfo?.main_pastor}  
                  {annexInfo?.coordinator && ` · ${annexInfo.coordinator}`}
                </p>
              </div>
            </div>
          </div>

          {/* Leaders */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Leadership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaders.map(l => (
                <div key={l.id} className="border rounded-xl p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base">{l.leader_name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{l.leader_phone}</p>
                  {l.assistant_leaders?.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Assistants  
                      {l.assistant_leaders.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Groupes</h2>
              <span className="text-sm flex items-center gap-1 text-gray-600">
                Voir tous <ChevronRight size={14} />
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {groups.map(g => (
                <div key={g.id} className="border rounded-xl p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base">{g.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Responsable {g.leader_name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Événements à venir</h2>
            <div className="space-y-3 sm:space-y-4">
              {events.map(e => (
                <div key={e.id} className="border rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base">{e.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {new Date(e.event_date).toLocaleDateString("fr-FR")}  
                    {e.start_time}
                  </p>
                  <p className="text-xs text-gray-500">
                    {e.attendees} participants
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Rapports récents</h2>
            <div className="space-y-3 sm:space-y-4">
              {reports.map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded-xl p-3 sm:p-4 gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">{r.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(r.report_date).toLocaleDateString("fr-FR")}  
                      {r.file_size}
                    </p>
                  </div>
                  <FileText size={20} className="text-gray-400 self-end sm:self-center" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
      <Icon size={20} className="sm:w-6 sm:h-6" style={{ color: "#0CC0DF" }} />
      <p className="text-xs sm:text-sm text-gray-600 mt-2">{label}</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500">{label}</p>
        <p className="font-medium text-sm sm:text-base break-words">{value}</p>
      </div>
    </div>
  );
}
