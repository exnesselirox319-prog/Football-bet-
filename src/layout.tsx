import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalRush Arena - Football Game with Owner Revenue & Master Wallet",
  description: "Play real-time football penalties, 1v1 soccer matches, and target challenges with automated owner revenue and wallet payouts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ur" dir="ltr" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
