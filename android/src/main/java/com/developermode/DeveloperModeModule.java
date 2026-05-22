package com.developermode;

import android.content.Context;
import android.database.ContentObserver;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class DeveloperModeModule extends ReactContextBaseJavaModule {

    private static final String EVENT_NAME = "developerModeChanged";

    private final ReactApplicationContext reactContext;

    // ContentObserver that watches both developer-options and ADB settings URIs.
    @Nullable private ContentObserver settingsObserver;

    // Reference-count JS listeners so we only register/unregister the OS
    // observer once regardless of how many JS subscribers there are.
    private int listenerCount = 0;

    public DeveloperModeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "DeveloperMode";
    }

    // ── One-shot read ──────────────────────────────────────────────────────

    /**
     * Checks the current developer-options state once and resolves the promise.
     */
    @ReactMethod
    public void isDeveloperModeEnabled(Promise promise) {
        try {
            promise.resolve(buildResult());
        } catch (Exception e) {
            promise.reject("DEVELOPER_MODE_ERROR", e.getMessage(), e);
        }
    }

    // ── Listener lifecycle (called by NativeEventEmitter on the JS side) ───

    /**
     * Called by React Native every time a JS listener is added via
     * NativeEventEmitter. We start the ContentObserver on the first subscriber.
     */
    @ReactMethod
    public void addListener(String eventName) {
        listenerCount++;
        if (listenerCount == 1) {
            startObserving();
        }
    }

    /**
     * Called by React Native when JS listeners are removed.
     * We stop the ContentObserver when the count reaches zero.
     */
    @ReactMethod
    public void removeListeners(int count) {
        listenerCount = Math.max(0, listenerCount - count);
        if (listenerCount == 0) {
            stopObserving();
        }
    }

    // ── ContentObserver ────────────────────────────────────────────────────

    private void startObserving() {
        if (settingsObserver != null) return;

        settingsObserver = new ContentObserver(new Handler(Looper.getMainLooper())) {
            @Override
            public void onChange(boolean selfChange) {
                emitCurrentState();
            }
        };

        Context ctx = reactContext.getApplicationContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            Uri devOptionsUri = Settings.Global.getUriFor(
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED);
            Uri adbUri = Settings.Global.getUriFor(
                    Settings.Global.ADB_ENABLED);

            ctx.getContentResolver().registerContentObserver(
                    devOptionsUri, false, settingsObserver);
            ctx.getContentResolver().registerContentObserver(
                    adbUri, false, settingsObserver);
        }
    }

    private void stopObserving() {
        if (settingsObserver != null) {
            reactContext.getApplicationContext()
                    .getContentResolver()
                    .unregisterContentObserver(settingsObserver);
            settingsObserver = null;
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private WritableMap buildResult() {
        Context ctx = reactContext.getApplicationContext();
        boolean devOptions = false;
        boolean adbEnabled = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            devOptions = Settings.Global.getInt(ctx.getContentResolver(),
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) != 0;

            adbEnabled = Settings.Global.getInt(ctx.getContentResolver(),
                    Settings.Global.ADB_ENABLED, 0) != 0;
        }

        WritableMap map = new WritableNativeMap();
        map.putBoolean("isDeveloperModeEnabled", devOptions);
        map.putBoolean("isAdbEnabled", adbEnabled);
        return map;
    }

    private void emitCurrentState() {
        if (!reactContext.hasActiveReactInstance()) return;

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EVENT_NAME, buildResult());
    }
}
