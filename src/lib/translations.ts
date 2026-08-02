export type Language = "ur" | "en";

export const translations = {
  ur: {
    appName: "گول رش ارینا (GoalRush Arena)",
    appTagline: "کھیلو فٹ بال اور جیتو اصل انعامات - مالک کی خودکار کمائی سسٹم کے ساتھ",
    
    // Nav & Common
    playNow: "کھیل شروع کریں",
    modes: "گیم موڈز",
    adminPanel: "مالک کا کنٹرول پینل (Owner Dashboard)",
    shop: "دکان / کوائنز پیک",
    deposit: "رقم جمع کریں",
    withdraw: "پیسے نکلوائیں",
    balance: "بیلنس",
    coins: "کوائنز",
    guestPlayer: "کھلاڑی",
    ownerMode: "مالک موڈ",
    soundOn: "آواز آن",
    soundOff: "آواز بند",
    dailyBonus: "روزانہ انعام",
    spinWheel: "لکی وہیل",
    leaderboard: "ٹاپ رینکنگ",
    matchHistory: "میچ ہسٹری",
    
    // Game Modes
    penaltyShootout: "پینلٹی شوٹ آؤٹ پرو",
    penaltyShootoutDesc: "بال کو سوائپ کر کے گول کیپر کو چکمہ دیں اور گول کریں!",
    match1v1: "1v1 فٹ بال چیمپئن شپ",
    match1v1Desc: "پچ پر دوڑیں، پاس کریں، ڈاج کریں اور 60 سیکنڈ میں میچ جیتیں!",
    crossbarChallenge: "کراس بار اور ٹارگٹ ماسٹر",
    crossbarDesc: "ہلتے ہوئے ٹارگٹ اور کراس بار کو ہٹ کر کے بڑا انعام جیتیں!",
    tournamentMode: "عالمی ٹورنامنٹ ارینا",
    tournamentDesc: "بڑا کیش پرائز پول - فاتح کو مکمل رقم ملے گی!",
    
    // Gameplay Texts
    stakeAmount: "میچ کی رقم (Stake)",
    houseCommissionNotice: "اس میچ پر 10% ہاؤس کمیشن مالک کے والٹ میں جمع ہو گا",
    potentialWin: "ممکنہ انعام (Payout)",
    swipeToShoot: "شوٹ کرنے کے لیے بال کو ڈریگ / سوائپ کریں",
    kickPower: "طاقت",
    curve: "گھماؤ (Curve)",
    goalText: "گوووووول! 🎉",
    savedText: "اوہ! کیپر نے بچا لیا 🧤",
    missedText: "بال باہر چلی گئی! ❌",
    postHitText: "کراس بار ہٹ! ⚡",
    youWon: "مبارک ہو! آپ جیت گئے 🏆",
    youLost: "میچ ختم! دوبارہ کوشش کریں 💔",
    rematch: "دوبارہ کھیلیں",
    returnLobby: "لابی میں جائیں",
    
    // Owner Earning & Admin Panel
    ownerDashboardTitle: "مالک کی کل کمائی اور والٹ کنٹرول روم",
    ownerDashboardSubtitle: "ہر کھلاڑی کے کھیلنے، ڈپازٹ کرنے اور کوائنز خریدنے سے آپ کے والٹ میں فوری کمائی آ رہی ہے",
    totalOwnerEarnings: "مالک کی کل کمائی (Total Revenue)",
    matchRakeRevenue: "میچ ہاؤس کمیشن (Match Rake)",
    storeSalesRevenue: "اسٹور و کوائنز کی فروخت",
    adRevenueEarned: "اشتہارات سے کمائی",
    activePlayers: "کل کھلاڑی",
    totalMatchesPlayed: "کل کھیلے گئے میچز",
    
    // Wallet Settings
    walletSettingsTitle: "مالک کے والٹ کی ترتیبات (Owner Payout Wallets)",
    walletSettingsDesc: "اپنے کرپٹو، جاز کیش، ایزی پیسہ یا بینک اکاؤنٹس درج کریں جہاں صارفین کی پیمنٹس اور پلیٹ فارم فیس براہ راست موصول ہو گی۔",
    cryptoWallets: "کرپٹو والٹس (USDT TRC20, SOL, BTC)",
    localWallets: "پاکستانی والٹس (JazzCash / EasyPaisa / Bank)",
    saveWalletChanges: "والٹ سیٹنگز محفوظ کریں",
    changesSavedSuccess: "والٹ کی ترتیبات کامیابی سے اپ ڈیٹ ہو گئیں!",
    
    // Economics Control
    houseRakeRate: "ہاؤس کمیشن فیصد (House Rake %)",
    adRateSetting: "ہر اشتہار پر مالک کا منافع ($)",
    minWithdrawalSetting: "کم از کم رقم نکلوانے کی حد",
    
    // Transactions
    pendingDeposits: "نئے ڈپازٹ کی تصدیق",
    approveDeposit: "منظور کریں",
    rejectDeposit: "مسترد کریں",
    noPendingRequests: "کوئی زیر التوا درخواست نہیں",
    
    // Store
    buyCoinsTitle: "کوائنز اور خصوصی فٹ بال پیک خریدیں",
    buyCoinsDesc: "100% رقم مالک کے والٹ میں جمع ہو گی",
    instantCredit: "فوری کریڈٹ",
    price: "قیمت",
    buyNow: "ابھی خریدیں",
    
    // Daily & Ads
    watchAdGetCoins: "ویڈیو دیکھ کر +25 کوائنز حاصل کریں (مالک کو ایڈ ریونیو ملتا ہے)",
    adWatchedSuccess: "مبارک ہو! 25 کوائنز مل گئے اور مالک کو ریونیو منتقل ہو گیا!",
    dailySpinAvailable: "آج کا مفت اسپن گھمائیں!",
    spinBtn: "اسپن کریں 🎯",
    
    // Instructions
    howItWorksTitle: "یہ سسٹم کیسے کام کرتا ہے؟",
    howItWorks1: "1. لوگ پینلٹی اور میچز کھیلنے کے لیے اپنے فنڈز یا کوائنز لگاتے ہیں۔",
    howItWorks2: "2. ہر میچ کا کٹوتی ہاؤس کمیشن (10%) خود بخود مالک کے اکاؤنٹ میں جمع ہوتا ہے۔",
    howItWorks3: "3. کوائنز کی خریداری کی رقم براہ راست مالک کے USDT / JazzCash / EasyPaisa والٹ میں آتی ہے۔",
  },
  en: {
    appName: "GoalRush Arena",
    appTagline: "Play Real Football & Win Big - Automated Owner Revenue System",
    
    // Nav & Common
    playNow: "Play Now",
    modes: "Game Modes",
    adminPanel: "Owner Dashboard",
    shop: "Coin Shop & Packs",
    deposit: "Deposit Funds",
    withdraw: "Withdraw",
    balance: "Balance",
    coins: "Coins",
    guestPlayer: "Player",
    ownerMode: "Owner Mode",
    soundOn: "Sound ON",
    soundOff: "Sound OFF",
    dailyBonus: "Daily Bonus",
    spinWheel: "Lucky Spin",
    leaderboard: "Leaderboard",
    matchHistory: "Match History",
    
    // Game Modes
    penaltyShootout: "Penalty Shootout Pro",
    penaltyShootoutDesc: "Flick to curve, shoot past the dynamic AI Goalkeeper and score!",
    match1v1: "1v1 Stadium Match",
    match1v1Desc: "Sprint, tackle, pass and score in this fast-paced 60s soccer duel!",
    crossbarChallenge: "Crossbar & Target Master",
    crossbarDesc: "Hit targets & crossbars for big payout multipliers!",
    tournamentMode: "World Cup Arena",
    tournamentDesc: "High stakes knockout bracket with mega prize pot!",
    
    // Gameplay Texts
    stakeAmount: "Match Stake",
    houseCommissionNotice: "A 10% platform rake is automatically secured for the Owner",
    potentialWin: "Potential Win (Payout)",
    swipeToShoot: "Swipe / Drag the ball to kick & add curve!",
    kickPower: "Power",
    curve: "Curve",
    goalText: "GOAAAL! 🎉",
    savedText: "SAVED BY KEEPER! 🧤",
    missedText: "OFF TARGET! ❌",
    postHitText: "CROSSBAR HIT! ⚡",
    youWon: "VICTORY! YOU WON 🏆",
    youLost: "MATCH OVER! TRY AGAIN 💔",
    rematch: "Play Again",
    returnLobby: "Lobby",
    
    // Owner Earning & Admin Panel
    ownerDashboardTitle: "Owner Master Revenue & Wallet Control",
    ownerDashboardSubtitle: "Real-time earnings from player match rakes, coin purchases & ads directly to your wallets",
    totalOwnerEarnings: "Total Owner Earnings",
    matchRakeRevenue: "Match House Rake",
    storeSalesRevenue: "Store & Coin Sales",
    adRevenueEarned: "Ad Network Revenue",
    activePlayers: "Active Players",
    totalMatchesPlayed: "Total Matches Played",
    
    // Wallet Settings
    walletSettingsTitle: "Owner Payout Wallets Configuration",
    walletSettingsDesc: "Configure your Crypto, JazzCash, EasyPaisa and Bank accounts to receive 100% of player deposits & platform rakes.",
    cryptoWallets: "Crypto Wallets (USDT TRC20, SOL, BTC)",
    localWallets: "Local Pakistani Wallets (JazzCash, EasyPaisa, Bank)",
    saveWalletChanges: "Save Wallet Configuration",
    changesSavedSuccess: "Wallet configurations updated successfully!",
    
    // Economics Control
    houseRakeRate: "House Rake Percentage (%)",
    adRateSetting: "Ad CPM Payout per view ($)",
    minWithdrawalSetting: "Minimum Withdrawal ($)",
    
    // Transactions
    pendingDeposits: "Deposit Verifications",
    approveDeposit: "Approve",
    rejectDeposit: "Reject",
    noPendingRequests: "No pending requests",
    
    // Store
    buyCoinsTitle: "Buy Coins & Exclusive Football Gear",
    buyCoinsDesc: "100% proceeds credit directly to Owner's Master Wallet",
    instantCredit: "Instant Credit",
    price: "Price",
    buyNow: "Buy Now",
    
    // Daily & Ads
    watchAdGetCoins: "Watch Video to get +25 Bonus Coins (Generates Owner Ad Revenue)",
    adWatchedSuccess: "Awesome! +25 Coins added & Owner earned ad revenue!",
    dailySpinAvailable: "Claim your Daily Free Lucky Spin!",
    spinBtn: "Spin Wheel 🎯",
    
    // Instructions
    howItWorksTitle: "How This Owner Revenue System Works:",
    howItWorks1: "1. Players stake funds/coins to play penalty shootouts & 1v1 soccer matches.",
    howItWorks2: "2. The system deducts the configured House Commission (e.g. 10%) on every game directly to your Owner Vault.",
    howItWorks3: "3. When players purchase Coin Packs, payments go to your configured USDT / JazzCash / EasyPaisa Wallets.",
  }
};
