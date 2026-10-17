# Dark interface update

Open `preview.html` for a self-contained browser preview. The source and bundled iOS web assets contain the same update.

- Reworked balance hierarchy, account controls, action buttons and mobile spacing.
- Currency dots now switch accounts.
- Recent activity shows up to three entries with a See all action; removed the duplicate list.
- Refined card artwork, widget surfaces, bottom navigation, sheets and input styles.
- Kept existing simulated balances, transactions, themes and settings.

Reference: https://www.revolut.com/blog/post/revolut-10/ . This is a visual approximation; exact screens vary by app version, region and theme.

Independent demo; no bank connection or real payments. Build the native wrapper using the existing README instructions.

## Paper trading

Invest and Crypto now support 24 real asset identities (12 stocks/ETFs and 12 cryptocurrencies), asset search, fractional units, order reviews, buy/sell execution, holdings, unrealised gains and losses, realised P/L on sales, and recent order history. Quotes are illustrative simulated USD prices, not current market quotes. Simulate next day moves both markets.

Trades debit/credit the existing USD bank balance. Add $10,000 supplies demo cash; it is recorded in activity. No other currency is silently converted. Holdings, prices, orders and cash persist locally in the app. The inline chat preview is session-only.

No real broker, market feed, exchange, wallet or payments are connected. Existing settings for legacy sample investment totals no longer change holdings.

## Reference-led portfolio layout

Invest now follows the supplied IMG_2116 reference's cyan-to-black account background, balance and small cents, circular Trade / Add money / Withdraw / More controls, and grouped holdings. Crypto uses the same composition with a purple theme. Discover and cash-account controls work with the existing paper-trading engine. Withdraw explains the shared cash model and opens the USD account; it does not invent a separate cash transfer.

## Visual verification pass

Refined shared typography, translucent top controls, teal/purple backgrounds, split balance decimals, grouped holdings, asset icon contrast, card spacing and buy/sell sheets. Rounded sub-cent portfolio P/L before display to avoid negative zero. USD values consistently use the dollar sign.

Rendered Home, Invest with purchased holdings, and a buy/sell sheet in Chromium for visual inspection.
