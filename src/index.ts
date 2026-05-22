import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  EmitterSubscription,
} from 'react-native';

const LINKING_ERROR =
  `react-native-developer-mode: The native module is not linked. ` +
  `Make sure you have run 'pod install' (iOS) or rebuilt the Android project.`;

const DeveloperModeNative = NativeModules.DeveloperMode
  ? NativeModules.DeveloperMode
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const emitter = new NativeEventEmitter(DeveloperModeNative);

const CHANGE_EVENT = 'developerModeChanged';

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * The result object returned by {@link isDeveloperModeEnabled} and passed
 * to every {@link addDeveloperModeListener} callback.
 */
export interface DeveloperModeResult {
  /**
   * `true` when the device has Developer Options (Android) or Developer Mode
   * (iOS 16+) actively enabled.
   */
  isDeveloperModeEnabled: boolean;
  /**
   * `true` when USB debugging (ADB) is enabled.
   *
   * **Android only** — always `false` on iOS because ADB is an Android concept.
   */
  isAdbEnabled: boolean;
}

// ── One-shot read ──────────────────────────────────────────────────────────

/**
 * Reads the current developer-mode state **once** and resolves with the
 * result. Use {@link addDeveloperModeListener} if you need ongoing updates.
 *
 * Returns `{ isDeveloperModeEnabled: false, isAdbEnabled: false }` on
 * unsupported platforms.
 *
 * @returns A promise that resolves with {@link DeveloperModeResult}.
 *
 * @example
 * ```ts
 * const result = await isDeveloperModeEnabled();
 * console.log(result.isDeveloperModeEnabled); // true | false
 * console.log(result.isAdbEnabled);           // true | false (Android only)
 * ```
 */
export async function isDeveloperModeEnabled(): Promise<DeveloperModeResult> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { isDeveloperModeEnabled: false, isAdbEnabled: false };
  }
  return DeveloperModeNative.isDeveloperModeEnabled();
}

/**
 * Convenience helper that resolves to `true` when developer mode is active
 * on the current platform. Equivalent to calling `isDeveloperModeEnabled()`
 * and reading only the `isDeveloperModeEnabled` field.
 *
 * @example
 * ```ts
 * if (await checkDeveloperMode()) {
 *   Alert.alert('Developer mode is active');
 * }
 * ```
 */
export async function checkDeveloperMode(): Promise<boolean> {
  const result = await isDeveloperModeEnabled();
  return result.isDeveloperModeEnabled;
}

// ── Real-time listener ─────────────────────────────────────────────────────

/**
 * Subscribes to real-time developer-mode state changes and returns an
 * {@link EmitterSubscription}. Always call `.remove()` on it when you are
 * done (e.g. in a `useEffect` cleanup) to avoid memory leaks.
 *
 * ### Platform behaviour
 *
 * **Android** — powered by a `ContentObserver` on the system settings URI.
 * The callback fires the instant the value changes in the settings database,
 * regardless of whether the app is in the foreground or background.
 *
 * **iOS** — Apple provides no system-level callback for this setting.
 * The module registers for `UIApplicationWillEnterForegroundNotification`
 * and re-checks `DCDevice.currentDevice.developerModeEnabled` every time
 * the app returns to the foreground, emitting only when the value has changed.
 *
 * @param callback - Invoked with the latest {@link DeveloperModeResult}
 *   whenever the developer-mode state changes.
 * @returns An {@link EmitterSubscription} — call `.remove()` to unsubscribe.
 *
 * @example
 * ```ts
 * import { useEffect } from 'react';
 * import { addDeveloperModeListener } from '@rick427/react-native-developer-mode';
 *
 * function useDevModeGuard() {
 *   useEffect(() => {
 *     const sub = addDeveloperModeListener(({ isDeveloperModeEnabled, isAdbEnabled }) => {
 *       if (isDeveloperModeEnabled) {
 *         console.warn('Developer mode was enabled!');
 *       }
 *       if (isAdbEnabled) {
 *         console.warn('USB debugging was enabled!');
 *       }
 *     });
 *     return () => sub.remove();
 *   }, []);
 * }
 * ```
 */
export function addDeveloperModeListener(
  callback: (result: DeveloperModeResult) => void
): EmitterSubscription {
  return emitter.addListener(CHANGE_EVENT, callback);
}
