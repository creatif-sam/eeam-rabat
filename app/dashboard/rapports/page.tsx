"use client";

import React, { useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Activity, Filter, ChevronDown, PieChart, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function ReportsTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Sample data for charts - replace with your API calls
  const attendanceData = [
    { month: 'Juil', attendance: 245, target: 250 },
    { month: 'Août', attendance: 268, target: 260 },
    { month: 'Sept', attendance: 285, target: 270 },
    { month: 'Oct', attendance: 302, target: 280 },
    { month: 'Nov', attendance: 318, target: 290 },
    { month: 'Déc', attendance: 295, target: 300 },
    { month: 'Jan', attendance: 325, target: 310 },
  ];

  const financeData = [
    { month: 'Juil', revenus: 98000, depenses: 75000 },
    { month: 'Août', revenus: 105000, depenses: 82000 },
    { month: 'Sept', revenus: 112000, depenses: 88000 },
    { month: 'Oct', revenus: 118000, depenses: 91000 },
    { month: 'Nov', revenus: 115000, depenses: 87000 },
    { month: 'Déc', revenus: 125000, depenses: 95000 },
    { month: 'Jan', revenus: 125430, depenses: 89250 },
  ];

  const membershipGrowth = [
    { month: 'Juil', membres: 310, nouveaux: 8 },
    { month: 'Août', membres: 318, nouveaux: 8 },
    { month: 'Sept', membres: 325, nouveaux: 7 },
    { month: 'Oct', membres: 331, nouveaux: 6 },
    { month: 'Nov', membres: 335, nouveaux: 4 },
    { month: 'Déc', membres: 338, nouveaux: 3 },
    { month: 'Jan', membres: 342, nouveaux: 4 },
  ];

  const groupDistribution = [
    { name: 'Jeunes Adultes', value: 95, color: '#06b6d4' },
    { name: 'Hommes', value: 78, color: '#3b82f6' },
    { name: 'Femmes', value: 82, color: '#ec4899' },
    { name: 'Couples', value: 54, color: '#8b5cf6' },
    { name: 'Seniors', value: 33, color: '#f59e0b' },
  ];

  const ministryParticipation = [
    { ministry: 'Louange', participants: 35 },
    { ministry: 'Accueil', participants: 28 },
    { ministry: 'Technique', participants: 15 },
    { ministry: 'Enfants', participants: 42 },
    { ministry: 'Intercession', participants: 38 },
    { ministry: 'Médias', participants: 12 },
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Rapport Financier - Janvier 2026',
      type: 'finance',
      date: '2026-01-09',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Statistiques Mensuelles - Décembre 2025',
      type: 'statistics',
      date: '2026-01-01',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Rapport Trimestriel Q4 2025',
      type: 'quarterly',
      date: '2025-12-31',
      size: '5.2 MB',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Analyse de Croissance 2025',
      type: 'growth',
      date: '2025-12-28',
      size: '3.1 MB',
      status: 'completed'
    },
  ];

  const kpiCards = [
    {
      title: 'Croissance Membres',
      value: '+5.3%',
      change: '+12',
      isPositive: true,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Assiduité Moyenne',
      value: '87%',
      change: '+3%',
      isPositive: true,
      icon: Activity,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Revenus Mensuels',
      value: '125K MAD',
      change: '+8%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-violet-50'
    },
    {
      title: 'Événements',
      value: '24',
      change: '+2',
      isPositive: true,
      icon: Calendar,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'from-rose-50 to-pink-50'
    },
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b'];

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rapports & Analytics</h1>
          <p className="text-gray-600">Vue d'ensemble des statistiques et performances</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Filter size={18} />
            <span className="font-medium">Filtrer</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Download size={18} />
            <span className="font-medium">Exporter rapport</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm w-fit">
        {['week', 'month', 'quarter', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === period
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${kpi.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  kpi.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {kpi.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-800">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LineChartIcon size={24} className="text-cyan-600" />
              Évolution de l'assiduité
            </h2>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              Détails <ChevronDown size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="attendance" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Finance Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 size={24} className="text-cyan-600" />
              Revenus vs Dépenses
            </h2>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              Détails <ChevronDown size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => value !== undefined ? `${value.toLocaleString()} MAD` : ''}
              />
              <Legend />
              <Bar dataKey="revenus" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="depenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Growth */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={24} className="text-cyan-600" />
              Croissance des membres
            </h2>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              Détails <ChevronDown size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={membershipGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="membres" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              <Line type="monotone" dataKey="nouveaux" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Group Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PieChart size={24} className="text-cyan-600" />
              Distribution par groupe
            </h2>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              Détails <ChevronDown size={16} />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={250}>
              <RePieChart>
                <Pie
                  data={groupDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {groupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {groupDistribution.map((group, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{group.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Participation */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity size={24} className="text-cyan-600" />
            Participation aux ministères
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ministryParticipation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="ministry" type="category" stroke="#9ca3af" width={100} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="participants" fill="#06b6d4" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-cyan-600" />
            Rapports récents
          </h2>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            Voir tous
          </button>
        </div>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-cyan-300 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl flex items-center justify-center group-hover:from-cyan-100 group-hover:to-blue-100 transition-all">
                  <FileText size={24} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {report.size}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                <Download size={20} className="text-gray-400 group-hover:text-cyan-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}