#import "DeveloperMode.h"

#if __has_include(<DeviceCheck/DeviceCheck.h>)
  #import <DeviceCheck/DeviceCheck.h>
#endif

static NSString *const kEventName = @"developerModeChanged";

@implementation DeveloperMode {
    // Last known state — used to avoid emitting spurious events on iOS
    // (we only emit when the value actually changed on foreground).
    BOOL _lastKnownDevMode;
    BOOL _isObserving;
}

RCT_EXPORT_MODULE()

// ── Supported events ───────────────────────────────────────────────────────

- (NSArray<NSString *> *)supportedEvents {
    return @[kEventName];
}

// ── One-shot read ──────────────────────────────────────────────────────────

RCT_EXPORT_METHOD(isDeveloperModeEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([self currentState]);
}

// ── Listener lifecycle (called by NativeEventEmitter on the JS side) ───────

/**
 * Called when the first JS listener subscribes.
 * We register for UIApplicationWillEnterForegroundNotification so we can
 * re-check the developer-mode flag every time the app comes to the foreground
 * (Apple provides no dedicated callback for this setting change).
 */
- (void)startObserving {
    if (_isObserving) return;
    _isObserving = YES;

    // Snapshot the current value so we can diff on foreground.
    _lastKnownDevMode = [self readDevMode];

    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(handleAppForeground)
               name:UIApplicationWillEnterForegroundNotification
             object:nil];
}

/**
 * Called when the last JS listener unsubscribes.
 */
- (void)stopObserving {
    _isObserving = NO;
    [[NSNotificationCenter defaultCenter]
        removeObserver:self
                  name:UIApplicationWillEnterForegroundNotification
                object:nil];
}

// ── Foreground handler ─────────────────────────────────────────────────────

- (void)handleAppForeground {
    BOOL current = [self readDevMode];
    if (current == _lastKnownDevMode) return; // nothing changed

    _lastKnownDevMode = current;
    [self sendEventWithName:kEventName body:[self currentState]];
}

// ── Helpers ────────────────────────────────────────────────────────────────

- (BOOL)readDevMode {
#if __has_include(<DeviceCheck/DeviceCheck.h>)
    if (@available(iOS 16.0, *)) {
        return DCDevice.currentDevice.developerModeEnabled;
    }
#endif
    return NO;
}

- (NSDictionary *)currentState {
    return @{
        @"isDeveloperModeEnabled": @([self readDevMode]),
        @"isAdbEnabled": @(NO)
    };
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

@end
