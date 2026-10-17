# Revolut-style banking demo

An independent, mobile-first interface study. It is not affiliated with Revolut, does not connect to a bank, and cannot move money. Balances, cards, recipients, and activity are simulated. Reference exchange rates come from a public data service when the browser is online; they are not Revolut rates or executable quotes.

## Open

Open `index.html` in a browser. Run `python build.py` to create a self-contained HTML file and source ZIP in `outputs/`.

## Build an iOS app (unsigned IPA)

The `ios/` folder wraps the page in a native SwiftUI + WKWebView shell and bundles the web files offline under `Web/`. The GitHub Actions workflow in `.github/workflows/build-ipa.yml` builds an **unsigned** IPA on every push and uploads it as the `RevolutDemo-ipa` artifact.

1. Push this folder to a GitHub repository. The build runs on GitHub's macOS runner, so no Mac or Apple Developer account is needed to produce it.
2. Open the repository's **Actions** tab, select the latest "Build unsigned IPA" run, and download the `RevolutDemo-ipa` artifact.
3. The IPA is unsigned. Re-sign it with your own certificate and provisioning profile before installing (for example Sideloadly, AltStore, or `codesign`), or install directly with a free Apple ID for a 7-day sideload.

To build on a Mac instead:

```sh
bash ios/prepare-web.sh   # copies the web files into ios/Web
cd ios
xcodegen generate         # install first: brew install xcodegen
xcodebuild -project RevolutDemo.xcodeproj -scheme RevolutDemo -sdk iphoneos -configuration Release -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

Change the display name and bundle identifier in `ios/RevolutDemo/Info.plist` and `ios/project.yml`. The bundled app works offline; only the optional public reference-rate request needs a network connection, and the interface already handles that request failing.

## Included screens and actions

- Home: currency accounts, balance, quick actions, recent activity, cards, and a total wealth breakdown.
- Profile and Settings: edit a sample name, username, balance, investing and crypto values, points, currency, and color theme. Save returns to the profile menu as in the supplied walkthrough.
- Invest, Crypto, and RevPoints: sample portfolio and rewards views reached from the five-item dock.
- Cards: physical and virtual demo cards, freeze control, masked details, and settings preview.
- Payments: simulated send, request, and bank-recipient flows, plus searchable activity and transaction details.
- Analytics: spending and income totals, categories, bars, period comparisons, and a sample budget. The figures are calculated from the simulated transactions in local storage.
- Add money and exchange adjust sample balances locally. The data is saved in browser storage; **Profile → Reset sample data** restores the starting state.

The supplied TikTok clip shows a Larpz Wallet balance editor and Home sequence. This version follows that visible interaction, including the profile menu, Settings form, Save transition, USD balance formatting, wealth panel with Flexible Cash Funds, spending card, and five-item dock. The profile, wealth, and navigation symbols are vector interface icons based on the supplied clip; they are not official Revolut logo files. The clip's caption is not part of the app. The Settings editor explains that balances and activity are examples and no real account, card, or payment is connected.

The layout uses the same 393px screen width and main spacing scale as the separate Phantom demo. Transaction rows use bundled vector brand marks for sample merchants, with fallbacks for user-created activity. The merchant and Visa marks come from Simple Icons; their license is included in `assets/logos/`. The app icon, Home mark, and wordmark use [Revolut's published main logo package](https://developer.revolut.com/docs/resources/open-banking-logo-guidelines). The white Home mark keeps the exact shape of the official icon and uses Revolut's permitted white treatment. The independent simulation is disclosed in Settings and this README.

The exchange screen fetches the latest published GBP/EUR and GBP/USD reference rates from [Frankfurter](https://frankfurter.dev/javascript/), which blends rates from several providers. These rates update daily, not continuously. The app displays their publication date and disables exchange if it cannot fetch current rates. It may show a cached rate on the Home screen, labelled as cached. Revolut sets its own variable rates and may apply fees; this demo does not model those quotes or fees. No actual card details or bank account numbers are included.

## Design references

Revolut describes its current app around a consolidated Home view, account switching, customizable widgets, quick money actions, cards, payments, and analytics. References used for the screen structure:

- https://www.revolut.com/blog/post/revolut-10/
- https://www.revolut.com/news/revolut_launches_revolut_10_as_it_targets_primary_accounts_and_passes_35m_customers_worldwide/
- https://help.revolut.com/help/accounts/budget-and-analytics/how-can-i-see-my-spending-and-income-analytics/
- https://apps.apple.com/us/app/revolut-send-spend-and-save/id932493382

The exact Revolut interface varies by app version and region; this is a coherent demo based on public materials rather than a pixel-verified copy of a specific release.

## Typography

The app uses the native Apple system font on iOS and bundles the open-source Inter variable font as its fallback elsewhere. Revolut's exact native-app font is not publicly confirmed in the sources above; the licensed display face seen on its website is not included. The bundled Inter font and its license are in `assets/`.

## Version 13 visual pass

The dark interface uses shared surface colours, lighter type weights, fewer borders, and consistent control sizes. Home has a sticky translucent search toolbar, larger wealth rows, revised card thumbnails, and a cumulative monthly spending chart calculated from the saved activity. Cards has a centered card, masked details, and Details, Freeze, and Settings controls. Payments has a search entry, circular actions, recent recipients, and grouped activity. Analytics shares the same dark surfaces and uses vector category icons. Profile and Settings use larger, more readable rows.

`polish.css` contains this shared visual layer. It is included by the source page and embedded by `build.py`. Settings retains the independent simulation disclosure; all financial actions remain local simulations.

Additional public references inspected for this pass:

- [Revolut cards and card controls](https://www.revolut.com/cards/)
- [Revolut money management and category layouts](https://www.revolut.com/best-budget-planner/)
- [Current spending and income analytics help](https://help.revolut.com/help/accounts/budget-and-analytics/how-can-i-see-my-spending-and-income-analytics/)

Validation: JavaScript syntax and isolated runtime checks passed for Home, Cards, freeze/unfreeze, virtual card creation, Payments, recipient sheets, analytics ranges, and Settings save. These checks do not validate browser layout. The new build was not visually checked in a browser because local file access was blocked by the browser tool.
