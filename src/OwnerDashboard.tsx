"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Settings,
  Flame,
  Award,
  CreditCard,
  QrCode,
  Lock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Tv,
} from "lucide-react";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { Language, translations } from "@/lib/translations";
import { soundFx } from "@/lib/audio";

interface OwnerDashboardProps {
  lang: Language;
  onClose: () => void;
}

export function OwnerDashboard({ lang, onClose }: OwnerDashboardProps) {
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "wallets" | "economy" | "transactions" | "ledger">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Analytics Stats
  const [stats, setStats] = useState({
    totalRevenueUsd: "0.00",
    totalRevenuePkr: "0.00",
    matchRakeTotal: "0.00",
    storeSalesTotal: "0.00",
    adRevenueTotal: "0.00",
    totalUsers: 0,
    totalMatches: 0,
    pendingCount: 0,
    usdToPkrRate: "280.00",
    houseRakePercent: "10.00",
  });

  // Owner Wallet Settings State (Only 4 Methods)
  const [formData, setFormData] = useState({
    platformName: "GoalRush Arena",
    adminPin: "owner2026",
    usdToPkrRate: "280.00",
    houseRakePercent: "10.00",
    adRewardRateUsd: "0.0500",
    minWithdrawal: "10.00",
    minDeposit: "1.00",
    // 1. EasyPaisa
    easypaisaNumber: "03134876720",
    easypaisaName: "Allah Ditta Rabnawaz",
    // 2. JazzCash
    jazzcashNumber: "03134876720",
    jazzcashName: "Allah Ditta Rabnawaz",
    // 3. USDT TRC20
    usdtTrc20: "TV7QzoSkw9Patn8tFakrrg6BnNSCBBrNSJ",
    // 4. USDT ERC20
    usdtErc20: "0x3501ac1796263d50a5f7e78178a64997c7077dd6",
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [selectedQrWallet, setSelectedQrWallet] = useState<"easypaisa" | "jazzcash" | "usdt" | "usdt_erc20">("easypaisa");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, settingsRes, txRes] = await Promise.all([
        fetch("/api/owner/analytics").then((r) => r.json()),
        fetch("/api/owner/settings").then((r) => r.json()),
        fetch("/api/owner/transactions").then((r) => r.json()),
      ]);

      if (analyticsRes.success) {
        setStats(analyticsRes.stats);
        setRecentLogs(analyticsRes.recentLogs || []);
      }

      if (settingsRes.success && settingsRes.settings) {
        setFormData((prev) => ({ ...prev, ...settingsRes.settings }));
      }

      if (txRes.success) {
        setTransactionsList(txRes.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load owner data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSettings = async () => {
    soundFx.playClick();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/owner/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        soundFx.playCoin();
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchData();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTxAction = async (txId: number, action: "approve" | "reject") => {
    soundFx.playClick();
    try {
      const res = await fetch("/api/owner/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action }),
      });
      const data = await res.json();
      if (data.success) {
        soundFx.playCoin();
        fetchData();
      }
    } catch (err) {
      console.error("Tx action error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 px-6 py-4 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide font-urdu">
                  {t.ownerDashboardTitle}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 font-urdu">{t.ownerDashboardSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 border border-slate-700 transition text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/90 px-6 py-2.5 border-b border-slate-800 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("wallets")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "wallets"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="font-urdu">والٹ سیٹنگز (Owner Wallets)</span>
          </button>
          <button
            onClick={() => setActiveTab("economy")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "economy"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>House Rake & Margin</span>
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "transactions"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Player Deposits / Cashouts</span>
            {stats.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {stats.pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Live Audit Ledger</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Grand Total Revenue Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-yellow-400" />
                    <span>Total Owner Accumulated Revenue (کل کمائی)</span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-white mt-1 font-mono flex items-baseline gap-3">
                    <span>${stats.totalRevenueUsd}</span>
                    <span className="text-xl sm:text-2xl text-emerald-400 font-bold">
                      (₨ {parseFloat(stats.totalRevenuePkr).toLocaleString()} PKR)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-urdu">
                    یہ وہ کل رقم ہے جو کھلاڑیوں کے میچ کھیلنے کے ہاؤس کمیشن، کوائن پیکز کی خریداری اور اشتہارات دیکھنے سے آپ کے والٹ میں جمع ہوئی۔
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("wallets")}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition font-urdu"
                  >
                    والٹ نمبر تبدیل کریں ⚙️
                  </button>
                </div>
              </div>

              {/* 3 Revenue Stream Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Match House Rake */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span className="font-urdu">{t.matchRakeRevenue}</span>
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      ⚽ 10% Cut
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-3">
                    ${stats.matchRakeTotal}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ₨ {(parseFloat(stats.matchRakeTotal) * parseFloat(stats.usdToPkrRate)).toFixed(0)} PKR
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Every penalty kick & 1v1 match pays you 10% rake.
                  </p>
                </div>

                {/* Store & Coin Sales */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span className="font-urdu">{t.storeSalesRevenue}</span>
                    <span className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      🪙 100% Profit
                    </span>
                  </div>
                  <div className="text-2xl font-black text-yellow-400 font-mono mt-3">
                    ${stats.storeSalesTotal}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ₨ {(parseFloat(stats.storeSalesTotal) * parseFloat(stats.usdToPkrRate)).toFixed(0)} PKR
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Players buying Starter ($2), Pro ($5), and VIP ($15) packs.
                  </p>
                </div>

                {/* Ad Video Revenue */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span className="font-urdu">{t.adRevenueEarned}</span>
                    <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      📺 CPM Ad
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-3">
                    ${stats.adRevenueTotal}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ₨ {(parseFloat(stats.adRevenueTotal) * parseFloat(stats.usdToPkrRate)).toFixed(0)} PKR
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Free spin & rewarded video ads ($0.05/view).
                  </p>
                </div>
              </div>

              {/* Platform Activity Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[11px] text-slate-400">Total Players</div>
                    <div className="text-lg font-black text-white">{stats.totalUsers}</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-[11px] text-slate-400">Matches Played</div>
                    <div className="text-lg font-black text-white">{stats.totalMatches}</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-[11px] text-slate-400">House Edge</div>
                    <div className="text-lg font-black text-yellow-400">{stats.houseRakePercent}%</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[11px] text-slate-400">USD/PKR Rate</div>
                    <div className="text-lg font-black text-emerald-400">₨ {stats.usdToPkrRate}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OWNER WALLET CONFIGURATION */}
          {activeTab === "wallets" && (
            <div className="space-y-6">
              <div className="bg-slate-950/90 p-5 rounded-3xl border border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-urdu">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  {t.walletSettingsTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-urdu">{t.walletSettingsDesc}</p>
              </div>

              {/* QR Code Quick Visualizer + Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Fields Column */}
                <div className="lg:col-span-2 space-y-5">
                  {/* 4 Active Wallets Section */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 font-urdu">
                        👑 آپ کے 4 تصدیق شدہ والٹس (Allah Ditta Rabnawaz)
                      </h4>
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                        4 Active Only
                      </span>
                    </div>

                    {/* 1. EasyPaisa */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 font-urdu block">
                        1. EasyPaisa اکاؤنٹ (موبائل اکاؤنٹ):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">EasyPaisa Number</label>
                          <input
                            type="text"
                            value={formData.easypaisaNumber}
                            onChange={(e) => setFormData({ ...formData, easypaisaNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 outline-none"
                            placeholder="03134876720"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Account Title / Name</label>
                          <input
                            type="text"
                            value={formData.easypaisaName}
                            onChange={(e) => setFormData({ ...formData, easypaisaName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                            placeholder="Allah Ditta Rabnawaz"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. JazzCash */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-yellow-400 font-urdu block">
                        2. JazzCash اکاؤنٹ (موبائل اکاؤنٹ):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">JazzCash Number</label>
                          <input
                            type="text"
                            value={formData.jazzcashNumber}
                            onChange={(e) => setFormData({ ...formData, jazzcashNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-yellow-500 outline-none"
                            placeholder="03134876720"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Account Title / Name</label>
                          <input
                            type="text"
                            value={formData.jazzcashName}
                            onChange={(e) => setFormData({ ...formData, jazzcashName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
                            placeholder="Allah Ditta Rabnawaz"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. USDT TRC20 */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-teal-400 font-urdu block">
                        3. USDT (TRC-20 Tron Network) - (آپ کا ذاتی ایڈریس):
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.usdtTrc20}
                          onChange={(e) => setFormData({ ...formData, usdtTrc20: e.target.value })}
                          className="w-full bg-slate-950 border border-teal-500/50 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:border-teal-400 outline-none"
                          placeholder="TV7QzoSkw9Patn8tFakrrg6BnNSCBBrNSJ"
                        />
                        <button
                          onClick={() => handleCopy(formData.usdtTrc20, "usdt_trc20")}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
                          title="Copy TRC20"
                        >
                          {copiedKey === "usdt_trc20" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 4. USDT ERC20 */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-purple-400 font-urdu block">
                        4. USDT (ERC-20 Ethereum Network) - (آپ کا ذاتی ایڈریس):
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.usdtErc20}
                          onChange={(e) => setFormData({ ...formData, usdtErc20: e.target.value })}
                          className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 focus:border-purple-400 outline-none"
                          placeholder="0x3501ac1796263d50a5f7e78178a64997c7077dd6"
                        />
                        <button
                          onClick={() => handleCopy(formData.usdtErc20, "usdt_erc20")}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700"
                          title="Copy ERC20"
                        >
                          {copiedKey === "usdt_erc20" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 font-urdu"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {t.saveWalletChanges}
                    </button>

                    {saveSuccess && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-urdu">
                        <CheckCircle className="w-4 h-4" />
                        {t.changesSavedSuccess}
                      </span>
                    )}
                  </div>
                </div>

                {/* QR Code Preview Column */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Live QR Code Preview for Players
                  </h4>

                  {/* Wallet Picker */}
                  <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-urdu">
                    <button
                      onClick={() => setSelectedQrWallet("easypaisa")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedQrWallet === "easypaisa" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      EasyPaisa
                    </button>
                    <button
                      onClick={() => setSelectedQrWallet("jazzcash")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedQrWallet === "jazzcash" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      JazzCash
                    </button>
                    <button
                      onClick={() => setSelectedQrWallet("usdt")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedQrWallet === "usdt" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      USDT TRC20
                    </button>
                    <button
                      onClick={() => setSelectedQrWallet("usdt_erc20")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedQrWallet === "usdt_erc20" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                      }`}
                    >
                      USDT ERC20
                    </button>
                  </div>

                  <QRCodeDisplay
                    text={
                      selectedQrWallet === "easypaisa"
                        ? formData.easypaisaNumber
                        : selectedQrWallet === "jazzcash"
                        ? formData.jazzcashNumber
                        : selectedQrWallet === "usdt"
                        ? formData.usdtTrc20
                        : formData.usdtErc20
                    }
                    size={170}
                    label={
                      selectedQrWallet === "easypaisa"
                        ? `EasyPaisa: ${formData.easypaisaNumber}`
                        : selectedQrWallet === "jazzcash"
                        ? `JazzCash: ${formData.jazzcashNumber}`
                        : selectedQrWallet === "usdt"
                        ? `USDT TRC20: ${formData.usdtTrc20.slice(0, 12)}...`
                        : `USDT ERC20: ${formData.usdtErc20.slice(0, 10)}...`
                    }
                  />

                  <p className="text-[11px] text-slate-500 font-urdu">
                    کھلاڑی اپنے بائنانس، جاز کیش یا ایزی پیسہ ایپ سے یہ QR اسکین کر کے رقم جمع کر سکتے ہیں۔
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ECONOMY & HOUSE MARGIN */}
          {activeTab === "economy" && (
            <div className="space-y-6">
              <div className="bg-slate-950/90 p-5 rounded-3xl border border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  House Rake Margin & Economics
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust how much platform profit you collect on every single match, ad view, and coin transaction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* House Rake Percentage */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-black text-white font-urdu">
                      {t.houseRakeRate} (میچ کمیشن)
                    </label>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {formData.houseRakePercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={formData.houseRakePercent}
                    onChange={(e) => setFormData({ ...formData, houseRakePercent: e.target.value })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1% (Low)</span>
                    <span>10% (Standard)</span>
                    <span>30% (High Profit)</span>
                  </div>
                  <p className="text-xs text-slate-400 font-urdu">
                    اگر ایک کھلاڑی $10 کا میچ کھیلے گا تو 10% کے حساب سے $1.00 سیدھا آپ کی کل کمائی میں جمع ہو جائے گا۔
                  </p>
                </div>

                {/* USD to PKR Rate */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-sm font-black text-white block">
                    USD to PKR Exchange Rate (روپے کی قیمت)
                  </label>
                  <input
                    type="number"
                    value={formData.usdToPkrRate}
                    onChange={(e) => setFormData({ ...formData, usdToPkrRate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none"
                    placeholder="280.00"
                  />
                  <p className="text-xs text-slate-400 font-urdu">
                    تمام کیش آؤٹس اور ڈپازٹس اس ریٹ کے مطابق خودکار طریقے سے کنورٹ ہوں گے۔
                  </p>
                </div>

                {/* Ad CPM Payout */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-sm font-black text-white block font-urdu">
                    {t.adRateSetting}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.adRewardRateUsd}
                    onChange={(e) => setFormData({ ...formData, adRewardRateUsd: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none"
                    placeholder="0.05"
                  />
                  <p className="text-xs text-slate-400">
                    Revenue credited to your Owner Vault each time a user watches a sponsor video for free coins.
                  </p>
                </div>

                {/* Minimum Withdrawal */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-sm font-black text-white block font-urdu">
                    {t.minWithdrawalSetting}
                  </label>
                  <input
                    type="number"
                    value={formData.minWithdrawal}
                    onChange={(e) => setFormData({ ...formData, minWithdrawal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none"
                    placeholder="10.00"
                  />
                  <p className="text-xs text-slate-400">
                    Players cannot request withdrawals below this USD threshold.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Economic Changes
              </button>
            </div>
          )}

          {/* TAB 4: PLAYER DEPOSITS & CASHOUTS */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Player Deposits & Withdrawal Requests
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Approve incoming player deposits or release approved winnings.
                  </p>
                </div>
              </div>

              {transactionsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-urdu">{t.noPendingRequests}</div>
              ) : (
                <div className="space-y-2">
                  {transactionsList.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-2.5 rounded-xl text-xs font-bold ${
                            tx.type === "deposit"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : tx.type === "withdraw"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {tx.type === "deposit" ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{tx.userName || "Player"}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                              {tx.paymentMethod || "Direct"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Ref: {tx.txReference || "N/A"} • Recipient: {tx.recipientWallet || "Owner Master"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-black text-white font-mono">
                            ${tx.amountUsd}
                          </div>
                          <div
                            className={`text-[11px] font-bold uppercase ${
                              tx.status === "completed" || tx.status === "approved"
                                ? "text-emerald-400"
                                : tx.status === "pending"
                                ? "text-yellow-400"
                                : "text-rose-400"
                            }`}
                          >
                            {tx.status}
                          </div>
                        </div>

                        {tx.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTxAction(tx.id, "approve")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleTxAction(tx.id, "reject")}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LIVE AUDIT LEDGER */}
          {activeTab === "ledger" && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 p-5 rounded-3xl border border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Live Owner Revenue Stream & Audit Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-urdu">
                  ہر میچ کا ہاؤس کمیشن اور فروخت کا ریکارڈ سیکنڈ بہ سیکنڈ محفوظ ہو رہا ہے۔
                </p>
              </div>

              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          log.sourceType === "match_rake"
                            ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]"
                            : log.sourceType === "store_purchase"
                            ? "bg-yellow-400 shadow-[0_0_8px_#facc15]"
                            : "bg-purple-400 shadow-[0_0_8px_#c084fc]"
                        }`}
                      />
                      <div>
                        <span className="font-bold text-slate-200">{log.description}</span>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()} • User: {log.userName || "Player"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-400 text-sm">
                        +${log.amountUsd}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ₨ {log.amountPkr} PKR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
