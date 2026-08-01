"use client";

import React, { useState } from "react";
import {
  User,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  CheckCircle,
  Crown,
  KeyRound,
} from "lucide-react";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface AuthModalProps {
  onSuccess: (user: any, isOwnerLogin?: boolean) => void;
  onClose: () => void;
  lang: Language;
}

export function AuthModal({ onSuccess, onClose, lang }: AuthModalProps) {
  const t = translations[lang];

  const [tab, setTab] = useState<"player_login" | "register" | "owner_login">("player_login");

  // Player Login form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState("⚽");

  // Owner Login form
  const [ownerPin, setOwnerPin] = useState("owner2026");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1-Click Quick Demo Login options
  const quickLoginOptions = [
    { username: "Muhammad_Ali", name: "Muhammad Ali", avatar: "⚽" },
    { username: "Hamza_R9", name: "Hamza Striker", avatar: "🔥" },
    { username: "Zeeshan_Pro", name: "Zeeshan Goalie", avatar: "🧤" },
  ];

  const handlePlayerLogin = async (customUsername?: string) => {
    soundFx.playClick();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetUser = customUsername || loginIdentifier;
    if (!targetUser.trim()) {
      setErrorMsg("براہ کرم یوزرنیم یا فون نمبر درج کریں (Enter username)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          password: loginPassword || "123456",
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        soundFx.playCoin();
        setSuccessMsg(data.message || "لاگ ان کامیاب ہو گیا!");
        setTimeout(() => {
          onSuccess(data.user, false);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || "لاگ ان نا کام ہو گیا");
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    soundFx.playClick();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regUsername.trim()) {
      setErrorMsg("یوزر نیم درج کرنا لازمی ہے (Username is required)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          displayName: regDisplayName || regUsername,
          phone: regPhone,
          password: regPassword || "123456",
          avatar: regAvatar,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        soundFx.playCoin();
        setSuccessMsg(data.message || "نیا اکاؤنٹ کامیابی سے بن گیا!");
        setTimeout(() => {
          onSuccess(data.user, false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || "اکاؤنٹ بنانے میں مسئلہ آیا");
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerLogin = async () => {
    soundFx.playClick();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quickRole: "owner",
          password: ownerPin || "owner2026",
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        soundFx.playCoin();
        setSuccessMsg("مالک کنٹرول روم لاگ ان کامیاب! (Owner Dashboard Unlocked)");
        setTimeout(() => {
          onSuccess(data.user, true);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || "غلط اونر پن / Invalid PIN");
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black font-urdu">
                {tab === "owner_login"
                  ? "مالک لاگ ان (Owner Access)"
                  : tab === "register"
                  ? "نیا اکاؤنٹ بنائیں (Sign Up)"
                  : "کھلاڑی لاگ ان (Player Login)"}
              </h3>
              <p className="text-xs text-slate-400 font-urdu">
                GoalRush Arena میں خوش آمدید
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold font-urdu">
          <button
            onClick={() => {
              soundFx.playClick();
              setTab("player_login");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition text-center ${
              tab === "player_login"
                ? "bg-emerald-500 text-slate-950 shadow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            لاگ ان (Login)
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setTab("register");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition text-center ${
              tab === "register"
                ? "bg-emerald-500 text-slate-950 shadow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            رجسٹر (Sign Up)
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setTab("owner_login");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition text-center flex items-center justify-center gap-1 ${
              tab === "owner_login"
                ? "bg-yellow-500 text-slate-950 shadow font-black"
                : "text-yellow-400 hover:text-yellow-300"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>مالک (Owner)</span>
          </button>
        </div>

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-600/30 text-rose-300 text-xs font-bold text-center font-urdu">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600/30 text-emerald-300 text-xs font-bold text-center font-urdu flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: PLAYER LOGIN */}
        {tab === "player_login" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                  یوزر نیم یا موبائل فون نمبر:
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. Ali_Striker or 03001234567"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handlePlayerLogin()}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                  پاس ورڈ (یا ڈیفالٹ 123456):
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                  <Lock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handlePlayerLogin()}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlayerLogin()}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 font-urdu"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{loading ? "لاگ ان ہو رہا ہے..." : "لاگ ان کریں (Login Now)"}</span>
            </button>

            {/* Quick 1-Click Login options for instant testing */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-urdu block mb-2 text-center">
                ⚡ یا 1-کلک سے فوری لاگ ان کریں:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {quickLoginOptions.map((q) => (
                  <button
                    key={q.username}
                    onClick={() => handlePlayerLogin(q.username)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-center transition flex flex-col items-center"
                  >
                    <span className="text-base">{q.avatar}</span>
                    <span className="text-[10px] font-bold text-slate-200 truncate max-w-full">
                      {q.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {tab === "register" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                یوزر نیم منتخب کریں (Username):
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. GoalMaster99"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                مکمل نام (Display Name):
              </label>
              <input
                type="text"
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="Muhammad Ali"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                  موبائل نمبر (اختیاری):
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0300XXXXXXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                  پاس ورڈ (Password):
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                اواتار منتخب کریں (Select Avatar):
              </label>
              <div className="flex gap-2 justify-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                {["⚽", "🔥", "👑", "🦁", "⚡", "🧤"].map((av) => (
                  <button
                    key={av}
                    onClick={() => setRegAvatar(av)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                      regAvatar === av ? "bg-emerald-500 scale-110 shadow" : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold text-center font-urdu">
              🎁 نئے اکاؤنٹ پر $15.00 کیش + 500 کوائنز مفت ویلکم گفٹ ملے گا!
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 font-urdu"
            >
              <span>{loading ? "بن رہا ہے..." : "اکاؤنٹ بنائیں اور شروع کریں"}</span>
            </button>
          </div>
        )}

        {/* TAB 3: OWNER LOGIN */}
        {tab === "owner_login" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-black text-yellow-400 font-urdu">
                گیم اونر / ایڈمن کنٹرول روم
              </h4>
              <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                یہاں سے آپ اپنی کل کمائی چیک کر سکتے ہیں، اپنے USDT/JazzCash والٹ نمبرز تبدیل کر سکتے ہیں اور کھلاڑیوں کے ڈپازٹس تصدیق کر سکتے ہیں۔
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 font-urdu">
                مالک کا پاس کوڈ / ایڈمن PIN:
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5">
                <KeyRound className="w-4 h-4 text-yellow-400 mr-2" />
                <input
                  type="password"
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value)}
                  placeholder="owner2026"
                  className="w-full bg-transparent text-center text-base font-mono tracking-widest text-white outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleOwnerLogin()}
                />
              </div>
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                ڈیفالٹ ایڈمن پاس ورڈ: <code className="text-yellow-400 font-bold">owner2026</code> یا <code className="text-yellow-400 font-bold">admin123</code>
              </span>
            </div>

            <button
              onClick={handleOwnerLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-yellow-500/20 transition flex items-center justify-center gap-2 font-urdu"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>{loading ? "لاگ ان ہو رہا ہے..." : "مالک کنٹرول پینل کھولیں (Unlock Owner)"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
