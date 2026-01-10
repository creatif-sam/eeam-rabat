"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Download, Filter, Search, ArrowUpRight, ArrowDownRight, Plus, Eye, FileText, PieChart } from 'lucide-react';

export default function FinancesTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with your API calls
  const financialSummary = {
    totalIncome: 125430,
    totalExpenses: 89250,
    netBalance: 36180,
    titheIncome: 98500,
    offerings: 26930,
    monthlyGrowth: 8.5,
  };

  const recentTransactions = [
    {
      id: 1,
      date: '2026-01-08',
      description: 'Dîmes - Culte Dimanche',
      category: 'Dîmes',
      amount: 8500,
      type: 'income',
      donor: 'Collecte générale'
    },
    {
      id: 2,
      date: '2026-01-07',
      description: 'Paiement loyer local',
      category: 'Loyer',
      amount: -12000,
      type: 'expense',
      vendor: 'Propriétaire'
    },
    {
      id: 3,
      date: '2026-01-06',
      description: 'Offrande spéciale missions',
      category: 'Missions',
      amount: 5200,
      type: 'income',
      donor: 'Offrande ciblée'
    },
    {
      id: 4,
      date: '2026-01-05',
      description: 'Équipement sonorisation',
      category: 'Équipement',
      amount: -3400,
      type: 'expense',
      vendor: 'Music Store'
    },
    {
      id: 5,
      date: '2026-01-05',
      description: 'Dons en ligne',
      category: 'Dîmes',
      amount: 2800,
      type: 'income',
      donor: 'Plateforme en ligne'
    },
  ];

  const budgetCategories = [
    { name: 'Personnel', allocated: 45000, spent: 42000, percentage: 93 },
    { name: 'Loyer & Bâtiment', allocated: 15000, spent: 12000, percentage: 80 },
    { name: 'Missions', allocated: 12000, spent: 8500, percentage: 71 },
    { name: 'Événements', allocated: 8000, spent: 6200, percentage: 78 },
    { name: 'Équipement', allocated: 5000, spent: 3400, percentage: 68 },
    { name: 'Autres', allocated: 4250, spent: 3150, percentage: 74 },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(Math.abs(amount));
  };

  const filteredTransactions = recentTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Financière</h1>
          <p className="text-gray-600">Vue d'ensemble des finances de l'église</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Plus size={18} />
            <span className="font-medium">Nouvelle transaction</span>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              +{financialSummary.monthlyGrowth}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Revenus totaux</p>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(financialSummary.totalIncome)}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <TrendingDown size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">
              Dépenses
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Dépenses totales</p>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(financialSummary.totalExpenses)}</p>
        </div>

        {/* Net Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <DollarSign size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Solde
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Solde net</p>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(financialSummary.netBalance)}</p>
        </div>

        {/* Tithes */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              Dîmes
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Dîmes collectées</p>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(financialSummary.titheIncome)}</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <PieChart size={24} className="text-cyan-600" />
            Budget par catégorie
          </h2>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1">
            Voir détails <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {budgetCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{category.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                  </span>
                  <span className={`font-semibold ${category.percentage > 90 ? 'text-rose-600' : 'text-cyan-600'}`}>
                    {category.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    category.percentage > 90
                      ? 'bg-gradient-to-r from-rose-500 to-red-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  }`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-cyan-600" />
            Transactions récentes
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter size={18} />
              Filtrer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Catégorie</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Source/Vendeur</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Montant</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-800">{transaction.description}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {transaction.donor || transaction.vendor}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowUpRight size={16} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={16} className="text-rose-500" />
                      )}
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-rose-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={18} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}