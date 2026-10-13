# Dayflow

Local-first task app (Expo SDK 57). Today view, projects, priorities, calendar due dates, backup — **no backend or account**.

## Clone & run

```bash
git clone <your-repo-url> dayflow
cd dayflow
npm install
npm start
```

- **Phone (Expo Go):** Install [Expo Go](https://expo.dev/go) (SDK 57), same Wi‑Fi as your computer, scan the QR code.
- **iOS Simulator:** `npm run ios` (macOS + Xcode).
- **Android emulator:** `npm run android` (Android Studio).
- **Web (limited):** `npm run web` — mobile is the target; calendar uses shortcuts on web.

```bash
npm run typecheck   # TypeScript
npm run doctor      # Expo health check
```

## Common scenarios

| Situation                  | What to do                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| QR code won’t connect      | Same Wi‑Fi; disable VPN; try `npx expo start --tunnel`                                                                           |
| Wrong IP / device offline  | Copy `.env.example` → `.env`, set `REACT_NATIVE_PACKAGER_HOSTNAME` to your Mac’s LAN IP, restart Expo                            |
| Expo Go SDK mismatch       | This repo is **SDK 57** — update Expo Go or match SDK in `package.json`                                                          |
| Fresh clone, blank app     | Expected — no seed tasks; data lives in AsyncStorage on the device                                                               |
| Move data to another phone | **Backup & restore** → export JSON, save it, paste on the new device                                                             |
| Store build                | See [Expo EAS Build](https://docs.expo.dev/build/introduction/) — `eas.json` included; set icons + bundle ID in `app.json` first |

## Stack

React Native · TypeScript · AsyncStorage · `src/` feature layout

## License

Private / your choice — add a `LICENSE` file if you open-source.
