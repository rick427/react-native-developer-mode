# react-native-developer-mode

A simple, lightweight React Native library that detects whether **Developer Mode** (Android Developer Options / iOS Developer Mode) is active on the device.

## Features

- ✅ Android: Detects Developer Options and USB debugging (ADB)
- ✅ iOS 16+: Detects Developer Mode via `DCDevice`
- ✅ Zero dependencies
- ✅ Fully typed (TypeScript)
- ✅ Supports Promise-based async API

---

## Installation

```sh
npm install react-native-developer-mode
# or
yarn add react-native-developer-mode
```

### iOS

```sh
cd ios && pod install
```

### Android

No extra steps required — the module is auto-linked.

---

## Usage

```ts
import { isDeveloperModeEnabled, checkDeveloperMode } from 'react-native-developer-mode';

// Full result object
const result = await isDeveloperModeEnabled();
console.log(result.isDeveloperModeEnabled); // true | false
console.log(result.isAdbEnabled);           // true | false (Android only)

// Simple boolean helper
const isDevMode = await checkDeveloperMode();
console.log(isDevMode); // true | false
```

---

## API

### `isDeveloperModeEnabled(): Promise<DeveloperModeResult>`

Returns a promise that resolves with:

| Field | Type | Description |
|---|---|---|
| `isDeveloperModeEnabled` | `boolean` | Whether Developer Options (Android) or Developer Mode (iOS 16+) is enabled |
| `isAdbEnabled` | `boolean` | Whether USB debugging (ADB) is enabled. **Android only** — always `false` on iOS |

### `checkDeveloperMode(): Promise<boolean>`

Convenience helper. Resolves to `true` if developer mode is active on the current platform.

---

## Platform Notes

### Android

Reads the following system settings:

- `Settings.Global.DEVELOPMENT_SETTINGS_ENABLED` — whether Developer Options is turned on
- `Settings.Global.ADB_ENABLED` — whether USB debugging is enabled

Both require **API 16 (Android 4.1)** or above, which covers 99%+ of devices.

### iOS

Uses `DCDevice.currentDevice.developerModeEnabled` from Apple's **DeviceCheck** framework.

- **iOS 16+**: Returns the real value from the system.
- **iOS < 16**: Returns `false` (Developer Mode did not exist as a setting before iOS 16).

---

## License

MIT
