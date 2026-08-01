"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Coins, Sparkles, Check, Zap, X, ShieldCheck } from "lucide-react";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface ShopModalProps {
  userCoins: number;
  onSuccess: (updatedUser: any) => void;
  onClose: () => void;
  lang: Language;
}

export function ShopModal({ userCoins, onSuccess, onClose, lang }: ShopModalProps) {
  const t = translations[lang];

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store/purchase")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItems(data.items || []);
      })
      .catch((err) => console.error("Error loading store:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (item: any) => {
    soundFx.playClick();
    setBuyingId(item.id);
    setFeedback(null);

    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();
      if (data.success) {
        soundFx.playCoin();
        if (data.user) onSuccess(data.user);
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(data.error || "Purchase failed");
      }
    } catch {
      setFeedback("Network error");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-yellow-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black font-urdu">{t.shop} (Coin Shop & Power Packs)</h3>
              <p className="text-xs text-slate-400 font-urdu">{t.buyCoinsDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-400">
              <Coins className="w-4 h-4" />
              <span>{userCoins} Coins</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold text-center font-urdu">
            {feedback}
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 p-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-slate-950 border flex flex-col justify-between space-y-4 relative overflow-hidden ${
                item.isFeatured
                  ? "border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {item.isFeatured && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                  Popular
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10"
                    style={{ backgroundColor: `${item.color}25` }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{item.name}</h4>
                    <span className="text-xs text-slate-400 font-urdu">{item.urduName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{item.description}</p>

                {item.perk && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 text-[11px] font-bold border border-slate-800">
                    <Sparkles className="w-3 h-3" />
                    <span>{item.perk}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Price</span>
                  <div className="text-base font-black text-white font-mono">
                    {parseFloat(item.priceUsd) > 0
                      ? `$${item.priceUsd}`
                      : `${item.priceCoins} Coins`}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={buyingId === item.id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1 font-urdu"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {t.buyNow}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
