import { db } from "@/db";
import { ownerSettings, users, shopItems, ownerRevenueLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getOrCreateOwnerSettings() {
  try {
    const existing = await db.select().from(ownerSettings).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const [created] = await db
      .insert(ownerSettings)
      .values({
        adminPin: "owner2026",
        platformName: "GoalRush Arena",
        currency: "USD",
        usdToPkrRate: "280.00",
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
        
        houseRakePercent: "10.00",
        adRewardRateUsd: "0.0500",
        minWithdrawal: "10.00",
        minDeposit: "1.00",
        welcomeBonusCoins: 250,
        totalRevenueUsd: "482.50", // demo initial seed for realistic dashboard
        totalMatchRakeUsd: "215.00",
        totalStoreSalesUsd: "240.00",
        totalAdRevenueUsd: "27.50",
      })
      .returning();

    // Also populate default shop items if empty
    const items = await db.select().from(shopItems).limit(1);
    if (items.length === 0) {
      await db.insert(shopItems).values([
        {
          name: "Starter Coin Pack",
          urduName: "اسٹارٹر کوائن پیک",
          category: "coin_pack",
          description: "500 Game Coins to play penalty matches & tournaments",
          priceUsd: "2.00",
          priceCoins: 0,
          coinsGiven: 500,
          icon: "🪙",
          color: "#f59e0b",
          perk: "Instant Credit",
          isFeatured: true,
        },
        {
          name: "Pro Striker Pack",
          urduName: "پرو اسٹرائیکر پیک",
          category: "coin_pack",
          description: "1,500 Game Coins + 10% Extra Bonus for champions",
          priceUsd: "5.00",
          priceCoins: 0,
          coinsGiven: 1650,
          icon: "💰",
          color: "#10b981",
          perk: "+10% Extra Free",
          isFeatured: true,
        },
        {
          name: "Legendary VIP Whale Pack",
          urduName: "لیجنڈری وی آئی پی پیک",
          category: "coin_pack",
          description: "5,000 Coins + Golden Ball Skin + VIP Gold Crown",
          priceUsd: "15.00",
          priceCoins: 0,
          coinsGiven: 5000,
          icon: "👑",
          color: "#8b5cf6",
          perk: "+25% Extra Free + Golden Ball",
          isFeatured: true,
        },
        {
          name: "Fireball Meteor",
          urduName: "آگ کا گولہ فٹ بال",
          category: "ball",
          description: "Blazing fire trail effect with +10% shot speed boost",
          priceUsd: "3.50",
          priceCoins: 350,
          coinsGiven: 0,
          icon: "🔥",
          color: "#ef4444",
          perk: "+10% Shot Velocity",
          isFeatured: false,
        },
        {
          name: "Golden Trophy Ball",
          urduName: "سنہری ٹرافی فٹ بال",
          category: "ball",
          description: "Glittering gold football with high curve multiplier",
          priceUsd: "4.00",
          priceCoins: 400,
          coinsGiven: 0,
          icon: "⚽",
          color: "#eab308",
          perk: "+15% Curve Control",
          isFeatured: false,
        },
        {
          name: "Neon Matrix Kit",
          urduName: "نیون میٹرکس کٹ",
          category: "kit",
          description: "Cyber glowing uniform with sprint stamina boost",
          priceUsd: "3.00",
          priceCoins: 300,
          coinsGiven: 0,
          icon: "👕",
          color: "#06b6d4",
          perk: "Speed Boost",
          isFeatured: false,
        },
      ]);
    }

    // Also populate some demo logs if empty
    const demoLogs = await db.select().from(ownerRevenueLogs).limit(1);
    if (demoLogs.length === 0) {
      await db.insert(ownerRevenueLogs).values([
        {
          sourceType: "match_rake",
          amountUsd: "1.00",
          amountPkr: "280.00",
          description: "10% House Rake from $10 Penalty Match between Player & AI",
          userName: "Hamza_R9",
          metaData: { matchMode: "penalty_shootout", stake: 10, houseRake: 1 },
        },
        {
          sourceType: "store_purchase",
          amountUsd: "5.00",
          amountPkr: "1400.00",
          description: "Store Sale: Pro Striker 1,650 Coins Pack",
          userName: "Zeeshan_Pro",
          metaData: { item: "Pro Striker Pack" },
        },
        {
          sourceType: "ad_view",
          amountUsd: "0.05",
          amountPkr: "14.00",
          description: "Rewarded Video Ad CPM revenue from User Ali_Kick",
          userName: "Ali_Kick",
          metaData: { adNetwork: "Unity/AdMob simulated" },
        },
      ]);
    }

    return created;
  } catch (error) {
    console.error("Error in getOrCreateOwnerSettings:", error);
    throw error;
  }
}

export async function getOrCreateUser(username?: string) {
  try {
    const targetUsername = username || "Player_1";
    const existing = await db.select().from(users).where(eq(users.username, targetUsername)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const [created] = await db
      .insert(users)
      .values({
        username: targetUsername,
        displayName: targetUsername.replace("_", " "),
        balanceUsd: "10.00",
        coins: 300,
        matchesPlayed: 0,
        matchesWon: 0,
        goalsScored: 0,
        penaltySaves: 0,
        avatar: "⚽",
      })
      .returning();

    return created;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}
