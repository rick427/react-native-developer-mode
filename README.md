# react-native-developer-mode

[![npm version](https://img.shields.io/npm/v/@rick427/react-native-developer-mode.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@rick427/react-native-developer-mode)
[![npm downloads](https://img.shields.io/npm/dm/@rick427/react-native-developer-mode.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@rick427/react-native-developer-mode)
[![license](https://img.shields.io/npm/l/@rick427/react-native-developer-mode.svg?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/rick427/react-native-developer-mode?style=flat-square&logo=github&color=yellow)](https://github.com/rick427/react-native-developer-mode/stargazers)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.71+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Java](https://img.shields.io/badge/Java-Android-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://developer.android.com/)
[![Objective-C++](https://img.shields.io/badge/Objective--C++-iOS-A9B4C2?style=flat-square&logo=apple&logoColor=white)](https://developer.apple.com/)

[![iOS](https://img.shields.io/badge/iOS-12.0+-000000?style=flat-square&logo=apple&logoColor=white)](#)
[![Android](https://img.shields.io/badge/Android-16+-3DDC84?style=flat-square&logo=android&logoColor=white)](#)

---

A simple, lightweight React Native library that detects whether **Developer Mode** (Android Developer Options / iOS Developer Mode) is active on the device.

---

## Features

- ✅ Android: Detects Developer Options and USB debugging (ADB)
- ✅ iOS 16+: Detects Developer Mode via Apple's `DeviceCheck` framework
- ✅ Zero dependencies
- ✅ Fully typed (TypeScript)
- ✅ Promise-based async API

---

## Installation

```sh
npm install @rick427/react-native-developer-mode
# or
yarn add @rick427/react-native-developer-mode
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
import { isDeveloperModeEnabled, checkDeveloperMode } from '@rick427/react-native-developer-mode';

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

Reads the following system settings (no permissions required):

- `Settings.Global.DEVELOPMENT_SETTINGS_ENABLED` — whether Developer Options is turned on
- `Settings.Global.ADB_ENABLED` — whether USB debugging is enabled

Requires **API 16 (Android 4.1)** or above.

### iOS

Uses `DCDevice.currentDevice.developerModeEnabled` from Apple's **DeviceCheck** framework.

- **iOS 16+**: Returns the real value from the system.
- **iOS < 16**: Returns `false` (Developer Mode did not exist as a setting before iOS 16).

---

## Authors

<table>
  <tr>
    <td>
      <a href="https://github.com/rick427">
        <img src="https://github.com/rick427.png?size=80" width="60" height="60" style="border-radius:50%" alt="Richard Njoku" />
      </a>
    </td>
    <td>
      <a href="https://github.com/rick427"><b>Richard Njoku</b></a>
    </td>
  </tr>
</table>

---

## License

[MIT](./LICENSE) © Richard Njoku
