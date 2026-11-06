/**
 * MessMap Resilient Geolocation Service
 * File: frontend/src/utils/geolocation.ts
 *
 * Provides a production-grade, two-phase device location service using the browser Geolocation API.
 * Features:
 * - Immediate permission query check where supported.
 * - In-flight promise deduplication to prevent concurrent duplicate requests from multiple clicks.
 * - Phase 1: High-accuracy acquisition (5s timeout).
 * - Phase 2: Standard-accuracy fallback using watchPosition with automatic cleanup to overcome
 *   WebKit/Safari desktop getCurrentPosition stall bugs, with reasonable 10-minute cache window.
 * - Preserves actual browser error codes (Code 1: PERMISSION_DENIED, Code 2: POSITION_UNAVAILABLE, Code 3: TIMEOUT)
 *   without converting POSITION_UNAVAILABLE into generic timeouts.
 * - Early termination on PERMISSION_DENIED without misleading retries.
 * - Stale and out-of-order callback protection via settled guards and safety timers.
 * - Coordinate range and non-finite validation, allowing zero on a single axis (Equator/Prime Meridian)
 *   while rejecting uninitialized (0, 0) Null Island coordinates.
 * - Safe, non-sensitive diagnostic telemetry for optional developer debugging.
 */

export interface DetectedCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type GeolocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'INSECURE_ORIGIN'
  | 'INVALID_COORDINATES';

export interface PhaseErrorInfo {
  phase: 'high_accuracy' | 'standard_fallback';
  code: number;
  message: string;
  durationMs: number;
  errorOrigin: 'browser_callback' | 'safety_timer' | 'exception';
}

export interface GeolocationDiagnosticEntry {
  phase: 'permissions_check' | 'high_accuracy' | 'standard_fallback' | 'concurrent_deduplication';
  status: 'initiated' | 'success' | 'failed' | 'timeout';
  durationMs?: number;
  browserErrorCode?: number;
  browserErrorMessage?: string;
  errorOrigin?: 'browser_callback' | 'safety_timer' | 'exception';
  accuracyMeters?: number;
  timestamp: number;
}

export interface GeolocationResult {
  success: boolean;
  coords?: DetectedCoordinates;
  errorType?: GeolocationErrorType;
  errorCode?: number; // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  message: string;
  recoveryTip?: string;
  phase1Error?: PhaseErrorInfo;
  phase2Error?: PhaseErrorInfo;
  fallbackAttempted?: boolean;
  diagnostics?: GeolocationDiagnosticEntry[];
}

export interface GeolocationOptions {
  /** High accuracy timeout in milliseconds (default: 5000 = 5s) */
  highAccuracyTimeoutMs?: number;
  /** Fallback standard accuracy timeout in milliseconds (default: 8000 = 8s) */
  fallbackTimeoutMs?: number;
  /** Maximum cached position age in milliseconds for fallback (default: 600000 = 10 min) */
  maximumAgeMs?: number;
  /** Allow (0, 0) coordinates if explicitly intended (default: false) */
  allowZero?: boolean;
}

// Bounded in-memory rolling diagnostic log (max 50 entries)
const MAX_DIAGNOSTIC_HISTORY = 50;
const diagnosticHistory: GeolocationDiagnosticEntry[] = [];

// Optional diagnostic event listeners for live UI diagnostic panels
type DiagnosticListener = (entries: GeolocationDiagnosticEntry[]) => void;
const diagnosticListeners: Set<DiagnosticListener> = new Set();

export function subscribeToGeolocationDiagnostics(listener: DiagnosticListener): () => void {
  diagnosticListeners.add(listener);
  listener([...diagnosticHistory]);
  return () => {
    diagnosticListeners.delete(listener);
  };
}

/**
 * Records a safe diagnostic entry.
 * Coordinates, credentials, and sensitive data are strictly excluded.
 */
export function recordDiagnostic(entry: Omit<GeolocationDiagnosticEntry, 'timestamp'>): void {
  const fullEntry: GeolocationDiagnosticEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  diagnosticHistory.push(fullEntry);
  if (diagnosticHistory.length > MAX_DIAGNOSTIC_HISTORY) {
    diagnosticHistory.shift();
  }

  // Notify active UI listeners
  diagnosticListeners.forEach((listener) => {
    try {
      listener([...diagnosticHistory]);
    } catch {
      // Ignore
    }
  });

  // Optional debug logging in non-production environments when debug flag is set
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    (window as any).__MESSMAP_DEBUG_GEO__
  ) {
    console.debug(`[MessMap Geolocation] ${entry.phase}: ${entry.status} (${entry.durationMs ?? 0}ms)`, {
      browserErrorCode: entry.browserErrorCode,
      browserErrorMessage: entry.browserErrorMessage,
      errorOrigin: entry.errorOrigin,
      accuracyMeters: entry.accuracyMeters,
    });
  }
}

/**
 * Returns a copy of the recent diagnostic telemetry entries.
 */
export function getGeolocationDiagnostics(): GeolocationDiagnosticEntry[] {
  return [...diagnosticHistory];
}

/**
 * Clears the diagnostic telemetry history.
 */
export function clearGeolocationDiagnostics(): void {
  diagnosticHistory.length = 0;
  diagnosticListeners.forEach((listener) => {
    try {
      listener([]);
    } catch {
      // Ignore
    }
  });
}

/**
 * Validates geographic coordinates.
 * Strictly rejects null, undefined, NaN, Infinite, out-of-range values.
 * Allows zero on a single axis (e.g. 0° lat on Equator, 0° lng on Greenwich Prime Meridian).
 * Rejects (0, 0) Null Island coordinates unless explicitly allowed via options.allowZero.
 */
export function isValidCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  options?: { allowZero?: boolean }
): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return false;
  }
  if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0) {
    return false;
  }

  // Check if both latitude AND longitude are simultaneously zero (Null Island)
  const isBothZero = Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001;
  if (isBothZero && !options?.allowZero) {
    return false;
  }
  return true;
}

/**
 * Checks if the current browser environment supports Geolocation.
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Checks if the current window context is secure (HTTPS or localhost).
 * Geolocation is blocked by modern browsers on non-secure origins (e.g. LAN HTTP).
 */
export function isSecureContextEnvironment(): boolean {
  if (typeof window === 'undefined') return true;
  if (typeof window.isSecureContext === 'boolean') {
    return window.isSecureContext;
  }
  const hostname = window.location?.hostname || '';
  return (
    window.location?.protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

/**
 * Executes a single navigator.geolocation request wrapped in a Promise.
 * In standard fallback, utilizes watchPosition with immediate cleanup to bypass WebKit/Safari
 * desktop getCurrentPosition stalls on macOS.
 */
function requestPositionPromise(
  options: PositionOptions,
  phase: 'high_accuracy' | 'standard_fallback'
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let watchId: number | null = null;
    const startTime = Date.now();
    const timeoutMs = options.timeout ?? 8000;
    const safetyLimitMs = timeoutMs + 1000;

    const cleanup = () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation?.clearWatch) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {
          // Ignore
        }
        watchId = null;
      }
    };

    const safetyTimer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        const durationMs = Date.now() - startTime;
        recordDiagnostic({
          phase,
          status: 'timeout',
          durationMs,
          browserErrorCode: 3,
          browserErrorMessage: `Position request timed out after ${durationMs}ms`,
          errorOrigin: 'safety_timer',
        });
        const timeoutError = {
          code: 3,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: `Location acquisition timed out after ${durationMs}ms.`,
          errorOrigin: 'safety_timer' as const,
          durationMs,
        };
        reject(timeoutError);
      }
    }, safetyLimitMs);

    const handleSuccess = (position: GeolocationPosition) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(safetyTimer);
      cleanup();
      const durationMs = Date.now() - startTime;
      recordDiagnostic({
        phase,
        status: 'success',
        durationMs,
        accuracyMeters: position.coords?.accuracy,
        errorOrigin: 'browser_callback',
      });
      resolve(position);
    };

    const handleError = (error: GeolocationPositionError) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(safetyTimer);
      cleanup();
      const durationMs = Date.now() - startTime;
      recordDiagnostic({
        phase,
        status: error?.code === 3 ? 'timeout' : 'failed',
        durationMs,
        browserErrorCode: error?.code,
        browserErrorMessage: error?.message,
        errorOrigin: 'browser_callback',
      });
      const enrichedError = {
        code: error?.code ?? 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: error?.message || 'Browser returned location error',
        errorOrigin: 'browser_callback' as const,
        durationMs,
      };
      reject(enrichedError);
    };

    try {
      // In standard fallback, use watchPosition with immediate cleanup to handle Safari macOS CoreLocation streams
      if (phase === 'standard_fallback' && typeof navigator.geolocation.watchPosition === 'function') {
        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
      } else {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
      }
    } catch (invokeError: any) {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(safetyTimer);
      cleanup();
      const durationMs = Date.now() - startTime;
      recordDiagnostic({
        phase,
        status: 'failed',
        durationMs,
        browserErrorMessage: invokeError?.message || 'Synchronous error invoking navigator.geolocation',
        errorOrigin: 'exception',
      });
      reject({
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: invokeError?.message || 'Synchronous exception invoking Geolocation API',
        errorOrigin: 'exception' as const,
        durationMs,
      });
    }
  });
}

/**
 * Builds a structured, user-actionable error result from phase errors.
 * Strictly preserves the true root cause without masking POSITION_UNAVAILABLE as TIMEOUT.
 */
function buildCombinedErrorResult(
  phase1Error?: PhaseErrorInfo,
  phase2Error?: PhaseErrorInfo
): GeolocationResult {
  // 1. Permission Denied (Code 1) always takes highest priority
  if (phase1Error?.code === 1 || phase2Error?.code === 1) {
    return {
      success: false,
      errorType: 'PERMISSION_DENIED',
      errorCode: 1,
      message: 'Location permission is denied.',
      recoveryTip:
        'Please allow location access in your browser settings (Safari → Settings for This Website → Location → Allow) and try again.',
      phase1Error,
      phase2Error,
      fallbackAttempted: Boolean(phase2Error),
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 2. If Phase 1 was POSITION_UNAVAILABLE (Code 2)
  if (phase1Error?.code === 2) {
    return {
      success: false,
      errorType: 'POSITION_UNAVAILABLE',
      errorCode: 2,
      message: 'Device location is currently unavailable on this device.',
      recoveryTip:
        'You can continue searching by campus locality or pin your location directly on the map.',
      phase1Error,
      phase2Error,
      fallbackAttempted: Boolean(phase2Error),
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 3. If Phase 2 was POSITION_UNAVAILABLE (Code 2)
  if (phase2Error?.code === 2) {
    return {
      success: false,
      errorType: 'POSITION_UNAVAILABLE',
      errorCode: 2,
      message: 'Device location is currently unavailable on this device.',
      recoveryTip:
        'You can continue searching by campus locality or pin your location directly on the map.',
      phase1Error,
      phase2Error,
      fallbackAttempted: true,
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 4. Pure Timeout: Both phases returned Code 3
  if (phase1Error?.code === 3 && (!phase2Error || phase2Error?.code === 3)) {
    return {
      success: false,
      errorType: 'TIMEOUT',
      errorCode: 3,
      message: 'Location request timed out.',
      recoveryTip:
        'Please click "Use My Current Location" to try again, or search by campus locality.',
      phase1Error,
      phase2Error,
      fallbackAttempted: Boolean(phase2Error),
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 5. Default generic unavailable
  const finalError = phase2Error || phase1Error;
  return {
    success: false,
    errorType: 'POSITION_UNAVAILABLE',
    errorCode: finalError?.code ?? 2,
    message: finalError?.message || 'Unable to detect device location.',
    recoveryTip: 'You can continue searching by campus locality or pin directly on the map.',
    phase1Error,
    phase2Error,
    fallbackAttempted: Boolean(phase2Error),
    diagnostics: getGeolocationDiagnostics(),
  };
}

// In-flight request singleton promise to deduplicate concurrent requests
let inFlightRequest: Promise<GeolocationResult> | null = null;
let inFlightTimeoutId: any = null;

/**
 * Resets the active in-flight request singleton.
 * Exported for testing and state isolation.
 */
export function _resetInFlightGeolocation(): void {
  if (inFlightTimeoutId) {
    clearTimeout(inFlightTimeoutId);
    inFlightTimeoutId = null;
  }
  inFlightRequest = null;
}

/**
 * Core implementation of two-phase device location detection.
 */
async function executeDeviceLocationAcquisition(
  opts: GeolocationOptions = {}
): Promise<GeolocationResult> {
  const {
    highAccuracyTimeoutMs = 5000,
    fallbackTimeoutMs = 8000,
    maximumAgeMs = 600000,
    allowZero = false,
  } = opts;

  // 1. Check browser support
  if (!isGeolocationSupported()) {
    recordDiagnostic({
      phase: 'permissions_check',
      status: 'failed',
      browserErrorMessage: 'Geolocation API unsupported in current environment',
    });
    return {
      success: false,
      errorType: 'UNSUPPORTED',
      errorCode: 2,
      message: 'Your browser does not support location detection.',
      recoveryTip: 'You can continue searching or pinning by campus locality or college name.',
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 2. Check secure context
  if (!isSecureContextEnvironment()) {
    recordDiagnostic({
      phase: 'permissions_check',
      status: 'failed',
      browserErrorMessage: 'Insecure origin blocked geolocation',
    });
    return {
      success: false,
      errorType: 'INSECURE_ORIGIN',
      errorCode: 1,
      message: 'Location access requires a secure connection (HTTPS or localhost).',
      recoveryTip: 'Your browser blocked location because the site is served over an insecure origin (HTTP).',
      diagnostics: getGeolocationDiagnostics(),
    };
  }

  // 3. Early permission status check if Permissions API is supported
  if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (status && status.state === 'denied') {
        recordDiagnostic({
          phase: 'permissions_check',
          status: 'failed',
          browserErrorCode: 1,
          browserErrorMessage: 'Permissions API reported state: denied',
        });
        return {
          success: false,
          errorType: 'PERMISSION_DENIED',
          errorCode: 1,
          message: 'Location permission is denied.',
          recoveryTip:
            'Please allow location access in your browser settings (Safari → Settings for This Website → Location → Allow) and try again.',
          diagnostics: getGeolocationDiagnostics(),
        };
      }
    } catch {
      // Some browsers (e.g. older Safari) do not support querying geolocation permissions; proceed normally
    }
  }

  // Helper to validate coordinates and build success result
  const buildSuccessResult = (
    pos: GeolocationPosition,
    phase: 'high_accuracy' | 'standard_fallback',
    phase1Error?: PhaseErrorInfo
  ): GeolocationResult | null => {
    const rawLat = pos.coords.latitude;
    const rawLng = pos.coords.longitude;
    const lat = Number(rawLat.toFixed(6));
    const lng = Number(rawLng.toFixed(6));

    if (!isValidCoordinates(lat, lng, { allowZero })) {
      return null;
    }
    return {
      success: true,
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy: pos.coords.accuracy,
      },
      message: `Location detected (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
      phase1Error,
      fallbackAttempted: phase === 'standard_fallback',
      diagnostics: getGeolocationDiagnostics(),
    };
  };

  // Phase 1: High Accuracy attempt (short 5s timeout; on Mac without GPS this fails quickly with Code 2)
  recordDiagnostic({ phase: 'high_accuracy', status: 'initiated' });
  let phase1Error: PhaseErrorInfo | undefined;

  try {
    const pos = await requestPositionPromise(
      {
        enableHighAccuracy: true,
        timeout: highAccuracyTimeoutMs,
        maximumAge: 30000, // Allow 30s fresh position
      },
      'high_accuracy'
    );

    const successResult = buildSuccessResult(pos, 'high_accuracy');
    if (successResult) {
      return successResult;
    }
    return {
      success: false,
      errorType: 'INVALID_COORDINATES',
      errorCode: 2,
      message: 'Device returned invalid geographic coordinates.',
      recoveryTip: 'Please search by campus locality or pin directly on the map.',
      diagnostics: getGeolocationDiagnostics(),
    };
  } catch (err: any) {
    phase1Error = {
      phase: 'high_accuracy',
      code: err?.code ?? 2,
      message: err?.message || 'High accuracy position request failed',
      durationMs: err?.durationMs ?? 0,
      errorOrigin: err?.errorOrigin ?? 'browser_callback',
    };

    // If permission was explicitly denied, do not attempt fallback
    if (phase1Error.code === 1) {
      return buildCombinedErrorResult(phase1Error, undefined);
    }
  }

  // Phase 2: Standard Accuracy fallback with reasonable 10-minute cache window
  recordDiagnostic({ phase: 'standard_fallback', status: 'initiated' });
  let phase2Error: PhaseErrorInfo | undefined;

  try {
    const pos = await requestPositionPromise(
      {
        enableHighAccuracy: false,
        timeout: fallbackTimeoutMs,
        maximumAge: maximumAgeMs,
      },
      'standard_fallback'
    );

    const fallbackSuccessResult = buildSuccessResult(pos, 'standard_fallback', phase1Error);
    if (fallbackSuccessResult) {
      return fallbackSuccessResult;
    }
    return {
      success: false,
      errorType: 'INVALID_COORDINATES',
      errorCode: 2,
      message: 'Device returned invalid geographic coordinates.',
      recoveryTip: 'Please search by campus locality or pin directly on the map.',
      phase1Error,
      fallbackAttempted: true,
      diagnostics: getGeolocationDiagnostics(),
    };
  } catch (fallbackErr: any) {
    phase2Error = {
      phase: 'standard_fallback',
      code: fallbackErr?.code ?? 2,
      message: fallbackErr?.message || 'Standard accuracy fallback request failed',
      durationMs: fallbackErr?.durationMs ?? 0,
      errorOrigin: fallbackErr?.errorOrigin ?? 'browser_callback',
    };

    return buildCombinedErrorResult(phase1Error, phase2Error);
  }
}

/**
 * Resilient device location acquisition service:
 * 1. Deduplicates concurrent in-flight requests so multiple rapid clicks share a single query.
 * 2. Checks browser support and secure context.
 * 3. Inspects permission state via Permissions API if available.
 * 4. Phase 1: High Accuracy (5s timeout).
 * 5. Phase 2: Standard Accuracy fallback using watchPosition and 10-minute cache window.
 * 6. Preserves actual error causes (Code 1, 2, 3) without converting failures to generic timeouts.
 */
export function getCurrentDeviceLocation(
  opts: GeolocationOptions = {}
): Promise<GeolocationResult> {
  if (inFlightRequest) {
    recordDiagnostic({
      phase: 'concurrent_deduplication',
      status: 'initiated',
    });
    return inFlightRequest;
  }

  const overallMaxMs = (opts.highAccuracyTimeoutMs ?? 5000) + (opts.fallbackTimeoutMs ?? 8000) + 2000;
  inFlightTimeoutId = setTimeout(() => {
    inFlightRequest = null;
  }, overallMaxMs);

  inFlightRequest = executeDeviceLocationAcquisition(opts).finally(() => {
    if (inFlightTimeoutId) {
      clearTimeout(inFlightTimeoutId);
      inFlightTimeoutId = null;
    }
    inFlightRequest = null;
  });

  return inFlightRequest;
}
