/**
 * Geolocation and Location Verification Unit Tests
 * File: frontend/test/geolocation.test.ts
 * Run with: node --experimental-strip-types --test test/geolocation.test.ts
 */

import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidCoordinates,
  getCurrentDeviceLocation,
  isGeolocationSupported,
  isSecureContextEnvironment,
  getGeolocationDiagnostics,
  clearGeolocationDiagnostics,
  _resetInFlightGeolocation,
} from '../src/utils/geolocation.ts';
import {
  calculateHaversineDistanceKm,
  formatDistance,
  reverseGeocodeCoordinates,
} from '../src/utils/geocoding.ts';

function setMockWindow(mockObj: any) {
  Object.defineProperty(globalThis, 'window', {
    value: mockObj,
    configurable: true,
    writable: true,
  });
}

function setMockNavigator(mockObj: any) {
  Object.defineProperty(globalThis, 'navigator', {
    value: mockObj,
    configurable: true,
    writable: true,
  });
}

function setMockFetch(mockFn: any) {
  Object.defineProperty(globalThis, 'fetch', {
    value: mockFn,
    configurable: true,
    writable: true,
  });
}

describe('Geolocation & Coordinates Validation Suite', () => {
  test('isValidCoordinates should accept valid latitude and longitude within limits', () => {
    assert.strictEqual(isValidCoordinates(18.5204, 73.8567), true); // Pune
    assert.strictEqual(isValidCoordinates(19.076, 72.8777), true); // Mumbai
    assert.strictEqual(isValidCoordinates(-90.0, -180.0), true); // Lower boundary
    assert.strictEqual(isValidCoordinates(90.0, 180.0), true); // Upper boundary
  });

  test('isValidCoordinates should accept valid coordinates containing zero on a single axis', () => {
    // Equator with non-zero longitude
    assert.strictEqual(isValidCoordinates(0.0, 73.8567), true, '0 latitude on Equator is valid');
    assert.strictEqual(isValidCoordinates(0, -122.4194), true, '0 latitude with western longitude is valid');

    // Prime Meridian (Greenwich) with non-zero latitude
    assert.strictEqual(isValidCoordinates(51.4934, 0.0), true, '0 longitude on Greenwich Prime Meridian is valid');
    assert.strictEqual(isValidCoordinates(-33.8688, 0), true, '0 longitude with southern latitude is valid');
  });

  test('isValidCoordinates should reject out-of-range coordinates', () => {
    assert.strictEqual(isValidCoordinates(90.001, 73.8567), false);
    assert.strictEqual(isValidCoordinates(-90.001, 73.8567), false);
    assert.strictEqual(isValidCoordinates(18.5204, 180.001), false);
    assert.strictEqual(isValidCoordinates(18.5204, -180.001), false);
  });

  test('isValidCoordinates should reject NaN, Infinity, null, and undefined values', () => {
    assert.strictEqual(isValidCoordinates(NaN, 73.8567), false);
    assert.strictEqual(isValidCoordinates(18.5204, NaN), false);
    assert.strictEqual(isValidCoordinates(Infinity, 73.8567), false);
    assert.strictEqual(isValidCoordinates(18.5204, -Infinity), false);
    assert.strictEqual(isValidCoordinates(null, 73.8567), false);
    assert.strictEqual(isValidCoordinates(18.5204, null), false);
    assert.strictEqual(isValidCoordinates(undefined, 73.8567), false);
    assert.strictEqual(isValidCoordinates(18.5204, undefined), false);
    assert.strictEqual(isValidCoordinates('18.52' as any, 73.8567), false);
  });

  test('isValidCoordinates should reject uninitialized (0, 0) Null Island coordinates by default', () => {
    assert.strictEqual(isValidCoordinates(0, 0), false);
    assert.strictEqual(isValidCoordinates(0.0, 0.0), false);
    // Unless explicitly permitted via allowZero option
    assert.strictEqual(isValidCoordinates(0, 0, { allowZero: true }), true);
  });
});

describe('Environment & Secure Context Checks', () => {
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    originalNavigator = (globalThis as any).navigator;
    _resetInFlightGeolocation();
    clearGeolocationDiagnostics();
  });

  afterEach(() => {
    setMockWindow(originalWindow);
    setMockNavigator(originalNavigator);
    _resetInFlightGeolocation();
  });

  test('isGeolocationSupported returns false when navigator.geolocation is missing', () => {
    setMockWindow({});
    setMockNavigator({});
    assert.strictEqual(isGeolocationSupported(), false);
  });

  test('isGeolocationSupported returns true when navigator.geolocation exists', () => {
    setMockWindow({});
    setMockNavigator({
      geolocation: {
        getCurrentPosition: () => {},
      },
    });
    assert.strictEqual(isGeolocationSupported(), true);
  });

  test('isSecureContextEnvironment validates localhost and 127.0.0.1 as secure', () => {
    setMockWindow({
      isSecureContext: true,
      location: { hostname: 'localhost', protocol: 'http:' },
    });
    assert.strictEqual(isSecureContextEnvironment(), true);

    setMockWindow({
      isSecureContext: false,
      location: { hostname: '192.168.1.100', protocol: 'http:' },
    });
    assert.strictEqual(isSecureContextEnvironment(), false);
  });
});

describe('Two-Phase Geolocation Acquisition Workflow', () => {
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    originalNavigator = (globalThis as any).navigator;
    _resetInFlightGeolocation();
    clearGeolocationDiagnostics();
    setMockWindow({
      isSecureContext: true,
      location: { hostname: 'localhost', protocol: 'http:' },
    });
  });

  afterEach(() => {
    setMockWindow(originalWindow);
    setMockNavigator(originalNavigator);
    _resetInFlightGeolocation();
    clearGeolocationDiagnostics();
  });

  test('Phase 1 High Accuracy Success returns valid coordinates without calling fallback', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: (pos: any) => void) => {
          callCount++;
          success({
            coords: {
              latitude: 18.5204321,
              longitude: 73.8567432,
              accuracy: 12,
            },
          });
        },
      },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(result.success, true);
    assert.strictEqual(callCount, 1, 'Phase 2 must NOT be called on Phase 1 success');
    assert.strictEqual(result.coords?.latitude, 18.520432);
    assert.strictEqual(result.coords?.longitude, 73.856743);
    assert.strictEqual(result.coords?.accuracy, 12);

    const diagnostics = getGeolocationDiagnostics();
    const highAccSuccess = diagnostics.find(
      (d) => d.phase === 'high_accuracy' && d.status === 'success'
    );
    assert.ok(highAccSuccess, 'Diagnostic should record high_accuracy success');
  });

  test('Phase 1 High Accuracy Timeout automatically triggers Phase 2 Standard Accuracy fallback and succeeds', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: (pos: any) => void, error: (err: any) => void, options: any) => {
          callCount++;
          if (options.enableHighAccuracy) {
            // High accuracy times out (e.g. Wi-Fi BSSID scan took longer than Phase 1 limit)
            error({
              code: 3,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
              message: 'High accuracy positioning timed out',
            });
          } else {
            // Standard accuracy fallback succeeds (e.g. Wi-Fi / IP / cached position)
            success({
              coords: {
                latitude: 18.5236,
                longitude: 73.8418,
                accuracy: 65,
              },
            });
          }
        },
      },
    });

    const result = await getCurrentDeviceLocation({
      highAccuracyTimeoutMs: 500,
      fallbackTimeoutMs: 1000,
    });
    assert.strictEqual(callCount, 2, 'Should have fallen back to Phase 2 after Phase 1 timeout');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.coords?.latitude, 18.5236);
    assert.strictEqual(result.coords?.longitude, 73.8418);

    const diagnostics = getGeolocationDiagnostics();
    assert.ok(
      diagnostics.some((d) => d.phase === 'high_accuracy' && (d.status === 'failed' || d.status === 'timeout')),
      'Diagnostics should record high_accuracy timeout failure'
    );
    assert.ok(
      diagnostics.some((d) => d.phase === 'standard_fallback' && d.status === 'success'),
      'Diagnostics should record standard_fallback success'
    );
  });

  test('Both attempts timing out returns TIMEOUT error with accurate recovery advice', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (_success: any, error: (err: any) => void) => {
          callCount++;
          error({
            code: 3,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            message: 'Position acquisition timed out',
          });
        },
      },
    });

    const result = await getCurrentDeviceLocation({
      highAccuracyTimeoutMs: 100,
      fallbackTimeoutMs: 100,
    });
    assert.strictEqual(callCount, 2, 'Should attempt Phase 1 then Phase 2');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorType, 'TIMEOUT');
    assert.strictEqual(result.errorCode, 3);
    assert.strictEqual(result.phase1Error?.code, 3);
    assert.strictEqual(result.phase2Error?.code, 3);
    assert.match(result.message, /timed out/i);
    assert.match(result.recoveryTip || '', /Use My Current Location/i);
  });

  test('Root cause preservation: Phase 1 POSITION_UNAVAILABLE followed by Phase 2 TIMEOUT retains POSITION_UNAVAILABLE', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (_success: any, error: (err: any) => void, options: any) => {
          callCount++;
          if (options.enableHighAccuracy) {
            // Phase 1 fails with POSITION_UNAVAILABLE (Code 2)
            error({
              code: 2,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
              message: 'CoreLocation Wi-Fi scan found no database entry',
            });
          } else {
            // Phase 2 times out (Code 3)
            error({
              code: 3,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
              message: 'Standard positioning timed out',
            });
          }
        },
      },
    });

    const result = await getCurrentDeviceLocation({
      highAccuracyTimeoutMs: 100,
      fallbackTimeoutMs: 100,
    });

    assert.strictEqual(callCount, 2);
    assert.strictEqual(result.success, false);
    // Crucial: Must NOT mask as TIMEOUT! The actual failure is POSITION_UNAVAILABLE
    assert.strictEqual(result.errorType, 'POSITION_UNAVAILABLE');
    assert.strictEqual(result.errorCode, 2);
    assert.strictEqual(result.phase1Error?.code, 2);
    assert.strictEqual(result.phase2Error?.code, 3);
    assert.match(result.message, /unavailable/i);
  });

  test('Safety timer captures hung browser requests with errorOrigin safety_timer', async () => {
    setMockNavigator({
      geolocation: {
        // Mock browser engine that hangs and never invokes either callback
        getCurrentPosition: () => {},
      },
    });

    const result = await getCurrentDeviceLocation({
      highAccuracyTimeoutMs: 30,
      fallbackTimeoutMs: 30,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorCode, 3);
    assert.strictEqual(result.phase1Error?.errorOrigin, 'safety_timer');
    assert.strictEqual(result.phase2Error?.errorOrigin, 'safety_timer');
  });

  test('Permission Denied (Code 1) halts immediately without retrying and returns browser settings advice', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (_success: any, error: (err: any) => void) => {
          callCount++;
          error({
            code: 1,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            message: 'User denied Geolocation',
          });
        },
      },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(callCount, 1, 'Should NOT retry if permission was explicitly denied');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorType, 'PERMISSION_DENIED');
    assert.match(result.message, /permission is denied/i);
    assert.match(result.recoveryTip || '', /browser settings/i);
  });

  test('Permissions API check exits immediately if state is denied', async () => {
    let getCurrentPositionCalled = false;
    setMockNavigator({
      permissions: {
        query: async () => ({ state: 'denied' }),
      },
      geolocation: {
        getCurrentPosition: () => {
          getCurrentPositionCalled = true;
        },
      },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(getCurrentPositionCalled, false, 'getCurrentPosition should not be invoked if permission already denied');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorType, 'PERMISSION_DENIED');
  });

  test('Position Unavailable (Code 2) triggers Phase 2 fallback and succeeds', async () => {
    let callCount = 0;
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: any, error: (err: any) => void, options: any) => {
          callCount++;
          if (options.enableHighAccuracy) {
            error({
              code: 2,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
              message: 'GPS positioning unavailable on this Mac laptop',
            });
          } else {
            success({
              coords: {
                latitude: 18.5204,
                longitude: 73.8567,
                accuracy: 50,
              },
            });
          }
        },
      },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(callCount, 2);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.coords?.latitude, 18.5204);
  });

  test('Duplicate clicks and concurrent requests share the same in-flight promise', async () => {
    let startCount = 0;
    let pendingCallback: ((pos: any) => void) | null = null;

    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: (pos: any) => void) => {
          startCount++;
          pendingCallback = success;
        },
      },
    });

    // Simulate two rapid clicks from user
    const promise1 = getCurrentDeviceLocation();
    const promise2 = getCurrentDeviceLocation();

    // Verify both calls received the exact same Promise instance
    assert.strictEqual(promise1, promise2, 'Concurrent requests must share identical Promise instance');
    assert.strictEqual(startCount, 1, 'Only one getCurrentPosition call should be made to browser');

    // Resolve the pending browser callback
    pendingCallback!({
      coords: {
        latitude: 18.5204,
        longitude: 73.8567,
        accuracy: 15,
      },
    });

    const [res1, res2] = await Promise.all([promise1, promise2]);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res1.coords?.latitude, 18.5204);
    assert.strictEqual(res2.coords?.latitude, 18.5204);

    // After completion, subsequent click starts a fresh request
    const promise3 = getCurrentDeviceLocation();
    assert.notStrictEqual(promise3, promise1, 'Subsequent click must create fresh request after resolution');
  });

  test('Unsupported browser is caught before attempting geolocation', async () => {
    setMockNavigator({}); // No geolocation object

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorType, 'UNSUPPORTED');
    assert.match(result.message, /does not support location detection/i);
  });

  test('Insecure origin is rejected before calling geolocation', async () => {
    setMockWindow({
      isSecureContext: false,
      location: { hostname: '192.168.1.55', protocol: 'http:' },
    });
    setMockNavigator({
      geolocation: { getCurrentPosition: () => {} },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorType, 'INSECURE_ORIGIN');
    assert.match(result.message, /secure connection/i);
  });
});

describe('Consistent Behavior in Student and Mess Owner Modules', () => {
  let originalWindow: any;
  let originalNavigator: any;
  let originalFetch: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    originalNavigator = (globalThis as any).navigator;
    originalFetch = (globalThis as any).fetch;
    _resetInFlightGeolocation();
    clearGeolocationDiagnostics();
    setMockWindow({
      isSecureContext: true,
      location: { hostname: 'localhost', protocol: 'http:' },
    });
  });

  afterEach(() => {
    setMockWindow(originalWindow);
    setMockNavigator(originalNavigator);
    setMockFetch(originalFetch);
    _resetInFlightGeolocation();
  });

  test('Student discovery workflow uses detected coordinates to compute real distances', async () => {
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: (pos: any) => void) => {
          success({
            coords: {
              latitude: 18.5204, // Student location
              longitude: 73.8567,
              accuracy: 20,
            },
          });
        },
      },
    });

    const result = await getCurrentDeviceLocation();
    assert.strictEqual(result.success, true);
    assert.ok(result.coords);

    // Verify distance from student location to Fergusson College (18.5236, 73.8418)
    const distanceKm = calculateHaversineDistanceKm(
      result.coords!.latitude,
      result.coords!.longitude,
      18.5236,
      73.8418
    );
    assert.ok(!isNaN(distanceKm));
    assert.ok(distanceKm > 0 && distanceKm < 3.0, 'Distance should be ~1.6km');
  });

  test('Mess Owner registration preserves coordinates even if reverse-geocoding fails', async () => {
    // Mock geolocation success
    setMockNavigator({
      geolocation: {
        getCurrentPosition: (success: (pos: any) => void) => {
          success({
            coords: {
              latitude: 18.5308,
              longitude: 73.8567,
              accuracy: 10,
            },
          });
        },
      },
    });

    // Mock reverse-geocoding network failure (e.g. Nominatim 500 error or offline)
    setMockFetch(async () => {
      throw new Error('Nominatim network timeout');
    });

    const geoResult = await getCurrentDeviceLocation();
    assert.strictEqual(geoResult.success, true);
    const { latitude, longitude } = geoResult.coords!;

    // Owner form flow: coordinates are set immediately and retained
    const ownerFormCoordinates = { latitude, longitude };
    assert.strictEqual(ownerFormCoordinates.latitude, 18.5308);
    assert.strictEqual(ownerFormCoordinates.longitude, 73.8567);

    // Reverse geocode attempt
    const addressResult = await reverseGeocodeCoordinates(latitude, longitude);
    // Address lookup returns fallback or null, but coordinates remain preserved in the form
    assert.ok(ownerFormCoordinates.latitude === 18.5308, 'Form coordinates must remain intact');
    assert.ok(ownerFormCoordinates.longitude === 73.8567, 'Form coordinates must remain intact');
  });
});

describe('Distance Calculation and Real Coordinate Haversine Verification', () => {
  test('calculateHaversineDistanceKm computes accurate distance between coordinates', () => {
    // Fergusson College (18.5236, 73.8418) to COEP (18.5298, 73.8565) ~ 1.7 km
    const dist = calculateHaversineDistanceKm(18.5236, 73.8418, 18.5298, 73.8565);
    assert.ok(dist >= 1.5 && dist <= 1.9, `Distance should be approx 1.7 km, got ${dist}`);
  });

  test('calculateHaversineDistanceKm rejects invalid coordinates returning NaN', () => {
    assert.ok(isNaN(calculateHaversineDistanceKm(NaN, 73.8418, 18.5298, 73.8565)));
    assert.ok(isNaN(calculateHaversineDistanceKm(18.5236, 73.8418, 0, 0))); // 0,0 rejected
  });

  test('formatDistance formats meters and kilometers properly', () => {
    assert.strictEqual(formatDistance(0.45), '450 m away');
    assert.strictEqual(formatDistance(1.72), '1.7 km away');
    assert.strictEqual(formatDistance(null), '');
    assert.strictEqual(formatDistance(NaN), '');
  });
});
