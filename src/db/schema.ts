import { pgTable, serial, text, timestamp, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";

// Platform & Owner Wallet Settings
export const ownerSettings = pgTable("owner_settings", {
  id: serial("id").primaryKey(),
  adminPin: text("admin_pin").default("owner2026").notNull(),
  platformName: text("platform_name").default("GoalRush Arena").notNull(),
  currency: text("currency").default("USD").notNull(), // USD or PKR
  usdToPkrRate: numeric("usd_to_pkr_rate", { precision: 10, scale: 2 }).default("280.00").notNull(),
  
  // Owner Active Payment Wallets (Exactly 4 Methods)
  // 1. EasyPaisa
  easypaisaNumber: text("easypaisa_number").default("03134876720").notNull(),
  easypaisaName: text("easypaisa_name").default("Allah Ditta Rabnawaz").notNull(),
  // 2. JazzCash
  jazzcashNumber: text("jazzcash_number").default("03134876720").notNull(),
  jazzcashName: text("jazzcash_name").default("Allah Ditta Rabnawaz").notNull(),
  // 3. USDT TRC20
  usdtTrc20: text("usdt_trc20").default("TV7QzoSkw9Patn8tFakrrg6BnNSCBBrNSJ").notNull(),
  // 4. USDT ERC20
  usdtErc20: text("usdt_erc20").default("0x3501ac1796263d50a5f7e78178a64997c7077dd6").notNull(),

  // Economics & House Edge
  houseRakePercent: numeric("house_rake_percent", { precision: 5, scale: 2 }).default("10.00").notNull(), // 10% fee on all matches
  adRewardRateUsd: numeric("ad_reward_rate_usd", { precision: 6, scale: 4 }).default("0.0500").notNull(), // $0.05 per ad view to owner
  minWithdrawal: numeric("min_withdrawal", { precision: 10, scale: 2 }).default("10.00").notNull(),
  minDeposit: numeric("min_deposit", { precision: 10, scale: 2 }).default("1.00").notNull(),
  welcomeBonusCoins: integer("welcome_bonus_coins").default(100).notNull(),
  
  // Owner accumulated totals
  totalRevenueUsd: numeric("total_revenue_usd", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalMatchRakeUsd: numeric("total_match_rake_usd", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalStoreSalesUsd: numeric("total_store_sales_usd", { precision: 14, scale: 2 }).default("0.00").notNull(),
  totalAdRevenueUsd: numeric("total_ad_revenue_usd", { precision: 14, scale: 2 }).default("0.00").notNull(),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users / Players
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").default("123456"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar").default("⚽").notNull(),
  selectedKit: text("selected_kit").default("classic_red").notNull(),
  selectedBall: text("selected_ball").default("pro_star").notNull(),
  
  // Balances
  balanceUsd: numeric("balance_usd", { precision: 10, scale: 2 }).default("10.00").notNull(), // Starting demo balance $10
  coins: integer("coins").default(250).notNull(), // Starting coins
  
  // Stats
  matchesPlayed: integer("matches_played").default(0).notNull(),
  matchesWon: integer("matches_won").default(0).notNull(),
  goalsScored: integer("goals_scored").default(0).notNull(),
  penaltySaves: integer("penalty_saves").default(0).notNull(),
  totalWagered: numeric("total_wagered", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalWon: numeric("total_won", { precision: 12, scale: 2 }).default("0.00").notNull(),
  
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  lastDailyReward: timestamp("last_daily_reward"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Owner Revenue Ledger (Every match rake, store purchase, and ad view is logged here)
export const ownerRevenueLogs = pgTable("owner_revenue_logs", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(), // 'match_rake', 'store_purchase', 'ad_view', 'tournament_rake', 'deposit_fee'
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }).notNull(),
  amountPkr: numeric("amount_pkr", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  metaData: jsonb("meta_data"), // e.g. { matchId, stake, rakePercent, txHash }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions (Deposits, Withdrawals, Winnings, Store Purchases)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'coin_purchase', 'match_stake', 'match_win', 'ad_reward', 'bonus'
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }).notNull(),
  coinsAmount: integer("coins_amount").default(0),
  paymentMethod: text("payment_method"), // 'USDT_TRC20', 'JazzCash', 'EasyPaisa', 'Solana', 'Bank', 'InAppCoins'
  status: text("status").default("completed").notNull(), // 'pending', 'approved', 'rejected', 'completed'
  txReference: text("tx_reference"), // User's Transaction ID / Sender number
  recipientWallet: text("recipient_wallet"), // Owner or User destination wallet
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches Record
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  gameMode: text("game_mode").notNull(), // 'penalty_shootout', 'stadium_1v1', 'crossbar_challenge', 'tournament'
  player1Id: integer("player1_id").references(() => users.id).notNull(),
  player2Name: text("player2_name").default("AI Goalkeeper Pro").notNull(),
  stakeUsd: numeric("stake_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  stakeCoins: integer("stake_coins").default(0).notNull(),
  houseRakeUsd: numeric("house_rake_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  payoutUsd: numeric("payout_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  playerScore: integer("player_score").default(0).notNull(),
  opponentScore: integer("opponent_score").default(0).notNull(),
  winnerId: integer("winner_id"),
  isDraw: boolean("is_draw").default(false),
  difficulty: text("difficulty").default("medium").notNull(), // 'easy', 'medium', 'pro', 'legend'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shop Items
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  urduName: text("urdu_name").notNull(),
  category: text("category").notNull(), // 'ball', 'kit', 'boost', 'coin_pack'
  description: text("description").notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  priceCoins: integer("price_coins").default(0).notNull(),
  coinsGiven: integer("coins_given").default(0),
  icon: text("icon").notNull(),
  color: text("color").default("#3b82f6").notNull(),
  perk: text("perk"), // e.g. "+15% Shot Power", "Flame Trail", "Double Coin Bonus"
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
