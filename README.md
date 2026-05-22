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

A simple, lightweight React Native library that detects whether **Developer Mode** (Android Developer Options / iOS Developer Mode) is active on the device — including real-time detection while the app is running or backgrounded.

---

## Features

- ✅ Android: Detects Developer Options and USB debugging (ADB)
- ✅ iOS 16+: Detects Developer Mode via Apple's `DeviceCheck` framework
- ✅ Real-time listener — catches users who enable dev mode while the app is open or backgrounded
- ✅ Zero dependencies
- ✅ Fully typed (TypeScript)
- ✅ Promise-based async API

---

## Requirements

| Peer dependency | Version |
|---|---|
| `react` | ≥ 18 |
| `react-native` | ≥ 0.71 |

| Platform | Minimum version |
|---|---|
| Android | API 16 (Android 4.1) |
| iOS | 12.0 (Developer Mode detection requires iOS 16+) |

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

The podspec declares the **DeviceCheck** system framework, which is used on iOS 16+ to read `DCDevice.developerModeEnabled`. No manual Xcode configuration is needed.

### Android

No extra steps required — the module is auto-linked.

---

## Usage

### One-shot read

Call `isDeveloperModeEnabled()` once to get the current state — e.g. on app launch.

```ts
import { isDeveloperModeEnabled, checkDeveloperMode } from '@rick427/react-native-developer-mode';

// Full result
const result = await isDeveloperModeEnabled();
console.log(result.isDeveloperModeEnabled); // true | false
console.log(result.isAdbEnabled);           // true | false (Android only)

// Boolean shorthand
const isDevMode = await checkDeveloperMode();
console.log(isDevMode); // true | false
```

### Real-time listener

Use `addDeveloperModeListener` to react the moment a user enables dev mode — even if they do it while the app is backgrounded.

```ts
import { useEffect } from 'react';
import { addDeveloperModeListener } from '@rick427/react-native-developer-mode';

function useDevModeGuard() {
  useEffect(() => {
    const subscription = addDeveloperModeListener(({ isDeveloperModeEnabled, isAdbEnabled }) => {
      if (isDeveloperModeEnabled) {
        console.warn('Developer mode was enabled!');
        // e.g. show a warning dialog, log a security event, etc.
      }
      if (isAdbEnabled) {
        console.warn('USB debugging (ADB) was enabled!');
      }
    });

    // Always remove the listener on unmount to avoid memory leaks
    return () => subscription.remove();
  }, []);
}
```

### Complete hook (read + listen)

This pattern gives you the current state on mount and keeps it updated in real time.

```ts
import { useState, useEffect } from 'react';
import {
  isDeveloperModeEnabled,
  addDeveloperModeListener,
  type DeveloperModeResult,
} from '@rick427/react-native-developer-mode';

function useDeveloperMode(): DeveloperModeResult {
  const [state, setState] = useState<DeveloperModeResult>({
    isDeveloperModeEnabled: false,
    isAdbEnabled: false,
  });

  useEffect(() => {
    // Read current state on mount
    isDeveloperModeEnabled().then(setState);

    // Subscribe to future changes
    const subscription = addDeveloperModeListener(setState);
    return () => subscription.remove();
  }, []);

  return state;
}

// Usage in a component
function App() {
  const { isDeveloperModeEnabled, isAdbEnabled } = useDeveloperMode();

  if (isDeveloperModeEnabled) {
    return <DeveloperModeWarning />;
  }

  return <MainApp />;
}
```

---

## API

### `isDeveloperModeEnabled(): Promise<DeveloperModeResult>`

Reads the current developer-mode state once. Returns `{ isDeveloperModeEnabled: false, isAdbEnabled: false }` on unsupported platforms.

### `checkDeveloperMode(): Promise<boolean>`

Convenience helper. Resolves to `true` if developer mode is active. Equivalent to reading only the `isDeveloperModeEnabled` field from `isDeveloperModeEnabled()`.

### `addDeveloperModeListener(callback): EmitterSubscription`

Subscribes to real-time developer-mode state changes.

| Parameter | Type | Description |
|---|---|---|
| `callback` | `(result: DeveloperModeResult) => void` | Called whenever the state changes |

Returns an `EmitterSubscription`. Call `.remove()` when done.

### `DeveloperModeResult`

| Field | Type | Description |
|---|---|---|
| `isDeveloperModeEnabled` | `boolean` | Whether Developer Options (Android) or Developer Mode (iOS 16+) is enabled |
| `isAdbEnabled` | `boolean` | Whether USB debugging (ADB) is enabled. **Android only** — always `false` on iOS |

---

## Platform behaviour

| Scenario | Android | iOS |
|---|---|---|
| Dev mode toggled while app is **open** | ✅ Fires instantly | ⚠️ Fires on next foreground |
| Dev mode toggled while app is **backgrounded** | ✅ Fires instantly on toggle | ✅ Fires when app foregrounds |
| App cold-started after dev mode was already on | ✅ One-shot read returns `true` | ✅ One-shot read returns `true` |

**Android** uses a `ContentObserver` on the system settings database URI. It fires the instant `DEVELOPMENT_SETTINGS_ENABLED` or `ADB_ENABLED` changes, regardless of app state. No permissions are required.

**iOS** has no system-level callback for this setting. The module registers for `UIApplicationWillEnterForegroundNotification` and re-reads `DCDevice.currentDevice.developerModeEnabled` each time the app comes to the foreground, emitting only when the value has changed since the last check. On iOS < 16 the value is always `false`.

---

## Changelog

### 1.1.0
- **New:** `addDeveloperModeListener` — real-time state changes via `ContentObserver` (Android) and foreground notification (iOS)

### 1.0.1
- Fixed module resolution: `main` now points to compiled `lib/index.js`
- Added CI/CD via GitHub Actions (lint + publish on version tags)

### 1.0.0
- Initial release: `isDeveloperModeEnabled` and `checkDeveloperMode`

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
