"use client";

import React, { useState } from "react";
import { ArrowUpRight, DollarSign, ShieldCheck, X } from "lucide-react";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface WithdrawModalProps {
  currentBalance: string;
  usdToPkrRate: string;
  onSuccess: (updatedUser: any) => void;
  onClose: () => void;
  lang: Language;
}

export function WithdrawModal({ currentBalance, usdToPkrRate, onSuccess, onClose, lang }: WithdrawModalProps) {
  const t = translations[lang];

  const [method, setMethod] = useState<"EasyPaisa" | "JazzCash" | "USDT_TRC20" | "USDT_ERC20">("EasyPaisa");
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [recipientWallet, setRecipientWallet] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const rate = parseFloat(usdToPkrRate || "280");
  const pkrEquivalent = (amountUsd * rate).toFixed(0);

  const handleWithdraw = async () => {
    soundFx.playClick();
    if (!recipientWallet.trim()) {
      setStatusMessage({ text: "Please enter destination account/wallet address", isError: true });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd,
          paymentMethod: method,
          recipientWallet,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundFx.playCoin();
        if (data.user) onSuccess(data.user);
        setStatusMessage({ text: data.message, isError: false });
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setStatusMessage({ text: data.error || "Withdrawal failed", isError: true });
      }
    } catch {
      setStatusMessage({ text: "Network error", isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black font-urdu">{t.withdraw} (Cashout Winnings)</h3>
              <p className="text-xs text-slate-400 font-urdu">
                موجودہ بیلنس: ${currentBalance} (≈ ₨ {(parseFloat(currentBalance) * rate).toFixed(0)} PKR)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method selector - Exactly 4 Methods */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold font-urdu">
          {(
            [
              { id: "EasyPaisa", label: "1. EasyPaisa 📱" },
              { id: "JazzCash", label: "2. JazzCash ⚡" },
              { id: "USDT_TRC20", label: "3. USDT TRC20 🌐" },
              { id: "USDT_ERC20", label: "4. USDT ERC20 💎" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setMethod(item.id);
              }}
              className={`py-2 rounded-xl text-center transition ${
                method === item.id ? "bg-rose-500 text-white shadow font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Withdrawal Amount ($ USD):</span>
            <span className="font-mono text-rose-400 font-bold">≈ ₨ {pkrEquivalent} PKR</span>
          </div>

          <div className="flex gap-2">
            {[10, 25, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setAmountUsd(val)}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition ${
                  amountUsd === val
                    ? "bg-rose-500/20 text-rose-400 border-rose-500"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Recipient Account Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block font-urdu">
              {method === "EasyPaisa" || method === "JazzCash"
                ? `اپنا ${method} نمبر اور اکاؤنٹ ٹائٹل درج کریں:`
                : method === "USDT_TRC20"
                ? "Enter your USDT TRC-20 Address (Tron):"
                : "Enter your USDT ERC-20 Address (Ethereum 0x...):"}
            </label>
            <input
              type="text"
              value={recipientWallet}
              onChange={(e) => setRecipientWallet(e.target.value)}
              placeholder={
                method === "EasyPaisa" || method === "JazzCash"
                  ? "03XXXXXXXXX (Muhammad Ali)"
                  : method === "USDT_TRC20"
                  ? "T..."
                  : "0x..."
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-rose-500 outline-none"
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs text-center font-bold font-urdu ${
              statusMessage.isError
                ? "bg-rose-950/80 border border-rose-600/30 text-rose-300"
                : "bg-emerald-950/80 border border-emerald-600/30 text-emerald-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-sm shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 font-urdu"
        >
          <span>پیسے نکلوانے کی درخواست بھیجیں (Request Cashout)</span>
        </button>
      </div>
    </div>
  );
}
