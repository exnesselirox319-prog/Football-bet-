"use client";

import React, { useState } from "react";
import { DollarSign, QrCode, Copy, Check, ShieldCheck, Zap, ArrowRight, X } from "lucide-react";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface DepositModalProps {
  ownerWallets: {
    easypaisaNumber: string;
    easypaisaName: string;
    jazzcashNumber: string;
    jazzcashName: string;
    usdtTrc20: string;
    usdtErc20: string;
    usdToPkrRate: string;
  };
  onSuccess: (updatedUser: any) => void;
  onClose: () => void;
  lang: Language;
}

export function DepositModal({ ownerWallets, onSuccess, onClose, lang }: DepositModalProps) {
  const t = translations[lang];

  // Exactly 4 Owner Methods
  const [method, setMethod] = useState<"EasyPaisa" | "JazzCash" | "USDT_TRC20" | "USDT_ERC20">("EasyPaisa");
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [txRef, setTxRef] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rate = parseFloat(ownerWallets.usdToPkrRate || "280");
  const pkrEquivalent = (amountUsd * rate).toFixed(0);

  const activeWalletAddress =
    method === "EasyPaisa"
      ? `${ownerWallets.easypaisaNumber} (${ownerWallets.easypaisaName})`
      : method === "JazzCash"
      ? `${ownerWallets.jazzcashNumber} (${ownerWallets.jazzcashName})`
      : method === "USDT_TRC20"
      ? ownerWallets.usdtTrc20 || "TV7QzoSkw9Patn8tFakrrg6BnNSCBBrNSJ"
      : ownerWallets.usdtErc20 || "0x3501ac1796263d50a5f7e78178a64997c7077dd6";

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(activeWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (isInstantDemo: boolean = false) => {
    soundFx.playClick();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd,
          paymentMethod: method,
          txReference: txRef,
          isInstantDemo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundFx.playCoin();
        if (data.user) onSuccess(data.user);
        setMessage(data.message);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setMessage(data.error || "Deposit failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black font-urdu">{t.deposit} (Deposit Funds)</h3>
              <p className="text-xs text-slate-400 font-urdu">
                رقم براہ راست گیم کے مالک کے والٹ میں جمع ہو گی
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Selector Tabs - Only 4 Allowed Methods */}
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
              className={`py-2 px-1.5 rounded-xl text-center transition ${
                method === item.id
                  ? "bg-emerald-500 text-slate-950 shadow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Owner Wallet Info Display & QR Code */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
          <QRCodeDisplay
            text={
              method === "EasyPaisa"
                ? ownerWallets.easypaisaNumber
                : method === "JazzCash"
                ? ownerWallets.jazzcashNumber
                : method === "USDT_TRC20"
                ? ownerWallets.usdtTrc20 || "TV7QzoSkw9Patn8tFakrrg6BnNSCBBrNSJ"
                : ownerWallets.usdtErc20 || "0x3501ac1796263d50a5f7e78178a64997c7077dd6"
            }
            size={130}
            label={`Owner's ${method} QR`}
          />

          <div className="w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block font-urdu">
                مالک کا تصدیق شدہ والٹ (Allah Ditta Rabnawaz):
              </span>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
                👑 Verified Owner
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-emerald-500/40 mt-1 shadow-inner">
              <span className="text-xs font-mono font-bold text-white truncate flex-1 text-left">
                {activeWalletAddress}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                title="Copy Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Deposit Amount Picker */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Select Amount ($ USD):</span>
            <span className="font-mono text-emerald-400 font-bold">≈ ₨ {pkrEquivalent} PKR</span>
          </div>

          <div className="flex gap-2">
            {[5, 10, 25, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setAmountUsd(val)}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition ${
                  amountUsd === val
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={txRef}
            onChange={(e) => setTxRef(e.target.value)}
            placeholder="Transaction ID / Sender Phone Number (TID / TxHash)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-emerald-500 outline-none mt-2"
          />
        </div>

        {message && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/30 text-emerald-300 text-xs text-center font-bold font-urdu">
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Instant Demo Deposit (Great for demoing full system) */}
          <button
            onClick={() => handleSubmitDeposit(true)}
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Instant Demo Deposit (${amountUsd} + Bonus Coins)</span>
          </button>

          {/* Submit Real Transaction for Owner Verification */}
          <button
            onClick={() => handleSubmitDeposit(false)}
            disabled={submitting}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition font-urdu"
          >
            مالک کی تصدیق کے لیے ٹرانزیکشن جمع کریں (Manual Submission)
          </button>
        </div>
      </div>
    </div>
  );
}
