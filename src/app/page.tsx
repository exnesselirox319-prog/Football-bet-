"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Shield,
  Wallet,
  Coins,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  ShoppingBag,
  Gift,
  Tv,
  Users,
  Settings,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  Globe,
  Volume2,
  User,
  LogOut,
  LogIn,
  Crown,
} from "lucide-react";
import { PenaltyShootout } from "@/components/PenaltyShootout";
import { SoccerMatch1v1 } from "@/components/SoccerMatch1v1";
import { CrossbarTargetMaster } from "@/components/CrossbarTargetMaster";
import { OwnerDashboard } from "@/components/OwnerDashboard";
import { DepositModal } from "@/components/DepositModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { ShopModal } from "@/components/ShopModal";
import { DailyLuckySpinModal } from "@/components/DailyLuckySpinModal";
import { RewardedAdModal } from "@/components/RewardedAdModal";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { AuthModal } from "@/components/AuthModal";
import { SoundToggle } from "@/components/SoundButton";
import { Language, translations } from "@/lib/translations";
import { soundFx } from "@/lib/audio";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("ur");
  const t = translations[lang];

  // Current Selected Game Mode
  const [activeMode, setActiveMode] = useState<"penalty" | "match1v1" | "crossbar">("penalty");

  // User & Balances State
  const [user, setUser] = useState({
    username: "Player_1",
    displayName: "Muhammad Ali",
    balanceUsd: "10.00",
    coins: 300,
    avatar: "⚽",
    matchesPlayed: 0,
    matchesWon: 0,
    goalsScored: 0,
    selectedBall: "Standard Ball",
    selectedKit: "Red Jersey",
    isAdmin: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Owner System Config & Stats
  const [ownerData, setOwnerData] = useState({
    totalRevenueUsd: "482.50",
    totalRevenuePkr: "135100.00",
    usdToPkrRate: "280.00",
    houseRakePercent: "10.00",
    adminPin: "owner2026",
    wallets: {
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
    },
  });

  // Modals Visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Initial Data Fetch & Restore saved user
  const loadData = useCallback(async () => {
    try {
      // 1. Ensure DB seed
      await fetch("/api/init");

      // Check localStorage for saved session
      const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("goalrush_user") : null;
      let activeUsername = "Player_1";
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && parsed.username) {
            activeUsername = parsed.username;
            setIsLoggedIn(true);
          }
        } catch {
          // ignore
        }
      }

      // 2. Fetch active user from server
      const userRes = await fetch(`/api/user?username=${encodeURIComponent(activeUsername)}`).then((r) => r.json());
      if (userRes.success && userRes.user) {
        setUser(userRes.user);
      }

      // 3. Fetch owner stats & wallets
      const ownerRes = await fetch("/api/owner/analytics").then((r) => r.json());
      if (ownerRes.success) {
        setOwnerData((prev) => ({
          ...prev,
          totalRevenueUsd: ownerRes.stats.totalRevenueUsd,
          totalRevenuePkr: ownerRes.stats.totalRevenuePkr,
          usdToPkrRate: ownerRes.stats.usdToPkrRate,
          houseRakePercent: ownerRes.stats.houseRakePercent,
          wallets: ownerRes.wallets || prev.wallets,
        }));
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Success Handler
  const handleAuthSuccess = (authUser: any, isOwnerLogin?: boolean) => {
    setUser(authUser);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("goalrush_user", JSON.stringify(authUser));
    }
    if (isOwnerLogin) {
      setShowOwnerPanel(true);
    }
  };

  const handleLogout = () => {
    soundFx.playClick();
    if (typeof window !== "undefined") {
      localStorage.removeItem("goalrush_user");
    }
    setIsLoggedIn(false);
    setUser({
      username: "Guest_Player",
      displayName: "Guest Player",
      balanceUsd: "10.00",
      coins: 300,
      avatar: "⚽",
      matchesPlayed: 0,
      matchesWon: 0,
      goalsScored: 0,
      selectedBall: "Standard Ball",
      selectedKit: "Red Jersey",
      isAdmin: false,
    });
  };

  // Match Finish Handler (Calculates Winnings & Credits Owner House Rake)
  const handleMatchFinish = async (matchPayload: {
    gameMode: string;
    stakeUsd: number;
    stakeCoins: number;
    playerScore: number;
    opponentScore: number;
    difficulty: string;
    opponentName: string;
  }) => {
    try {
      const res = await fetch("/api/match/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...matchPayload,
          username: user.username,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("goalrush_user", JSON.stringify(data.user));
        }

        // Refresh owner stats so the owner's revenue counter increases live!
        const ownerRes = await fetch("/api/owner/analytics").then((r) => r.json());
        if (ownerRes.success) {
          setOwnerData((prev) => ({
            ...prev,
            totalRevenueUsd: ownerRes.stats.totalRevenueUsd,
            totalRevenuePkr: ownerRes.stats.totalRevenuePkr,
          }));
        }
      }
    } catch (err) {
      console.error("Match finish sync error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans pb-16">
      {/* Top Owner Live Revenue Ticker Header */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-3 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-urdu font-bold text-emerald-300">
            مالک کا والٹ سسٹم فعال ہے:
          </span>
          <span className="text-slate-300 hidden md:inline">
            کھلاڑیوں کے ہر میچ کا 10% کمیشن اور کوائنز کی فروخت براہ راست مالک کے والٹ میں جمع ہو رہی ہے
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 px-3 py-1 rounded-xl border border-emerald-500/40 font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-yellow-400" />
            <span>Owner Vault: ${ownerData.totalRevenueUsd}</span>
            <span className="text-slate-400 text-[11px]">
              (₨ {parseFloat(ownerData.totalRevenuePkr).toLocaleString()} PKR)
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowOwnerPanel(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 font-urdu"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>مالک کا پینل (Owner Admin)</span>
          </button>
        </div>
      </div>

      {/* Main App Navbar */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1 font-urdu">
                گول رش ارینا
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-sans font-extrabold">
                  PRO
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-urdu">{t.appTagline}</p>
          </div>
        </div>

        {/* User Balance & Auth / Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* User Profile / Login Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowAuthModal(true);
              }}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-2xl transition shadow-inner"
            >
              <span className="text-base">{user.avatar || "⚽"}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{user.displayName || user.username}</span>
                  {user.isAdmin && (
                    <span className="text-[9px] bg-yellow-500 text-slate-950 font-black px-1.5 rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-urdu block">
                  {isLoggedIn ? "اکاؤنٹ تبدیل کریں" : "لاگ ان / سائن اپ"}
                </span>
              </div>
            </button>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* USD Balance */}
          <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-xs text-slate-400 mr-1 font-urdu">{t.balance}:</span>
            <span className="text-sm font-black font-mono text-emerald-400 mr-2">
              ${user.balanceUsd}
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowDepositModal(true);
              }}
              className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
              title="Deposit Funds"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Coins Balance */}
          <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-yellow-400 mr-1" />
            <span className="text-sm font-black font-mono text-yellow-400 mr-2">
              {user.coins}
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowShopModal(true);
              }}
              className="p-1 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 transition"
              title="Buy Coins"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowWithdrawModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 border border-slate-700 transition text-xs font-bold flex items-center gap-1 font-urdu"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.withdraw}</span>
          </button>

          {/* Language Selector */}
          <button
            onClick={() => {
              soundFx.playClick();
              setLang(lang === "ur" ? "en" : "ur");
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 text-xs font-bold"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "ur" ? "English" : "اردو"}</span>
          </button>

          {/* Sound Toggle */}
          <SoundToggle />
        </div>
      </header>

      {/* Hero Action Quick Links Bar */}
      <section className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Game Mode Switcher Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-lg text-xs font-bold gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveMode("penalty");
            }}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-urdu ${
              activeMode === "penalty"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚽ {t.penaltyShootout}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveMode("match1v1");
            }}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-urdu ${
              activeMode === "match1v1"
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🏆 {t.match1v1}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveMode("crossbar");
            }}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-urdu ${
              activeMode === "crossbar"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎯 {t.crossbarChallenge}</span>
          </button>
        </div>

        {/* Feature Buttons: Lucky Spin, Rewarded Ad, Leaderboard, Coin Store */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowSpinModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 transition text-xs font-bold flex items-center gap-1.5 font-urdu shadow"
          >
            <Gift className="w-4 h-4 animate-bounce" />
            <span>{t.spinWheel}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowAdModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition text-xs font-bold flex items-center gap-1.5 font-urdu shadow"
          >
            <Tv className="w-4 h-4" />
            <span>ویڈیو ایڈ (+25 کوائنز)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowShopModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition text-xs font-bold flex items-center gap-1.5 font-urdu shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.shop}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowLeaderboardModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition text-xs font-bold flex items-center gap-1.5 font-urdu"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{t.leaderboard}</span>
          </button>
        </div>
      </section>

      {/* Main Interactive Game Arena Pitch */}
      <section className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 flex-1 flex flex-col justify-center">
        {activeMode === "penalty" && (
          <PenaltyShootout user={user} onMatchFinish={handleMatchFinish} lang={lang} />
        )}
        {activeMode === "match1v1" && (
          <SoccerMatch1v1 user={user} onMatchFinish={handleMatchFinish} lang={lang} />
        )}
        {activeMode === "crossbar" && (
          <CrossbarTargetMaster user={user} onMatchFinish={handleMatchFinish} lang={lang} />
        )}
      </section>

      {/* Owner Revenue Mechanics Information Card */}
      <section className="w-full max-w-5xl mx-auto px-4 mt-8">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-urdu">
                {t.howItWorksTitle}
              </h3>
              <p className="text-xs text-slate-400 font-urdu">
                گیم اونر کے لیے مکمل خودکار ریونیو ماڈل اور والٹ پے آؤٹس
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 font-urdu">
                <CheckCircle2 className="w-4 h-4" />
                1. 10% میچ ہاؤس کمیشن
              </div>
              <p className="text-slate-400 leading-relaxed font-urdu">{t.howItWorks1}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="font-bold text-yellow-400 flex items-center gap-1.5 font-urdu">
                <CheckCircle2 className="w-4 h-4" />
                2. کوائن شاپ کی 100% فروخت
              </div>
              <p className="text-slate-400 leading-relaxed font-urdu">{t.howItWorks3}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="font-bold text-purple-400 flex items-center gap-1.5 font-urdu">
                <CheckCircle2 className="w-4 h-4" />
                3. ویڈیو اشتہارات سے ایڈ ریونیو
              </div>
              <p className="text-slate-400 leading-relaxed font-urdu">
                کھلاڑی مفت کوائنز کے لیے اشتہار دیکھتے ہیں اور مالک کو فی ویو $0.05 نیٹ ورک انکم ملتی ہے۔
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal (Player Login / Register / Owner Access) */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
          lang={lang}
        />
      )}

      {/* Owner Dashboard Overlay */}
      {showOwnerPanel && (
        <OwnerDashboard
          lang={lang}
          onClose={() => {
            setShowOwnerPanel(false);
            loadData();
          }}
        />
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          ownerWallets={ownerData.wallets as any}
          onSuccess={(u) => {
            setUser(u);
            loadData();
          }}
          onClose={() => setShowDepositModal(false)}
          lang={lang}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          currentBalance={user.balanceUsd}
          usdToPkrRate={ownerData.usdToPkrRate}
          onSuccess={(u) => {
            setUser(u);
            loadData();
          }}
          onClose={() => setShowWithdrawModal(false)}
          lang={lang}
        />
      )}

      {/* Shop Modal */}
      {showShopModal && (
        <ShopModal
          userCoins={user.coins}
          onSuccess={(u) => {
            setUser(u);
            loadData();
          }}
          onClose={() => setShowShopModal(false)}
          lang={lang}
        />
      )}

      {/* Daily Lucky Spin Modal */}
      {showSpinModal && (
        <DailyLuckySpinModal
          onSuccess={(u) => {
            setUser(u);
            loadData();
          }}
          onClose={() => setShowSpinModal(false)}
          lang={lang}
        />
      )}

      {/* Rewarded Video Ad Modal */}
      {showAdModal && (
        <RewardedAdModal
          onSuccess={(u) => {
            setUser(u);
            loadData();
          }}
          onClose={() => setShowAdModal(false)}
          lang={lang}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} lang={lang} />
      )}
    </main>
  );
}
