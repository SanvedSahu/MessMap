import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  getGeolocationDiagnostics,
  clearGeolocationDiagnostics,
  subscribeToGeolocationDiagnostics,
  getCurrentDeviceLocation,
  isGeolocationSupported,
  isSecureContextEnvironment,
  GeolocationDiagnosticEntry,
  GeolocationResult,
} from '../../../utils/geolocation';

interface GeolocationDiagnosticPanelProps {
  onLocationDetected?: (coords: { latitude: number; longitude: number }) => void;
}

export const GeolocationDiagnosticPanel: React.FC<GeolocationDiagnosticPanelProps> = ({
  onLocationDetected,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [diagnostics, setDiagnostics] = useState<GeolocationDiagnosticEntry[]>([]);
  const [permissionState, setPermissionState] = useState<string>('checking...');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<GeolocationResult | null>(null);

  // Subscribe to live geolocation diagnostic events
  useEffect(() => {
    const unsubscribe = subscribeToGeolocationDiagnostics((entries) => {
      setDiagnostics([...entries]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Inspect Permissions API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => {
            setPermissionState(status.state);
          };
        })
        .catch(() => {
          setPermissionState('unsupported');
        });
    } else {
      setPermissionState('unsupported (Safari / WebKit standard)');
    }
  }, []);

  const handleTest = async (testType: 'full' | 'high_only' | 'standard_only' | 'cached') => {
    setIsTesting(true);
    try {
      let res: GeolocationResult;
      if (testType === 'full') {
        res = await getCurrentDeviceLocation();
      } else if (testType === 'high_only') {
        res = await getCurrentDeviceLocation({ fallbackTimeoutMs: 0 });
      } else if (testType === 'standard_only') {
        res = await getCurrentDeviceLocation({ highAccuracyTimeoutMs: 0 });
      } else {
        // Cached test with 10 min cache allowance
        res = await getCurrentDeviceLocation({ maximumAgeMs: 600000 });
      }

      setLastResult(res);
      if (res.success && res.coords && onLocationDetected) {
        onLocationDetected(res.coords);
      }
    } catch (err: any) {
      setLastResult({
        success: false,
        errorType: 'POSITION_UNAVAILABLE',
        errorCode: 2,
        message: err?.message || 'Unhandled diagnostic exception',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearGeolocationDiagnostics();
    setLastResult(null);
  };

  const supported = isGeolocationSupported();
  const secure = isSecureContextEnvironment();

  // Extract Phase 1 and Phase 2 diagnostics from recent history
  const recentEntries = diagnostics.slice(-10).reverse();
  const phase1Entries = diagnostics.filter((d) => d.phase === 'high_accuracy');
  const phase2Entries = diagnostics.filter((d) => d.phase === 'standard_fallback');
  const lastPhase1 = phase1Entries[phase1Entries.length - 1];
  const lastPhase2 = phase2Entries[phase2Entries.length - 1];

  const getErrorCodeLabel = (code?: number) => {
    switch (code) {
      case 1:
        return 'Code 1 (PERMISSION_DENIED)';
      case 2:
        return 'Code 2 (POSITION_UNAVAILABLE)';
      case 3:
        return 'Code 3 (TIMEOUT)';
      default:
        return code ? `Code ${code}` : 'None';
    }
  };

  return (
    <div
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #334155',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
        fontSize: '0.82rem',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      }}
    >
      {/* Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: '#1e293b',
          borderBottom: isOpen ? '1px solid #334155' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#38bdf8" />
          <span style={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
            GEOLOCATION DIAGNOSTICS & TELEMETRY
          </span>
          <span
            style={{
              background: '#0369a1',
              color: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Live Safari / Browser Monitor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isTesting && (
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={13} className="spin" /> Querying Device...
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Toggle Panel"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '14px 16px' }}>
          {/* Environment Status Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>Geolocation API</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginTop: '2px' }}>
                {supported ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                <span>{supported ? 'Supported' : 'Not Supported'}</span>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>Secure Origin</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginTop: '2px' }}>
                {secure ? <ShieldCheck size={14} color="#10b981" /> : <AlertTriangle size={14} color="#f59e0b" />}
                <span>{secure ? 'Yes (localhost/HTTPS)' : 'Insecure Origin'}</span>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>Permissions State</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginTop: '2px' }}>
                <Clock size={14} color="#38bdf8" />
                <span
                  style={{
                    color:
                      permissionState === 'granted'
                        ? '#10b981'
                        : permissionState === 'denied'
                        ? '#ef4444'
                        : '#f59e0b',
                  }}
                >
                  {permissionState}
                </span>
              </div>
            </div>
          </div>

          {/* Two-Phase Execution Summary */}
          <div
            style={{
              background: '#1e293b',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              marginBottom: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={15} /> Two-Phase Acquisition Breakdown
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {/* Phase 1 Box */}
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                  Phase 1: High Accuracy (GPS / Precision Wi-Fi)
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <div>Status: <span style={{ color: lastPhase1?.status === 'success' ? '#10b981' : '#f8fafc' }}>{lastPhase1?.status || 'Not invoked yet'}</span></div>
                  <div>Elapsed: <span style={{ color: '#f8fafc' }}>{lastPhase1?.durationMs != null ? `${lastPhase1.durationMs} ms` : '—'}</span></div>
                  <div>Error Code: <span style={{ color: lastPhase1?.browserErrorCode ? '#ef4444' : '#94a3b8' }}>{getErrorCodeLabel(lastPhase1?.browserErrorCode)}</span></div>
                  <div>Callback Source: <span style={{ color: '#38bdf8' }}>{lastPhase1?.errorOrigin || '—'}</span></div>
                  {lastPhase1?.browserErrorMessage && (
                    <div style={{ color: '#fca5a5', marginTop: '4px', wordBreak: 'break-word' }}>
                      Message: "{lastPhase1.browserErrorMessage}"
                    </div>
                  )}
                </div>
              </div>

              {/* Phase 2 Box */}
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                  Phase 2: Standard Fallback (Wi-Fi / Cached Pos)
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <div>Fallback Started: <span style={{ color: lastPhase2 ? '#10b981' : '#94a3b8' }}>{lastPhase2 ? 'Yes' : 'No'}</span></div>
                  <div>Status: <span style={{ color: lastPhase2?.status === 'success' ? '#10b981' : '#f8fafc' }}>{lastPhase2?.status || '—'}</span></div>
                  <div>Elapsed: <span style={{ color: '#f8fafc' }}>{lastPhase2?.durationMs != null ? `${lastPhase2.durationMs} ms` : '—'}</span></div>
                  <div>Error Code: <span style={{ color: lastPhase2?.browserErrorCode ? '#ef4444' : '#94a3b8' }}>{getErrorCodeLabel(lastPhase2?.browserErrorCode)}</span></div>
                  <div>Callback Source: <span style={{ color: '#38bdf8' }}>{lastPhase2?.errorOrigin || '—'}</span></div>
                  {lastPhase2?.browserErrorMessage && (
                    <div style={{ color: '#fca5a5', marginTop: '4px', wordBreak: 'break-word' }}>
                      Message: "{lastPhase2.browserErrorMessage}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Last Result & Analysis */}
          {lastResult && (
            <div
              style={{
                background: lastResult.success ? '#064e3b' : '#450a0a',
                border: `1px solid ${lastResult.success ? '#059669' : '#dc2626'}`,
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {lastResult.success ? '✓ Location Detection Succeeded' : '✗ Location Detection Failed'}
              </div>
              <div style={{ color: '#f8fafc', fontSize: '0.78rem' }}>
                <div>Result Message: {lastResult.message}</div>
                {lastResult.coords && (
                  <div>Accuracy: ±{Math.round(lastResult.coords.accuracy || 0)} meters (coordinates preserved in application state)</div>
                )}
                {lastResult.recoveryTip && (
                  <div style={{ color: '#fef08a', marginTop: '4px' }}>
                    Tip: {lastResult.recoveryTip}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Targeted Safari / macOS Troubleshooting Helper */}
          <div
            style={{
              background: '#0f172a',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '14px',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <HelpCircle size={14} /> Safari & macOS Diagnostics Guide
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', lineHeight: '1.5' }}>
              <li>
                <strong>Code 1 (PERMISSION_DENIED)</strong>: Safari website setting is set to "Deny". In Safari, choose <em>Safari → Settings for This Website → Location → Allow</em>.
              </li>
              <li>
                <strong>Code 2 (POSITION_UNAVAILABLE)</strong>: macOS CoreLocation cannot determine position. Mac laptops have no GPS hardware; location is computed via nearby Wi-Fi BSSID database lookup. Ensure Wi-Fi is powered ON in macOS menu bar.
              </li>
              <li>
                <strong>Code 3 (TIMEOUT)</strong>: CoreLocation hung or timed out. On macOS Sequoia/Sonoma, open <em>System Settings → Privacy & Security → Location Services</em>. Ensure master switch is <strong>ON</strong> and <strong>Safari</strong> is enabled in the list.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleTest('full')}
              disabled={isTesting}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Test Full Two-Phase Flow
            </button>

            <button
              type="button"
              onClick={() => handleTest('high_only')}
              disabled={isTesting}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Test High Accuracy Only
            </button>

            <button
              type="button"
              onClick={() => handleTest('standard_only')}
              disabled={isTesting}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Test Standard Fallback Only
            </button>

            <button
              type="button"
              onClick={() => handleTest('cached')}
              disabled={isTesting}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Test Cached Position (maxAge 10m)
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
              }}
            >
              <Trash2 size={12} /> Clear Log
            </button>
          </div>

          {/* Recent Raw Diagnostic Events */}
          {recentEntries.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Recent Diagnostic Telemetry ({recentEntries.length} events)
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.7rem', color: '#cbd5e1' }}>
                {recentEntries.map((entry, idx) => (
                  <div key={idx} style={{ padding: '2px 0', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ color: '#38bdf8' }}>[{new Date(entry.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{entry.phase}</span>:{' '}
                    <span
                      style={{
                        color:
                          entry.status === 'success'
                            ? '#10b981'
                            : entry.status === 'failed' || entry.status === 'timeout'
                            ? '#ef4444'
                            : '#f59e0b',
                      }}
                    >
                      {entry.status}
                    </span>{' '}
                    {entry.durationMs != null ? `(${entry.durationMs}ms)` : ''}{' '}
                    {entry.browserErrorCode ? `[${getErrorCodeLabel(entry.browserErrorCode)}]` : ''}{' '}
                    {entry.browserErrorMessage ? `"${entry.browserErrorMessage}"` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
