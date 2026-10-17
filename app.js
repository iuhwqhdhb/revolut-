(() => {
  "use strict";

  const STORE = "revolut-style-demo-v4";
  const FX_STORE = "revolut-demo-reference-fx";
  const brandAssets = window.REVOLUT_DEMO_ASSETS || {};
  const currencies = { GBP: { symbol: "£", flag: "🇬🇧", name: "British Pound" }, EUR: { symbol: "€", flag: "🇪🇺", name: "Euro" }, USD: { symbol: "$", flag: "🇺🇸", name: "US Dollar" } };
  const flagSvg = (code) => {
    const head = '<svg class="flag-svg" viewBox="0 0 40 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
    if (code === "GBP") return `${head}<rect width="40" height="40" fill="#012169"/><path d="M-4-3 44 43M44-3-4 43" stroke="#fff" stroke-width="11"/><path d="M-4-3 44 43M44-3-4 43" stroke="#c8102e" stroke-width="4"/><path d="M20 0v40M0 20h40" stroke="#fff" stroke-width="13"/><path d="M20 0v40M0 20h40" stroke="#c8102e" stroke-width="6"/></svg>`;
    if (code === "EUR") return `${head}<rect width="40" height="40" fill="#003399"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${(20 + 10 * Math.sin(i * Math.PI / 6)).toFixed(2)}" cy="${(20 - 10 * Math.cos(i * Math.PI / 6)).toFixed(2)}" r="1.2" fill="#ffcc00"/>`).join("")}</svg>`;
    return `${head}<rect width="40" height="40" fill="#b22234"/>${Array.from({ length: 6 }, (_, i) => `<rect y="${3 + i * 6}" width="40" height="3" fill="#fff"/>`).join("")}<rect width="21" height="20" fill="#3c3b6e"/>${Array.from({ length: 3 }, (_, row) => Array.from({ length: 4 }, (_, col) => `<circle cx="${3 + col * 5}" cy="${3 + row * 6}" r=".85" fill="#fff"/>`).join("")).join("")}</svg>`;
  };
  const contacts = ["Alex", "Maya", "Sam", "Jamie", "Taylor"];
  const sampleTime = (daysAgo, hour, minute) => { const d = new Date(); d.setHours(hour, minute, 0, 0); d.setDate(d.getDate() - daysAgo); return d.toISOString(); };
  const sampleTx = (id, name, amount, category, daysAgo, hour, minute, iconChar, logo, tone) => ({ id, name, amount, currency: "GBP", category, occurredAt: sampleTime(daysAgo, hour, minute), icon: iconChar, logo, tone });
  const initialTransactions = [
    sampleTx(1, "Salary", 2850, "Income", 0, 9, 14, "↙", null, "green"),
    sampleTx(2, "Starbucks", -4.80, "Food & drink", 0, 8, 32, "S", "starbucks", "green"),
    sampleTx(3, "Tesco", -42.60, "Groceries", 1, 18, 26, "T", "tesco", "blue"),
    sampleTx(4, "Uber", -9.20, "Transport", 1, 9, 4, "U", "uber", "slate"),
    sampleTx(5, "Netflix", -12.99, "Subscriptions", 2, 13, 20, "N", "netflix", "pink"),
    sampleTx(6, "IKEA", -36.40, "Shopping", 3, 20, 51, "I", "ikea", "blue"),
    sampleTx(7, "Spotify", -9.99, "Subscriptions", 4, 17, 12, "S", "spotify", "green"),
    sampleTx(8, "Tesco", -31.25, "Groceries", 6, 16, 45, "T", "tesco", "blue"),
    sampleTx(9, "Uber", -14.70, "Transport", 9, 19, 10, "U", "uber", "slate"),
    sampleTx(10, "Starbucks", -6.10, "Food & drink", 12, 10, 15, "S", "starbucks", "green"),
    sampleTx(11, "Tesco", -58.35, "Groceries", 17, 17, 30, "T", "tesco", "blue"),
    sampleTx(12, "IKEA", -24.90, "Shopping", 23, 14, 8, "I", "ikea", "blue"),
    sampleTx(13, "Netflix", -12.99, "Subscriptions", 32, 13, 20, "N", "netflix", "pink"),
    sampleTx(14, "Tesco", -47.15, "Groceries", 48, 17, 0, "T", "tesco", "blue"),
    sampleTx(15, "Spotify", -9.99, "Subscriptions", 90, 17, 12, "S", "spotify", "green")
  ];
  const dateLabel = (iso) => { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "Sample activity"; const now = new Date(); const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const diff = Math.round((today - day) / 86400000); const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(d); return `${diff === 0 ? "Today" : diff === 1 ? "Yesterday" : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d)} · ${time}`; };
  function getSaved() {
    try {
      const current = JSON.parse(localStorage.getItem(STORE) || "null");
      if (current) return current;
      const previous = JSON.parse(localStorage.getItem("revolut-style-demo-v3") || localStorage.getItem("revolut-style-demo-v1") || "null");
      if (!previous) return null;
      const updatedSamples = { 2: ["Starbucks", "starbucks", "green"], 3: ["Tesco", "tesco", "blue"], 4: ["Uber", "uber", "slate"], 5: ["Netflix", "netflix", "pink"], 6: ["IKEA", "ikea", "blue"], 7: ["Spotify", "spotify", "green"] };
      if (Array.isArray(previous.transactions)) previous.transactions = previous.transactions.map((tx) => {
        const replacement = updatedSamples[tx.id];
        return replacement ? { ...tx, name: replacement[0], logo: replacement[1], tone: replacement[2] } : tx;
      });
      return previous;
    } catch { return null; }
  }
  const saved = getSaved() || {};
  const data = {
    balances: { GBP: 8642.78, EUR: 430.20, USD: 0, ...(saved.balances || {}), ...(!saved.profileName && saved.balances?.USD === 75 ? { USD: 0 } : {}) },
    transactions: (Array.isArray(saved.transactions) ? saved.transactions : initialTransactions).map((tx) => ({ ...tx, occurredAt: tx.occurredAt || (initialTransactions.find((sample) => sample.id === tx.id) || {}).occurredAt || new Date().toISOString() })),
    trading: saved.trading || { positions: {}, orders: [], prices: {}, day: 0 },
    frozen: !!saved.frozen,
    virtual: !!saved.virtual,
    budget: Number(saved.budget) > 0 ? Number(saved.budget) : 500,
    profileName: saved.profileName || "Larpz Wallet",
    username: saved.username || "larpzwallet",
    investBalance: Number(saved.investBalance) || 0,
    cryptoBalance: Number(saved.cryptoBalance) || 0,
    revPoints: Number(saved.revPoints) || 0,
    theme: saved.theme || "minimal",
    language: saved.language || "en"
  };
  const ui = { tab: "home", account: saved.homeCurrency && currencies[saved.homeCurrency] ? saved.homeCurrency : "USD", card: "physical", analytics: "spent", range: "1M", sheet: null, form: {}, error: "" };
  const fx = { status: "loading", date: "", rates: null };
  const $ = (s) => document.querySelector(s);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const fmt = (value, currency = "GBP") => new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(Number(value) || 0);
  const heroFmt = (value, currency) => `${currency === "USD" ? "$" : currencies[currency].symbol}${new Intl.NumberFormat("en-US", { maximumFractionDigits: Number(value) % 1 ? 2 : 0 }).format(Number(value) || 0)}`;
  const initials = () => data.profileName.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  const num = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { /* Private browsing can disable storage. */ } };
  const paths = {
    back: '<path d="m14 5-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    cards: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',
    payments: '<path d="M4 8h15m0 0-4-4m4 4-4 4M20 16H5m0 0 4-4m-4 4 4 4"/>',
    analytics: '<rect x="3" y="12" width="4" height="9" rx="2" fill="currentColor" stroke="none"/><rect x="10" y="3" width="4" height="18" rx="2" fill="currentColor" stroke="none"/><rect x="17" y="8" width="4" height="13" rx="2" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 4v16M4 12h16" stroke-linecap="round"/>',
    arrowUp: '<path d="M12 20V4m0 0-6 6m6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/>',
    arrows: '<path d="M4 8h16m0 0-4-4m4 4-4 4M20 16H4m0 0 4-4m-4 4 4 4" stroke-linecap="round" stroke-linejoin="round"/>',
    details: '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h8M8 12h8M8 16h5" stroke-linecap="round"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5" stroke-linecap="round"/>',
    chevron: '<path d="m9 5 7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="m5 9 7 7 7-7" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M5 5 19 19M19 5 5 19" stroke-linecap="round"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    shield: '<path d="m12 2 8 4v5c0 5-3 8-8 11-5-3-8-6-8-11V6z"/><path d="m9 12 2 2 4-4"/>',
    settings: '<path d="m9 3 .7-1h4.6l.7 3 2 .9 2.8-.9 2.2 4-2.1 2v2l2.1 2-2.2 4-2.8-.9-2 .9-.7 3H9.7L9 19l-2-.9-2.8.9L2 15l2.1-2v-2L2 9l2.2-4 2.8.9L9 5z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01" stroke-linecap="round"/>',
    check: '<path d="m4 12 5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 9h8m-8 4h8"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8m-5 0h5v5" stroke-linecap="round" stroke-linejoin="round"/>',
    bank: '<path d="m3 9 9-5 9 5M4 10h16M6 10v9m4-9v9m4-9v9m4-9v9M3 20h18" stroke-linecap="round" stroke-linejoin="round"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6 9 7 9-7" stroke-linejoin="round"/>',
    chats: '<path d="M3 5h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3a3 3 0 0 1-2-3z"/><path d="M18 9h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2l-2 2v-2"/>',
    user: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2z"/>',
    document: '<path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v5h5M8 13h8M8 17h6"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7L12 12.5V15m0 3h.01" stroke-linecap="round"/>',
    reset: '<path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6" stroke-linecap="round" stroke-linejoin="round"/>',
    camera: '<path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3"/>',
    coins: '<ellipse cx="9" cy="6" rx="6" ry="2.5"/><path d="M3 6v4c0 1.4 2.7 2.5 6 2.5 1 0 2-.1 2.8-.3M3 10v4c0 1.4 2.7 2.5 6 2.5"/><ellipse cx="16" cy="15" rx="5" ry="2.5"/><path d="M11 15v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4"/>',
    funds: '<rect x="5" y="3" width="14" height="18" rx="4"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/>',
    invest: '<path d="M4 20v-6m5 6V9m5 11v-5m5 5V6" stroke-linecap="round"/><path d="m3 9 5-4 5 3 7-5" stroke-linecap="round" stroke-linejoin="round"/>',
    contactless: '<path d="M4 8c3 2 3 6 0 8m4-11c5 4 5 10 0 14m4-16c7 5 7 13 0 18" stroke-linecap="round"/><rect x="15" y="8" width="6" height="8" rx="1"/>',
    limit: '<circle cx="12" cy="12" r="9"/><path d="M7 16a6 6 0 0 1 10 0M12 13l3-3" stroke-linecap="round"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M8 4l4 4 4-4M8 20l4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/>',
    crypto: '<path d="M8 3v18m4-18v18M5 6h9a3 3 0 0 1 0 6H5m0 0h10a3 3 0 0 1 0 6H5" stroke-linecap="round" stroke-linejoin="round"/>',
    rewards: '<path d="m12 2 8.5 5v10L12 22l-8.5-5V7z" stroke-linejoin="round"/><path d="M12 8v8m-4-4h8" stroke-linecap="round"/>',
    moreDots: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>'
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths[name] || paths.info}</svg>`;
  const logoLine = () => `<div class="brand-line"><img class="official-wordmark" src="${brandAssets["revolut-official-wordmark"] || ""}" alt="Revolut"></div>`;
  const transactionRow = (tx) => `<button class="transaction" data-act="transaction" data-id="${esc(tx.id)}"><span class="merchant-icon ${esc(tx.tone || "slate")} ${tx.logo?.startsWith("trading-") ? "trade-merchant " + esc(tx.logo) : ""}">${tx.logo && brandAssets[tx.logo] ? `<img class="merchant-logo" src="${brandAssets[tx.logo]}" alt="">` : esc(tx.icon || "•")}</span><span class="tx-meta"><span class="tx-name">${esc(tx.name)}</span><span class="tx-sub">${esc(dateLabel(tx.occurredAt))} · ${esc(tx.category)}</span></span><span class="tx-amount ${Number(tx.amount) > 0 ? "positive" : ""}">${Number(tx.amount) > 0 ? "+" : "−"}${fmt(Math.abs(tx.amount), tx.currency)}<small>${esc(tx.currency)}</small></span></button>`;
  const app = $("#app"), nav = $("#navigation"), overlay = $("#overlay-root"), scroll = $("#app-scroll");

  const screenHeader = (title, action = "", symbol = "moreDots", label = "More") => `<header class="screen-header"><button class="plain-icon" data-act="tab" data-tab="home" aria-label="Back to Home">${icon("back")}</button><h1>${title}</h1>${action ? `<button class="plain-icon" data-act="${action}" aria-label="${label}">${icon(symbol)}</button>` : '<span></span>'}</header>`;
  const miniCard = (virtual = false) => `<span class="mini-card-art ${virtual ? "disposable" : "blue"}"><img class="mini-card-brand" src="${brandAssets["revolut-official-mark-white"] || ""}" alt=""><span class="mini-card-lock">${icon("lock")}</span>${virtual ? "" : `<img class="mini-visa" src="${brandAssets.visa || ""}" alt="Visa">`}</span>`;
  function spendingTrend(currency) {
    const now = new Date(), days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daily = Array(days).fill(0);
    for (const tx of data.transactions) {
      const d = new Date(tx.occurredAt);
      if (tx.currency === currency && tx.amount < 0 && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && d <= now) daily[d.getDate() - 1] -= tx.amount;
    }
    let total = 0;
    const cumulative = daily.map(value => total += value), max = Math.max(1, total);
    const points = [[0, 66], ...cumulative.slice(0, now.getDate()).map((value, i) => [(i + 1) / days * 320, 66 - value / max * 52])];
    const end = points[points.length - 1];
    return `<span class="spend-trend"><svg viewBox="0 0 320 80" preserveAspectRatio="none" role="img" aria-label="Cumulative spending this month"><path d="M${points.map(p => p.join(",")).join(" L")}" fill="none" stroke="currentColor" stroke-width="2"/><path d="M${end.join(",")}H320" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 4"/></svg><span class="trend-axis">${[1, 5, 10, 15, 20, 25, days].map(day => `<span>${day}</span>`).join("")}</span></span>`;
  }

  function renderHomeRefined() {
    const cur = ui.account;
    const txs = data.transactions.filter((t) => t.currency === cur).slice(0, 6);
    const spent = monthSpending(cur);
    const fxLine = fx.status === "ready" ? `1 GBP ≈ ${fx.rates.EUR.toFixed(4)} EUR` : fx.status === "cached" ? `Cached: 1 GBP ≈ ${fx.rates.EUR.toFixed(4)} EUR` : fx.status === "loading" ? "Loading reference rate…" : "Reference rate unavailable";
    const topActions = [
      ["plus", "Add money", "add"],
      ["arrows", "Move", "move"],
      ["bank", "Details", "details"],
      ["moreDots", "More", "more"]
    ];
    return `<div class="page home-page">
      <header class="home-top">
          <button class="avatar" data-act="profile" aria-label="Open profile">${esc(initials())}</button>
          <button class="home-search" data-act="search">${icon("search")}<span>Search</span></button>
          <button class="home-top-icon" data-act="analytics" aria-label="Analytics">${icon("analytics")}</button>
          <button class="home-top-icon" data-act="cards" aria-label="Cards">${icon("cards")}</button>
      </header>
      <div class="home-hero">
        <div class="hero-balance">
          <div class="balance-context">Personal · ${cur}</div>
          <div class="balance ${data.balances[cur] >= 1000000 ? "long-balance" : ""}">${heroFmt(data.balances[cur], cur).replace(/\.(\d{1,2})$/, '<span class="balance-cents">.$1</span>')}</div>
          <button class="account-pill" data-act="accounts">Accounts ${icon("down")}</button>
          
        </div>
        <div class="hero-dots" aria-label="Switch account">${Object.keys(currencies).map(code => `<button class="account-dot ${code === cur ? "active" : ""}" data-act="select-account" data-currency="${code}" aria-label="${currencies[code].name}" aria-pressed="${code === cur}"><i></i></button>`).join("")}</div>
        <div class="actions">${topActions.map(([i, label, action]) => `<button class="action" data-act="${action}"><span class="bubble">${icon(i)}</span>${label}</button>`).join("")}</div>
      </div>
      <div class="home-activity-card">${txs.length ? txs.slice(0, 3).map(transactionRow).join("") + `<button class="activity-all" data-act="payments">See all ${icon("chevron")}</button>` : `<button class="home-empty-activity" data-act="payments"><span class="activity-symbol">${icon("arrows")}</span><span>No transactions yet<small>Your activity will appear here</small></span></button>`}</div>
      <section class="home-cards-panel"><button class="home-panel-heading" data-act="cards">Cards ${icon("chevron")}</button><div class="home-mini-cards">
        <button data-act="cards" aria-label="Open disposable card">${miniCard(true)}<strong>Disposable</strong><small>Generate</small></button>
        <button data-act="cards" aria-label="Open Blue card">${miniCard()}<strong>Blue</strong><small>••1234</small></button>
        <button data-act="new-card"><span class="mini-card-art new">${icon("plus")}</span><strong>Get card</strong><small>Virtual</small></button>
      </div></section>
      <section class="wealth-panel"><button class="home-panel-heading" data-act="wealth">Cash balance ${icon("chevron")}</button><strong class="wealth-total">${heroFmt(data.balances[cur], cur)}</strong><button class="wealth-row" data-act="accounts"><span class="wealth-icon cash">${icon("coins")}</span><span>Cash</span><b>${heroFmt(data.balances[cur], cur)}</b></button><button class="wealth-row funds-row" data-act="funds"><span class="wealth-icon funds">${icon("funds")}</span><span>Flexible Cash Funds</span><b>${heroFmt(0, cur)} ${icon("chevron")}</b></button><button class="wealth-row" data-act="invest"><span class="wealth-icon invest">${icon("invest")}</span><span>Invest</span><b>${fmt(portfolioValue("stock"), "USD")}</b></button><button class="wealth-row" data-act="crypto"><span class="wealth-icon crypto">${icon("crypto")}</span><span>Crypto</span><b>${fmt(portfolioValue("crypto"), "USD")}</b></button></section>
      <button class="feature-card refined-spending" data-act="analytics"><span class="feature-top"><span>Spent this month</span>${icon("chevron")}</span><span class="feature-total">${heroFmt(spent, cur)}</span>${spendingTrend(cur)}</button>
      <div class="section-head"><h2>Accounts</h2><button class="text-button" data-act="accounts">See all ${icon("chevron")}</button></div>
      <div class="home-account-list">${Object.entries(currencies).slice(0, 2).map(([code, c]) => `<button class="home-account-row" data-act="select-account" data-currency="${code}"><span class="account-flag">${flagSvg(code)}</span><span><strong>${c.name}</strong><small>Main account</small></span><b>${fmt(data.balances[code], code)}</b></button>`).join("")}</div>
      <button class="fx-reference" data-act="refresh-rates"><span><strong>Reference exchange rate</strong><small>${esc(fxLine)} · ${fx.date ? esc(fx.date) : "Public market data"}</small></span><span class="fx-refresh" aria-hidden="true">↻</span></button>
    </div>`;
  }

  function renderCards() {
    const virtual = ui.card === "virtual";
    return `<div class="page cards-page">${screenHeader("Cards", "new-card", "plus", "Add a card")}
      <div class="segmented card-tabs"><button class="${!virtual ? "selected" : ""}" data-act="card-tab" data-card="physical">Physical</button><button class="${virtual ? "selected" : ""}" data-act="card-tab" data-card="virtual">Virtual</button></div>
      ${virtual && !data.virtual ? `<div class="card-empty">${miniCard(true)}<h2>A card for online spending</h2><p>Create a virtual card to explore the controls.</p><button class="primary" data-act="new-card">Get a virtual card</button></div>` : `<div class="card-stage"><div class="card-art ${virtual ? "virtual" : ""}"><img class="card-corner-mark" src="${brandAssets["revolut-official-mark-white"] || ""}" alt="Revolut"><div class="card-chip"></div><div class="card-bottom"><span>•••• ${virtual ? "6789" : "1234"}</span><b class="card-visa"><img src="${brandAssets.visa || ""}" alt="Visa"></b></div>${data.frozen ? `<div class="card-frozen">${icon("snow")}<span>Frozen</span></div>` : ""}</div></div>
      <h2 class="card-name">${virtual ? "Virtual" : "Blue"}<span>•• ${virtual ? "6789" : "1234"}</span></h2>
      <div class="card-controls">${[["eye", "Details", "card-details"], ["snow", data.frozen ? "Unfreeze" : "Freeze", "freeze"], ["settings", "Settings", "card-settings"]].map(([i, label, act]) => `<button class="card-control ${act === "freeze" && data.frozen ? "is-frozen" : ""}" data-act="${act}"><span>${icon(i)}</span>${label}</button>`).join("")}</div>
      <div class="list-surface card-options"><button class="setting-row" data-act="card-settings"><span class="row-icon">${icon("limit")}</span><span class="row-title">Spending limits<small>Manage your monthly limit</small></span><span class="chev">${icon("chevron")}</span></button><button class="setting-row" data-act="card-security"><span class="row-icon">${icon("shield")}</span><span class="row-title">Security<small>Online and contactless payments</small></span><span class="chev">${icon("chevron")}</span></button></div>
      <button class="secondary card-add" data-act="new-card">${icon("plus")} Add new</button>`}
    </div>`;
  }

  function renderPayments() {
    const activity = data.transactions.filter(tx => tx.currency === ui.account).slice(0, 12);
    return `<div class="page payments-page"><header class="payments-top"><button class="avatar" data-act="profile" aria-label="Open profile">${esc(initials())}</button><h1>Payments</h1><button class="round-icon" data-act="more" aria-label="More payment options">${icon("moreDots")}</button></header>
      <button class="payment-search" data-act="search">${icon("search")}<span>Name, @Revtag, phone, email</span></button>
      <div class="payment-actions">${[["arrowUp", "Send", "send"], ["plus", "Request", "request"], ["bank", "Bank transfer", "bank"]].map(([i, label, act]) => `<button class="payment-action" data-act="${act}"><span>${icon(i)}</span>${label}</button>`).join("")}</div>
      <div class="section-head"><h2>Recent</h2><button class="text-button" data-act="send">See all</button></div><div class="contact-list">${contacts.map(n => `<button class="contact" data-act="contact" data-name="${esc(n)}"><span class="contact-avatar">${esc(n[0])}</span>${esc(n)}</button>`).join("")}</div>
      <div class="section-head"><h2>Transactions</h2><button class="text-button" data-act="search">See all</button></div><div class="list-surface">${activity.length ? activity.map(transactionRow).join("") : `<div class="empty-payments"><span>${icon("payments")}</span><strong>No transactions yet</strong><p>Your payments will appear here.</p><button class="secondary" data-act="send">Make a payment</button></div>`}</div>
    </div>`;
  }

  function monthSpending(currency = "GBP") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return num(data.transactions.filter((tx) => tx.currency === currency && tx.amount < 0 && new Date(tx.occurredAt).getTime() >= start && new Date(tx.occurredAt).getTime() <= now.getTime()).reduce((sum, tx) => sum - tx.amount, 0));
  }
  function monthBars(count, currency = "GBP") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    const bars = Array.from({ length: count }, () => ({ value: 0 }));
    for (const tx of data.transactions) {
      if (tx.currency !== currency || tx.amount >= 0) continue;
      const time = new Date(tx.occurredAt).getTime();
      if (time < start || time > now.getTime()) continue;
      const index = Math.min(count - 1, Math.floor((time - start) / (end - start) * count));
      bars[index].value -= tx.amount;
    }
    return bars;
  }
  function periodStats(view, range, count, currency = ui.account) {
    const days = { "1W": 7, "1M": 30, "6M": 183, "1Y": 365 }[range] || 30;
    const endDate = new Date(); endDate.setHours(23, 59, 59, 999);
    const end = endDate.getTime() + 1;
    const start = range === "1M" ? new Date(endDate.getFullYear(), endDate.getMonth(), 1).getTime() : end - days * 86400000;
    const previousStart = range === "1M" ? new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1).getTime() : start - days * 86400000;
    const barCount = count || (range === "1Y" ? 12 : range === "1W" ? 7 : 6);
    const bars = Array.from({ length: barCount }, (_, i) => {
      const point = new Date(start + ((i + .5) / barCount) * (end - start));
      const label = range === "1W" ? new Intl.DateTimeFormat("en-GB", { weekday: "narrow" }).format(point) : range === "1M" ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(point) : new Intl.DateTimeFormat("en-GB", { month: "short" }).format(point);
      return { label, value: 0 };
    });
    const categories = {};
    let total = 0, previous = 0;
    for (const tx of data.transactions) {
      if (tx.currency !== currency || (view === "spent" ? tx.amount >= 0 : tx.amount <= 0)) continue;
      const time = new Date(tx.occurredAt).getTime();
      if (!Number.isFinite(time) || time > Date.now()) continue;
      const value = Math.abs(Number(tx.amount) || 0);
      if (time >= previousStart && time < start) previous += value;
      if (time < start || time >= end) continue;
      total += value;
      categories[tx.category] = (categories[tx.category] || 0) + value;
      const index = Math.min(barCount - 1, Math.floor(((time - start) / (end - start)) * barCount));
      bars[index].value += value;
    }
    return { total: num(total), previous: num(previous), bars, categories: Object.entries(categories).sort((a, b) => b[1] - a[1]) };
  }
  function renderAnalytics() {
    const stats = periodStats(ui.analytics, ui.range);
    const max = Math.max(1, ...stats.bars.map((bar) => bar.value));
    const comparison = stats.previous ? `${stats.total >= stats.previous ? "↑" : "↓"} ${Math.round(Math.abs(stats.total - stats.previous) / stats.previous * 100)}% ${stats.total >= stats.previous ? "more" : "less"} than previous period` : "No activity in the previous period";
    const categoryIcons = { "Food & drink": "receipt", Shopping: "cards", Transport: "arrows", Subscriptions: "calendar", Groceries: "bank", Payments: "payments", Income: "coins" };
    const categoryRows = stats.categories.length ? stats.categories.map(([cat, value]) => `<div class="breakdown-row"><span class="cat-icon">${icon(categoryIcons[cat] || "receipt")}</span><span class="cat-main"><strong>${esc(cat)}</strong><small>${Math.round(value / Math.max(stats.total, 1) * 100)}% of ${ui.analytics}</small></span><span class="cat-amount">${fmt(value, ui.account)}</span></div>`).join("") : '<div class="empty-state">No activity in this period.</div>';
    const chart = stats.bars.map((bar) => `<div class="chart-col" title="${esc(bar.label)}: ${fmt(bar.value, ui.account)}"><i style="height:${bar.value ? Math.max(5, Math.round(bar.value / max * 100)) : 2}%"></i><small>${esc(bar.label)}</small></div>`).join("");
    const monthlySpent = monthSpending(ui.account);
    return `<div class="page analytics-page">${screenHeader("Analytics", "analytics-info", "info", "About analytics")}<div class="segmented"><button class="${ui.analytics === "spent" ? "selected" : ""}" data-act="analytics-view" data-view="spent">Spent</button><button class="${ui.analytics === "income" ? "selected" : ""}" data-act="analytics-view" data-view="income">Income</button></div><div class="analytics-hero"><p>${ui.analytics === "spent" ? "Total spent" : "Total income"} · ${ui.account}</p><strong>${fmt(stats.total, ui.account)}</strong><div class="compare">${comparison}</div></div><div class="section-head"><h2>Overview</h2></div><div class="segmented">${["1W", "1M", "6M", "1Y"].map((r) => `<button class="${r === ui.range ? "selected" : ""}" data-act="range" data-range="${r}">${r}</button>`).join("")}</div><div class="chart" aria-label="${esc(ui.analytics)} chart from sample transactions">${chart}</div><div class="section-head"><h2>${ui.analytics === "spent" ? "Categories" : "Sources"}</h2></div><div class="list-surface category-list">${categoryRows}</div><div class="budget-card"><strong>Monthly budget</strong><p>${fmt(monthlySpent, ui.account)} of ${fmt(data.budget, ui.account)} used this month</p><div class="progress-track"><i style="width:${Math.min(100, Math.round(monthlySpent / data.budget * 100))}%"></i></div><button class="text-button" data-act="budget">Change budget</button></div></div>`;
  }

  // Real asset identities; deliberately simulated USD quotes for offline paper trading.
  const instruments = [
    ['AAPL','Apple','stock',220],['MSFT','Microsoft','stock',420],['NVDA','NVIDIA','stock',140],['TSLA','Tesla','stock',250],['AMZN','Amazon','stock',200],['GOOGL','Alphabet','stock',180],['META','Meta Platforms','stock',550],['NFLX','Netflix','stock',95],['AMD','AMD','stock',150],['COIN','Coinbase','stock',220],['SPY','SPDR S&P 500 ETF','stock',580],['QQQ','Invesco QQQ ETF','stock',500],
    ['BTC','Bitcoin','crypto',95000],['ETH','Ethereum','crypto',3200],['SOL','Solana','crypto',180],['XRP','XRP','crypto',2.4],['DOGE','Dogecoin','crypto',.25],['ADA','Cardano','crypto',.75],['AVAX','Avalanche','crypto',35],['LINK','Chainlink','crypto',20],['LTC','Litecoin','crypto',100],['DOT','Polkadot','crypto',5],['SHIB','Shiba Inu','crypto',.00002],['SUI','Sui','crypto',3.5]
  ].map(([symbol,name,kind,initial])=>({symbol,name,kind,initial}));
  const instrument = symbol => instruments.find(a=>a.symbol===symbol);
  const quote = a => Number(data.trading.prices[a.symbol]) > 0 ? data.trading.prices[a.symbol] : a.initial;
  const holding = a => data.trading.positions[a.symbol] || {quantity:0,cost:0};
  const portfolioValue = kind => instruments.filter(a=>a.kind===kind).reduce((sum,a)=>sum+holding(a).quantity*quote(a),0);
  const usdPrice = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:n<.01?6:2,maximumFractionDigits:n<.01?8:2}).format(n);
  const units = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:8}).format(n);
  const assetLogo = a => `<span class="ticker-mark asset-logo logo-${a.symbol.toLowerCase()}"><img src="${brandAssets["trading-"+a.symbol.toLowerCase()]}" alt="${esc(a.name)} logo" width="32" height="32"></span>`;
  function assetRow(a, owned=false) {
    const h=holding(a),v=h.quantity*quote(a),pnl=num(v-h.cost);
    return `<button class="market-row" data-act="trade-open" data-symbol="${a.symbol}" data-market-label="${a.symbol} ${a.name}">${assetLogo(a)}<span class="market-name"><strong>${a.name}</strong><small>${owned?new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(h.quantity)+' '+a.symbol+' · '+usdPrice(quote(a)):a.symbol}</small></span><span class="market-value"><strong>${usdPrice(owned?v:quote(a))}</strong><small class="${owned?(pnl>=0?'gain':'loss'):''}">${owned?(pnl>=0?'▲ ':'▼ ')+(h.cost?Math.abs(pnl/h.cost*100).toFixed(2):'0.00')+'%':'Simulated price'}</small></span></button>`;
  }
  let marketView = "overview";
  const splitUSD = value => { const parts = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value).split("."); return `${parts[0]}<span class="balance-cents">.${parts[1]}</span>`; };
  function renderPortfolio(title) {
    const kind=title==='Invest'?'stock':'crypto', list=instruments.filter(a=>a.kind===kind), owned=list.filter(a=>holding(a).quantity>0),value=portfolioValue(kind), cost=owned.reduce((sum,a)=>sum+holding(a).cost,0), pnl=num(value-cost);
    const orders=data.trading.orders.filter(o=>instrument(o.symbol)?.kind===kind).slice(0,8);
    const percent = cost > 0 ? Math.abs(pnl / cost * 100).toFixed(2) : '0.00';
    return `<div class="page market-page market-${kind}">
      <div class="market-wallpaper">
        <header class="home-top market-top"><button class="avatar" data-act="profile" aria-label="Open profile">${esc(initials())}</button><button class="home-search" data-act="market-discover">${icon('search')}<span>Search ${kind==='stock'?'stocks':'crypto'}</span></button><button class="home-top-icon" data-act="market-options" aria-label="Trading options">${icon('moreDots')}</button></header>
        <div class="market-tabs"><button class="${marketView==='overview'?'selected':''}" data-act="market-view" data-view="overview">${title}</button><button class="${marketView==='discover'?'selected':''}" data-act="market-view" data-view="discover">Discover</button></div>
        <div class="market-hero"><p>${kind==='stock'?'Capital at risk':'Crypto portfolio'} <span class="paper-label">· Demo</span></p><h2>${splitUSD(value)}</h2><span class="portfolio-return ${pnl>=0?'gain':'loss'}">${pnl>=0?'+':''}${fmt(pnl,'USD')} <span>${pnl>=0?'▲':'▼'} ${percent}%</span></span></div>
        <div class="actions market-actions">${[['trend','Trade','market-discover'],['plus','Add money','market-funding'],['arrowUp','Withdraw','market-withdraw'],['moreDots','More','market-options']].map(([i,label,act])=>`<button class="action" data-act="${act}"><span class="bubble">${icon(i)}</span>${label}</button>`).join('')}</div>
      </div>
      <div class="market-overview" ${marketView==='discover'?'hidden':''}>
        <section class="holdings-panel"><div class="holdings-heading"><span class="holdings-symbol">${icon(kind==='stock'?'invest':'crypto')}</span><span><strong>${kind==='stock'?'Stocks & ETFs':'Crypto'}</strong><small>${fmt(value,'USD')} <em class="${pnl>=0?'gain':'loss'}">${pnl>=0?'▲':'▼'} ${percent}%</em></small></span><button class="plain-icon" data-act="market-discover" aria-label="Explore assets">${icon('chevron')}</button></div>${owned.length?owned.map(a=>assetRow(a,true)).join(''):`<div class="holdings-empty"><strong>Your first investment starts here</strong><p>Explore ${kind==='stock'?'stocks and ETFs':'coins'} and invest with demo money.</p><button class="secondary" data-act="market-discover">Explore ${kind==='stock'?'stocks':'crypto'}</button></div>`}</section>
        <button class="cash-account-row" data-act="market-funding"><span class="cash-account-icon">${flagSvg('USD')}</span><span><strong>Available to invest</strong><small>US dollar · shared demo cash</small></span><b>${fmt(data.balances.USD,'USD')}</b>${icon('chevron')}</button>
        <div class="section-head"><h2>${kind==='stock'?'Popular stocks':'Explore crypto'}</h2><button class="text-button" data-act="market-discover">See all</button></div><div class="list-surface">${list.slice(0,4).map(a=>assetRow(a)).join('')}</div>
        ${orders.length?`<div class="section-head"><h2>Transactions</h2></div><div class="list-surface">${orders.map(o=>`<div class="order-row"><span><strong>${o.side==='buy'?'Bought':'Sold'} ${o.symbol}</strong><small>${units(o.quantity)} units · day ${o.day}</small></span><b>${fmt(o.total,'USD')}</b></div>`).join('')}</div>`:''}
      </div>
      <div class="market-discover-panel" ${marketView==='discover'?'':'hidden'}><div class="section-head"><h2>${kind==='stock'?'Stocks & ETFs':'All crypto'}</h2><span class="muted tiny">${list.length} assets</span></div><input class="text-field market-search" id="market-search" aria-label="Search assets" placeholder="Search name or symbol" data-field="marketSearch"><div id="market-results" class="list-surface">${list.map(a=>assetRow(a)).join('')}</div><div id="market-no-results" class="empty-state" hidden>No matching assets</div></div>
      <div class="simulation-footer"><span>Paper trading · simulated prices · day ${data.trading.day}</span><button data-act="market-step">Simulate next day ${icon('chevron')}</button></div>
    </div>`;
  }
  function rootMarketSearch(term) {
    document.querySelectorAll('#market-results [data-market-label]').forEach(row=>row.hidden=!row.dataset.marketLabel.toLowerCase().includes(term));
    const any=Array.from(document.querySelectorAll('#market-results [data-market-label]')).some(row=>!row.hidden);
    $('#market-no-results').hidden=any;
  }
  function renderTradeSheet() {
    const a=instrument(ui.form.symbol);if(!a){close();return;}
    const h=holding(a),sell=ui.form.side==='sell';
    overlay.innerHTML=sheetFrame(a.name,`<div class="asset-heading">${assetLogo(a)}<span>${a.symbol}<strong>${usdPrice(quote(a))}</strong></span></div><p class="market-disclosure">Simulated USD price · day ${data.trading.day}</p><div class="segmented"><button class="${!sell?'selected':''}" data-act="trade-side" data-side="buy">Buy</button><button class="${sell?'selected':''}" data-act="trade-side" data-side="sell">Sell</button></div><p class="sheet-sub">${sell?`${units(h.quantity)} ${a.symbol} available`:`${fmt(data.balances.USD,'USD')} cash available`}</p><label class="field-label" for="trade-input">${sell?'Units to sell':'Amount to invest (USD)'}</label><input id="trade-input" class="money-field" data-field="tradeAmount" type="number" min="0" step="any" inputmode="decimal" placeholder="0.00" value="${esc(ui.form.tradeAmount||'')}"><div class="trade-presets">${(sell?[25,50,100]:[25,100,500]).map(n=>`<button data-act="trade-preset" data-value="${n}">${sell?n+'%':'$'+n}</button>`).join('')}</div><p id="trade-estimate" class="sheet-sub"></p>${error()}<button class="primary" data-act="trade-review">Review ${sell?'sale':'purchase'}</button><p class="market-disclosure">Fractional units · no simulated fees</p>`, 'trade');
    updateTradeEstimate();
  }
  function tradeNumbers() {
    const a=instrument(ui.form.symbol),amount=Number(ui.form.tradeAmount),sell=ui.form.side==='sell';
    const quantity=sell?amount:Math.floor(amount/quote(a)*1e8)/1e8;
    return {a,quantity,total:num(quantity*quote(a)),sell,price:quote(a)};
  }
  function updateTradeEstimate() {
    const n=tradeNumbers();const el=$('#trade-estimate');
    if(el) el.textContent=Number.isFinite(n.quantity)&&n.quantity>0?`${n.sell?'Receive':'Buy approximately'} ${n.sell?fmt(n.total,'USD'):units(n.quantity)+' '+n.a.symbol}`:'Enter an amount to preview your order.';
  }
  function validateTrade(n) {
    if(!Number.isFinite(n.quantity)||n.quantity<=0||!Number.isFinite(n.total)||n.total<.01) return 'Enter an order worth at least $0.01.';
    if(n.sell&&n.quantity>holding(n.a).quantity) return 'You cannot sell more units than you own.';
    if(!n.sell&&n.total>data.balances.USD) return 'Not enough USD demo cash. Add funds or enter a smaller amount.';
    return '';
  }
  function handleTradingAction(btn) {
    const act=btn.dataset.act;
    if(act==='market-view') {marketView=btn.dataset.view; render(true);return true;}
    if(act==='market-discover') {close();marketView='discover';render(true); $('#market-search')?.focus();return true;}
    if(act==='market-funding') {open('market-funding');return true;}
    if(act==='market-withdraw') {open('market-withdraw');return true;}
    if(act==='market-options') {open('market-options');return true;}
    if(act==='market-cash') {ui.account='USD';data.homeCurrency='USD';persist();ui.tab='home';close();render(true);return true;}

    if(act==='demo-funds') { close(); if(data.balances.USD>999990000){return true;}data.balances.USD=num(data.balances.USD+10000);addTransaction('Demo trading funds',10000,'Income','+','green','USD');render();return true; }
    if(act==='market-step') { close(); instruments.forEach(a=>{const max=a.kind==='crypto'?.08:.035;data.trading.prices[a.symbol]=Math.max(.00000001,Number((quote(a)*(1+(Math.random()-.5)*2*max)).toPrecision(10)));});data.trading.day++;persist();render();return true; }
    if(act==='trade-open'){open('trade',{symbol:btn.dataset.symbol,side:'buy',tradeAmount:''});return true;}
    if(act==='trade-side'){ui.form.side=btn.dataset.side;ui.form.tradeAmount='';ui.error='';renderSheet();return true;}
    if(act==='trade-preset'){const a=instrument(ui.form.symbol);ui.form.tradeAmount=ui.form.side==='sell'?holding(a).quantity*Number(btn.dataset.value)/100:Number(btn.dataset.value);ui.error='';renderSheet();return true;}
    if(act==='trade-review'){
      const n=tradeNumbers(),err=validateTrade(n);if(err){showError(err);return true;}
      ui.form.review={symbol:n.a.symbol,quantity:n.quantity,total:n.total,price:n.price,sell:n.sell};
      overlay.innerHTML=sheetFrame('Review order',`<div class="review-box"><div><span>Asset</span><strong>${n.a.name} (${n.a.symbol})</strong></div><div><span>Order</span><strong>${n.sell?'Sell':'Buy'}</strong></div><div><span>Units</span><strong>${units(n.quantity)}</strong></div><div><span>Simulated price</span><strong>${usdPrice(n.price)}</strong></div><div><span>Total USD</span><strong>${fmt(n.total,'USD')}</strong></div></div><p class="sheet-sub">This order only changes your demo holdings and USD cash.</p><button class="primary" data-act="trade-confirm">Confirm demo ${n.sell?'sale':'purchase'}</button><button class="secondary" data-act="trade-back">Back</button>`,'trade-review');return true;
    }
    if(act==='trade-back'){renderSheet();return true;}
    if(act==='trade-confirm') {
      const r=ui.form.review;if(!r||ui.sheet!=='trade')return true;
      const n={...r,a:instrument(r.symbol)},err=validateTrade(n);if(err){showError(err);return true;}
      if(quote(n.a)!==r.price){showError('Price changed. Review your order again.');return true;}
      const h=holding(n.a),remaining=n.sell?h.quantity-n.quantity:h.quantity+n.quantity;
      const cost=n.sell?(remaining<1e-10?0:h.cost*(remaining/h.quantity)):h.cost+n.total;
      const realized=n.sell?num(n.total-h.cost*n.quantity/h.quantity):0;
      data.trading.positions[n.a.symbol]={quantity:remaining<1e-10?0:remaining,cost};
      data.balances.USD=num(data.balances.USD+(n.sell?n.total:-n.total));
      data.trading.orders.unshift({symbol:n.a.symbol,side:n.sell?'sell':'buy',quantity:n.quantity,total:n.total,price:n.price,realized,day:data.trading.day,at:new Date().toISOString()});
      data.trading.orders=data.trading.orders.slice(0,500);
      addTransaction(`${n.sell?'Sold':'Bought'} ${n.a.symbol}`,n.sell?n.total:-n.total,'Investments',n.sell?'↙':'↗','blue','USD');
      success(n.sell?'Demo sale complete':'Demo investment complete',`${units(n.quantity)} ${n.a.symbol} · ${fmt(n.total,'USD')}${n.sell?' · Realised P/L '+fmt(realized,'USD'):''}`);return true;
    }
    return false;
  }

  function renderRewards() {
    return `<div class="page portfolio-page"><div class="portfolio-top"><button class="avatar" data-act="profile" aria-label="Open profile">${esc(initials())}</button><button class="round-icon" data-act="settings" aria-label="Settings">${icon("settings")}</button></div><div class="page-heading"><h1>RevPoints</h1></div><div class="portfolio-symbol">${icon("rewards")}</div><div class="portfolio-balance">${new Intl.NumberFormat("en-US").format(data.revPoints)} points</div><div class="portfolio-info">Edit the number of sample points in Settings. Rewards are not connected to a real account.</div><button class="secondary" data-act="settings">Edit sample points</button></div>`;
  }
  function renderNav() {
    nav.innerHTML = `<nav class="bottom-nav" aria-label="Main navigation">${[["home", "Home", "home"], ["invest", "Invest", "invest"], ["payments", "Payments", "payments"], ["crypto", "Crypto", "crypto"], ["rewards", "RevPoints", "rewards"]].map(([key, label, i]) => `<button class="nav-item ${ui.tab === key ? "active" : ""}" data-act="tab" data-tab="${key}" ${ui.tab === key ? 'aria-current="page"' : ""}><span class="nav-icon">${key === "home" ? `<img class="nav-revolut-mark" src="${brandAssets["revolut-official-mark-white"] || ""}" alt="">` : icon(i)}</span>${label}</button>`).join("")}</nav>`;
  }
  const sheetFrame = (title, content, kind) => `<div class="sheet-scrim" data-act="close"></div><section class="sheet ${kind === "profile" || kind === "settings" ? "full-screen-sheet" : ""} ${kind === "profile" ? "profile-sheet" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">${kind === "profile" ? `<div class="profile-top"><button class="profile-close" data-act="close" aria-label="Close profile">${icon("close")}</button><button class="profile-upgrade" data-act="profile-section" data-section="Upgrade">${icon("rewards")} Upgrade</button></div>` : `<div class="grabber"></div><div class="sheet-head"><h2>${esc(title)}</h2><button data-act="close" aria-label="Close">${icon("close")}</button></div>`}<div class="sheet-content">${content}</div></section>`;
  const field = (label, key, placeholder = "") => `<label class="field-label" for="field-${key}">${esc(label)}</label><input class="text-field" id="field-${key}" data-field="${key}" placeholder="${esc(placeholder)}" value="${esc(ui.form[key] || "")}" autocomplete="off">`;
  const amountField = (currency = "GBP") => `<label class="field-label" for="field-amount">Amount (${currency})</label><input class="money-field" id="field-amount" data-field="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" value="${esc(ui.form.amount || "")}">`;
  const error = () => ui.error ? `<p class="error-text">${esc(ui.error)}</p>` : "";
  const option = (act, label, sub, symbol, extra = "") => `<button class="sheet-option" data-act="${act}" ${extra}><span class="opt-icon">${symbol}</span><span class="opt-text">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>${icon("chevron")}</button>`;
  function renderSheet() {
    if (!ui.sheet) { overlay.innerHTML = ""; return; }
    const kind = ui.sheet;
    if (kind === "trade") { renderTradeSheet(); return; }
    let content = "", title = "";
    if(kind==='market-funding') {title='Add money';content=`<div class="funding-balance"><small>Available USD cash</small><strong>${fmt(data.balances.USD,'USD')}</strong></div><p class="sheet-sub">Your investments use the same USD demo balance as Home.</p><button class="primary" data-act="demo-funds">Add $10,000 demo money</button><button class="secondary" data-act="market-cash">View USD account</button>`;}
    if(kind==='market-withdraw') {title='Withdraw';content=`<div class="funding-balance"><small>Available in your USD account</small><strong>${fmt(data.balances.USD,'USD')}</strong></div><p class="sheet-sub">Sale proceeds go straight to your shared USD demo balance. Sell a holding to turn it into cash.</p><button class="primary" data-act="market-cash">View USD account</button><button class="secondary" data-act="close">Back to portfolio</button>`;}
    if(kind==='market-options') {title='Trading options';content=`${option('market-discover','Explore assets','Search stocks or crypto',icon('search'))}${option('market-step','Simulate next day','Move demo prices to see gains and losses',icon('calendar'))}${option('market-funding','Add demo money','Top up your USD cash balance',icon('plus'))}<p class="sheet-sub">Real asset names and logos. Simulated prices and trades. No real brokerage account is connected.</p>`;}

    if (kind === "more") { title = "More"; content = `${option("send", "Send money", "Demo transfer", icon("arrowUp"))}${option("request", "Request money", "Demo request", icon("plus"))}${option("exchange", "Exchange", "Public reference rate", icon("arrows"))}${option("cards", "Cards", "Manage sample cards", icon("cards"))}${option("analytics", "Analytics", "See sample insights", icon("analytics"))}`; }
    if (kind === "move") { title = "Move money"; content = `${option("send", "Send money", "Transfer sample money", icon("arrowUp"))}${option("exchange", "Exchange", "Between demo currency accounts", icon("arrows"))}${option("request", "Request money", "Create a sample request", icon("plus"))}`; }
    if (kind === "profile") { title = "Profile"; content = `<div class="profile-header"><div class="profile-avatar">${esc(initials())}<button class="profile-photo" data-act="photo-info" aria-label="Profile photo">${icon("camera")}</button></div><h3>${esc(data.profileName)}</h3><p>@${esc(data.username)}</p></div><div class="profile-menu">${option("profile-section", "Invite friends", "Enjoy Revolut together", icon("mail"), 'data-section="Invite friends"')}${option("profile-section", "Chats", "", icon("chats"), 'data-section="Chats"')}${option("profile-section", "Personal info", "", icon("user"), 'data-section="Personal info"')}${option("details", "Account details", "", icon("bank"))}${option("profile-section", "Security", "", icon("shield"), 'data-section="Security"')}${option("profile-section", "Documents & statements", "", icon("document"), 'data-section="Documents & statements"')}${option("profile-section", "FAQ", "", icon("help"), 'data-section="FAQ"')}${option("settings", "Settings", "", icon("settings"))}</div><div class="profile-menu profile-logout">${option("reset-confirm", "Reset sample data", "Restore the starting demo", icon("reset"))}</div>`; }
    if (kind === "funds") { title = "Flexible Cash Funds"; content = `<p class="sheet-sub">This sample feature has a ${heroFmt(0, ui.account)} balance. No fund or investment account is connected.</p><button class="secondary" data-act="close">Back to Home</button>`; }
    if (kind === "settings") { title = "Settings"; const sf = (key, label, type = "text") => `<label class="settings-row"><span>${label}</span><input data-field="${key}" type="${type}" value="${esc(ui.form[key] ?? "")}" ${type === "number" ? 'min="0" step="any" inputmode="decimal"' : 'autocomplete="off"'}></label>`; content = `<p class="settings-subtitle">${esc(data.profileName)} · demo wallet</p><div class="settings-form">${sf("profileName", "Name")}${sf("username", "Username")}<div class="settings-row"><span>Photo</span><button data-act="photo-info">Choose</button></div><div class="settings-group-label">BALANCE</div>${sf("balance", "Amount", "number")}${sf("revPoints", "RevPoints", "number")}<label class="settings-row"><span>Currency</span><select data-field="currency">${Object.keys(currencies).map((code) => `<option value="${code}" ${ui.form.currency === code ? "selected" : ""}>${code} · ${currencies[code].name}</option>`).join("")}</select></label><div class="settings-group-label">THEME</div><div class="theme-picks">${[["glow", "Glow"], ["minimal", "Minimal"], ["colors", "Colors"]].map(([key, label]) => `<button data-act="theme" data-theme="${key}" class="theme-pick ${ui.form.theme === key ? "selected" : ""}"><span class="theme-preview ${key}"></span><small>${label}</small></button>`).join("")}</div><div class="settings-group-label">LANGUAGE</div><label class="settings-row"><span>Language</span><select data-field="language"><option value="en" ${ui.form.language === "en" ? "selected" : ""}>EN — English</option></select></label>${error()}<button class="primary settings-save" data-act="save-settings">Save</button><p class="settings-footer">Independent interface demo. Balances and activity are editable examples. No real Revolut account, card, or payment is connected.</p></div>`; }
    if (kind === "profile-section") { title = ui.form.section || "Profile"; content = `<p class="sheet-sub">${esc(title)} is a visual preview in this local demo. It is not linked to a Revolut account.</p><button class="secondary" data-act="back-profile">Back to profile</button>`; }
    if (kind === "preview-feature") { title = ui.form.section || "Card feature"; content = `<p class="sheet-sub">${esc(title)} is a visual preview for this sample card. No real card setting is changed.</p><button class="secondary" data-act="cards">Back to Cards</button>`; }
    if (kind === "photo-info") { title = "Profile photo"; content = `<p class="sheet-sub">This version uses initials from the sample profile name as the avatar.</p><button class="secondary" data-act="back-photo">Back to ${ui.form.returnTo === "settings" ? "Settings" : "Profile"}</button>`; }
    if (kind === "reset-confirm") { title = "Reset sample data?"; content = `<p class="sheet-sub">This restores the starting balances, cards, and activity saved in this browser.</p><button class="primary" data-act="reset">Reset demo</button><button class="secondary" data-act="back-profile">Cancel</button>`; }
    if (kind === "accounts") { title = "Accounts"; content = `<p class="sheet-sub">Switch between your sample currency accounts.</p>${Object.entries(currencies).map(([code, c]) => option("choose-account", c.name, fmt(data.balances[code], code), `<span class="currency-icon">${flagSvg(code)}</span>`, `data-currency="${code}"`)).join("")}`; }
    if (kind === "add") { title = "Add money"; content = `<p class="sheet-sub">Add sample money to your ${ui.account} balance.</p>${amountField(ui.account)}${error()}<div class="review-box"><div><span>From</span><strong>Demo funding source</strong></div><div><span>To</span><strong>${ui.account} account</strong></div></div><button class="primary" data-act="submit-add">Add demo money</button>`; }
    if (kind === "send") { title = "Send money"; content = `<p class="sheet-sub">Payments stay inside this demo.</p>${field("Recipient", "recipient", "Name or bank recipient")}${amountField(ui.account)}<div class="section-caption" style="margin-top:10px">Available: ${fmt(data.balances[ui.account], ui.account)}</div>${error()}<button class="primary" data-act="review-send">Continue</button>`; }
    if (kind === "review-send") { title = "Review payment"; content = `<div class="review-box"><div><span>Recipient</span><strong>${esc(ui.form.recipient)}</strong></div><div><span>Amount</span><strong>${fmt(ui.form.amount, ui.account)}</strong></div><div><span>Fee</span><strong>${fmt(0, ui.account)}</strong></div><div><span>Type</span><strong>Demo transfer</strong></div></div><p class="sheet-sub">Confirming changes only the sample balance and activity shown here.</p><button class="primary" data-act="confirm-send">Send demo payment</button><button class="secondary" data-act="back-send">Edit details</button>`; }
    if (kind === "request") { title = "Request money"; content = `<p class="sheet-sub">Create a simulated request. It will not reach anyone.</p>${field("From", "recipient", "Contact name")}${amountField(ui.account)}${error()}<button class="primary" data-act="submit-request">Create demo request</button>`; }
    if (kind === "exchange") { title = "Exchange"; const to = ui.form.to || (ui.account === "GBP" ? "EUR" : "GBP"); const rate = exchangeRate(ui.account, to); content = `<p class="sheet-sub">This simulation uses a dated public reference rate, not a Revolut quote. Revolut's rate and fees may differ.</p><div class="account-swap"><div class="account-mini"><small>From</small><strong>${ui.account}</strong><small>${fmt(data.balances[ui.account], ui.account)} available</small></div><div class="swap-arrow">→</div><div class="account-mini"><small>To</small><strong>${to}</strong><button data-act="cycle-to">Change currency</button></div></div>${amountField(ui.account)}<p class="section-caption" id="exchange-preview" style="margin-top:12px">${exchangePreview(ui.form.amount, ui.account, to)}</p><p class="fx-disclosure">${fx.status === "ready" ? `Reference published ${esc(fx.date)} · Frankfurter / central-bank data. Fees are not calculated.` : fx.status === "loading" ? "Loading reference rate…" : "Reference rate unavailable. Connect to the internet and refresh."}</p>${error()}<button class="primary" data-act="submit-exchange" ${rate === null ? "disabled" : ""}>Exchange demo money</button>${fx.status === "unavailable" ? '<button class="secondary" data-act="refresh-rates">Refresh rate</button>' : ""}`; }
    if (kind === "details") { title = "Account details"; content = `<p class="sheet-sub">Demo account information. No usable bank details are provided.</p><div class="review-box"><div><span>Account</span><strong>${ui.account} · Personal</strong></div><div><span>Name</span><strong>${esc(data.profileName)}</strong></div><div><span>Account number</span><strong>•••• ••••</strong></div><div><span>Sort code</span><strong>••-••-••</strong></div></div>`; }
    if (kind === "card-details") { title = "Card details"; content = `<p class="sheet-sub">Card details are intentionally masked in this simulation.</p><div class="review-box"><div><span>Card</span><strong>${ui.card === "virtual" ? "Virtual" : "Physical"} demo card</strong></div><div><span>Number</span><strong>•••• •••• •••• ${ui.card === "virtual" ? "6789" : "1234"}</strong></div><div><span>Expiry</span><strong>••/••</strong></div><div><span>Security code</span><strong>•••</strong></div></div>`; }
    if (kind === "card-settings") { title = "Spending limits"; content = `<p class="sheet-sub">Controls below illustrate how a card settings screen works.</p>${option("preview-feature", "Online payments", "Enabled for this demo", icon("cards"), 'data-section="Online payments"')}${option("preview-feature", "Contactless payments", "Enabled for this demo", icon("contactless"), 'data-section="Contactless payments"')}${option("preview-feature", "Monthly card limit", "Illustrative £2,000 limit", icon("limit"), 'data-section="Monthly card limit"')}`; }
    if (kind === "card-security") { title = "Security"; content = `<p class="sheet-sub">This demo contains no usable credentials or card number.</p>${option("freeze", data.frozen ? "Unfreeze card" : "Freeze card", data.frozen ? "Restore demo card activity" : "Pause demo card activity", icon("snow"))}${option("preview-feature", "Single-use virtual card", "Feature preview only", icon("cards"), 'data-section="Single-use virtual card"')}`; }
    if (kind === "card-info") { title = "About cards"; content = `<p class="sheet-sub">This section illustrates physical and virtual card controls.</p>`; }
    if (kind === "new-card") { title = "Create virtual card"; content = `<p class="sheet-sub">Add a sample virtual card to explore the card screen. No real card will be issued.</p><button class="primary" data-act="create-card">Create demo card</button>`; }
    if (kind === "budget") { title = "Monthly budget"; content = `<p class="sheet-sub">Set an illustrative spending target for the ${ui.account} analytics view.</p><label class="field-label" for="field-budget">Budget (${ui.account})</label><input class="money-field" id="field-budget" data-field="budget" type="number" min="1" step="1" inputmode="decimal" value="${esc(ui.form.budget ?? data.budget)}">${error()}<button class="primary" data-act="save-budget">Save budget</button>`; }
    if (kind === "transaction") { const tx = data.transactions.find((t) => String(t.id) === String(ui.form.txId)); title = "Transaction"; content = tx ? `<div class="success-mark" style="width:62px;height:62px;margin-top:5px;font-size:30px;background:#343c59">${esc(tx.icon)}</div><div class="success-title">${esc(tx.name)}</div><div class="success-sub" style="font-size:22px;color:#fff">${tx.amount > 0 ? "+" : "−"}${fmt(Math.abs(tx.amount), tx.currency)}</div><div class="review-box"><div><span>Date</span><strong>${esc(dateLabel(tx.occurredAt))}</strong></div><div><span>Category</span><strong>${esc(tx.category)}</strong></div><div><span>Account</span><strong>${esc(tx.currency)}</strong></div><div><span>Status</span><strong>Simulated</strong></div></div>` : '<p class="sheet-sub">Transaction unavailable.</p>'; }
    if (kind === "search") { title = "Search activity"; const term = String(ui.form.query || "").toLowerCase(); const matches = data.transactions.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(term)); content = `<input class="text-field" data-field="query" data-search="true" placeholder="Merchant or category" value="${esc(ui.form.query || "")}" autofocus><div id="search-results">${matches.length ? matches.map(transactionRow).join("") : '<div class="empty-state">No matching activity.</div>'}</div>`; }
    if (kind === "analytics-info") { title = "About analytics"; content = `<p class="sheet-sub">Totals, bars, categories, and period comparisons are calculated from the transactions saved in this browser. The activity is simulated.</p>`; }
    if (kind === "success") { title = "Done"; content = `<div class="success-mark">${icon("check")}</div><div class="success-title">${esc(ui.form.successTitle || "Complete")}</div><div class="success-sub">${esc(ui.form.successText || "Your demo has been updated.")}</div><button class="primary" data-act="close">Back to app</button>`; }
    overlay.innerHTML = sheetFrame(title, content, kind);
  }

  function render(resetScroll = false) {
    const before = resetScroll ? 0 : scroll.scrollTop;
    app.innerHTML = ({ home: renderHomeRefined, cards: renderCards, payments: renderPayments, analytics: renderAnalytics, invest: () => renderPortfolio("Invest", data.investBalance, icon("invest"), "Portfolio value"), crypto: () => renderPortfolio("Crypto", data.cryptoBalance, icon("crypto"), "Crypto value"), rewards: renderRewards })[ui.tab]();
    $("#phone").dataset.theme = data.theme;
    $("#phone").dataset.page = ui.tab;
    renderNav();
    renderSheet();
    scroll.scrollTop = before;
  }
  function open(kind, values = {}) { ui.sheet = kind; ui.form = { ...values }; ui.error = ""; renderSheet(); }
  function close() { ui.sheet = null; ui.error = ""; renderSheet(); }
  function showError(message) { ui.error = message; renderSheet(); }
  function validAmount() { const amount = Number(ui.form.amount); if (!Number.isFinite(amount) || amount < 0.01 || amount > 1000000) { showError("Enter an amount between 0.01 and 1,000,000."); return null; } return num(amount); }
  function addTransaction(name, amount, category, iconChar, tone, currency = ui.account) { data.transactions.unshift({ id: Date.now(), name, amount: num(amount), currency, category, occurredAt: new Date().toISOString(), icon: iconChar, tone, ...(category === "Investments" && instrument(name.split(" ").pop()) ? { logo: "trading-" + name.split(" ").pop().toLowerCase() } : {}) }); persist(); }
  function success(title, text) { ui.sheet = "success"; ui.form = { successTitle: title, successText: text }; ui.error = ""; render(); }
  function exchangeRate(from, to) { if (fx.status !== "ready" || !fx.rates || !fx.rates[to] || !fx.rates[from]) return null; return fx.rates[to] / fx.rates[from]; }
  function exchangePreview(amount, from, to) { const rate = exchangeRate(from, to); return rate === null ? "A current reference rate is required to continue." : `Estimated: ${fmt(num(Number(amount || 0) * rate), to)} · 1 ${from} ≈ ${rate.toFixed(4)} ${to}`; }
  async function loadFxRates() {
    fx.status = "loading";
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const pairs = await Promise.all(["EUR", "USD"].map(async (quote) => {
        const response = await fetch(`https://api.frankfurter.dev/v2/rate/GBP/${quote}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Reference rate unavailable");
        const result = await response.json();
        if (result.base !== "GBP" || result.quote !== quote || !Number.isFinite(result.rate) || result.rate <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(result.date)) throw new Error("Invalid reference rate");
        return result;
      }));
      if (pairs[0].date !== pairs[1].date) throw new Error("Reference dates differ");
      fx.rates = { GBP: 1, EUR: pairs[0].rate, USD: pairs[1].rate };
      fx.date = pairs[0].date;
      fx.status = "ready";
      try { localStorage.setItem(FX_STORE, JSON.stringify({ rates: fx.rates, date: fx.date })); } catch { /* Storage is optional. */ }
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem(FX_STORE) || "null");
        if (cached && cached.rates && Number.isFinite(cached.rates.EUR) && Number.isFinite(cached.rates.USD) && /^\d{4}-\d{2}-\d{2}$/.test(cached.date)) { fx.rates = cached.rates; fx.date = cached.date; fx.status = "cached"; }
        else fx.status = "unavailable";
      } catch { fx.status = "unavailable"; }
    } finally { clearTimeout(timeout); render(); }
  }
  function handleAction(btn) {
    const act = btn.dataset.act;
    if (handleTradingAction(btn)) return;
    if (act === "tab") { ui.tab = btn.dataset.tab; close(); render(true); return; }
    if (act === "close") { close(); return; }
    if (act === "profile") { open("profile"); return; }
    if (act === "settings" || act === "back-settings") { open("settings", { profileName: data.profileName, username: data.username, balance: data.balances[ui.account], investBalance: data.investBalance, cryptoBalance: data.cryptoBalance, revPoints: data.revPoints, currency: ui.account, theme: data.theme, language: data.language }); return; }
    if (act === "back-profile") { open("profile"); return; }
    if (act === "profile-section") { open("profile-section", { section: btn.dataset.section }); return; }
    if (act === "preview-feature") { open("preview-feature", { section: btn.dataset.section }); return; }
    if (act === "photo-info") { ui.photoReturn = { sheet: ui.sheet, form: { ...ui.form } }; open("photo-info", { returnTo: ui.sheet }); return; }
    if (act === "back-photo") { const previous = ui.photoReturn; ui.photoReturn = null; open(previous?.sheet === "settings" ? "settings" : "profile", previous?.form || {}); return; }
    if (act === "reset-confirm") { open(act); return; }
    if (act === "theme") { ui.form.theme = btn.dataset.theme; renderSheet(); return; }
    if (act === "save-settings") {
      const name = String(ui.form.profileName || "").trim(), username = String(ui.form.username || "").trim().replace(/^@/, "");
      const numbers = ["balance", "investBalance", "cryptoBalance", "revPoints"].map((key) => Number(ui.form[key]));
      if (!name || name.length > 50 || !username || username.length > 40) { showError("Enter a name and username within 50 characters."); return; }
      if (numbers.some((value) => !Number.isFinite(value) || value < 0 || value > 1000000000)) { showError("Sample amounts must be between 0 and 1,000,000,000."); return; }
      const currency = currencies[ui.form.currency] ? ui.form.currency : ui.account;
      data.profileName = name; data.username = username; data.balances[currency] = num(numbers[0]);
      data.investBalance = num(numbers[1]); data.cryptoBalance = num(numbers[2]); data.revPoints = Math.round(numbers[3]);
      data.theme = ["glow", "minimal", "colors"].includes(ui.form.theme) ? ui.form.theme : "minimal";
      data.language = "en"; data.homeCurrency = currency; ui.account = currency;
      persist(); ui.tab = "home"; ui.sheet = "profile"; ui.error = ""; render(true); return;
    }
    if (act === "analytics") { ui.tab = "analytics"; ui.sheet = null; render(true); return; }
    if (act === "cards") { ui.tab = "cards"; ui.sheet = null; render(true); return; }
    if (act === "payments") { ui.tab = "payments"; ui.sheet = null; render(true); return; }
    if (act === "invest" || act === "crypto") { ui.tab = act; ui.sheet = null; render(true); return; }
    if (act === "wealth") { open("accounts"); return; }
    if (act === "funds") { open("funds"); return; }
    if (act === "accounts") { open("accounts"); return; }
    if (act === "select-account" || act === "choose-account") { ui.account = btn.dataset.currency; data.homeCurrency = ui.account; persist(); close(); render(true); return; }
    if (act === "add") { open("add"); return; }
    if (act === "move") { open("move"); return; }
    if (act === "refresh-rates") { loadFxRates(); return; }
    if (act === "more") { open("more"); return; }
    if (act === "send" || act === "bank") { open("send", act === "bank" ? { recipient: "" } : {}); return; }
    if (act === "contact") { open("send", { recipient: btn.dataset.name }); return; }
    if (act === "request") { open("request"); return; }
    if (act === "exchange") { open("exchange", { to: ui.account === "GBP" ? "EUR" : "GBP" }); return; }
    if (act === "details" || act === "card-details" || act === "card-settings" || act === "card-security" || act === "card-info" || act === "new-card" || act === "analytics-info" || act === "search") { open(act); return; }
    if (act === "transaction") { open("transaction", { txId: btn.dataset.id }); return; }
    if (act === "card-tab") { ui.card = btn.dataset.card; render(); return; }
    if (act === "freeze") { data.frozen = !data.frozen; persist(); if (ui.sheet) close(); render(); return; }
    if (act === "create-card") { data.virtual = true; ui.card = "virtual"; persist(); close(); render(); return; }
    if (act === "analytics-view") { ui.analytics = btn.dataset.view; render(); return; }
    if (act === "range") { ui.range = btn.dataset.range; render(); return; }
    if (act === "budget") { open("budget", { budget: data.budget }); return; }
    if (act === "save-budget") { const budget = Number(ui.form.budget); if (!Number.isFinite(budget) || budget < 1) { showError("Enter a budget of at least £1."); return; } data.budget = num(budget); persist(); close(); render(); return; }
    if (act === "submit-add") { const amount = validAmount(); if (amount === null) return; data.balances[ui.account] = num(data.balances[ui.account] + amount); addTransaction("Added money", amount, "Income", "+", "green"); success("Money added", `${fmt(amount, ui.account)} added to your demo account.`); return; }
    if (act === "review-send") { const recipient = String(ui.form.recipient || "").trim(); if (recipient.length < 2 || recipient.length > 50) { showError("Enter a recipient name."); return; } const amount = validAmount(); if (amount === null) return; if (amount > data.balances[ui.account]) { showError("This demo account does not have enough money."); return; } ui.form.recipient = recipient; ui.sheet = "review-send"; ui.error = ""; renderSheet(); return; }
    if (act === "back-send") { ui.sheet = "send"; renderSheet(); return; }
    if (act === "confirm-send") { const amount = num(ui.form.amount); if (!Number.isFinite(amount) || amount <= 0 || amount > data.balances[ui.account]) { showError("This demo account does not have enough money."); return; } const recipient = String(ui.form.recipient).trim(); data.balances[ui.account] = num(data.balances[ui.account] - amount); addTransaction(`To ${recipient}`, -amount, "Payments", "↗", "blue"); success("Payment sent", `${fmt(amount, ui.account)} sent to ${recipient} in this demo.`); return; }
    if (act === "submit-request") { if (String(ui.form.recipient || "").trim().length < 2) { showError("Enter a contact name."); return; } const amount = validAmount(); if (amount === null) return; success("Request created", `Demo request for ${fmt(amount, ui.account)}. Nothing was sent to ${String(ui.form.recipient).trim()}.`); return; }
    if (act === "cycle-to") { const list = Object.keys(currencies).filter((c) => c !== ui.account); ui.form.to = list[(list.indexOf(ui.form.to) + 1) % list.length]; renderSheet(); return; }
    if (act === "submit-exchange") { const to = ui.form.to || (ui.account === "GBP" ? "EUR" : "GBP"), rate = exchangeRate(ui.account, to); if (rate === null) { showError("A current public reference rate is required."); return; } const amount = validAmount(); if (amount === null) return; if (amount > data.balances[ui.account]) { showError("This demo account does not have enough money."); return; } const result = num(amount * rate); data.balances[ui.account] = num(data.balances[ui.account] - amount); data.balances[to] = num(data.balances[to] + result); persist(); success("Exchange complete", `${fmt(amount, ui.account)} exchanged to ${fmt(result, to)} using the ${fx.date} public reference rate in this demo.`); return; }
    if (act === "reset") { localStorage.removeItem(STORE); localStorage.removeItem("revolut-style-demo-v3"); localStorage.removeItem("revolut-style-demo-v1"); location.reload(); return; }
  }
  document.addEventListener("click", (event) => { const btn = event.target.closest("[data-act]"); if (btn) handleAction(btn); });
  document.addEventListener("input", (event) => {
    const field = event.target.closest("[data-field]"); if (!field) return;
    ui.form[field.dataset.field] = field.value;
    if (field.dataset.field === "marketSearch") { const term = field.value.toLowerCase(); rootMarketSearch(term); return; }
    if (ui.sheet === "trade" && field.dataset.field === "tradeAmount") updateTradeEstimate();
    if (field.dataset.search) { const term = field.value.toLowerCase(); const matches = data.transactions.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(term)); $("#search-results").innerHTML = matches.length ? matches.map(transactionRow).join("") : '<div class="empty-state">No matching activity.</div>'; }
    if (ui.sheet === "exchange" && field.dataset.field === "amount") { const to = ui.form.to || (ui.account === "GBP" ? "EUR" : "GBP"); $("#exchange-preview").textContent = exchangePreview(field.value, ui.account, to); }
  });
  document.addEventListener("change", (event) => { const field = event.target.closest("select[data-field]"); if (field) ui.form[field.dataset.field] = field.value; });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && ui.sheet) close(); });
  render(true);
  loadFxRates();
})();
