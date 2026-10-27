import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Store,
  MapPin,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Clock,
  Sparkles,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import { useMessData } from '../../context/MessDataContext';
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
  isValidCoordinates,
} from '../../utils/geocoding';

// Custom Map Marker Pin for Mess Registration Location
const pinIcon = L.divIcon({
  className: 'mess-location-pin',
  html: `
    <div style="
      background: #10b981;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #ffffff;
      cursor: pointer;
    ">
      <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Helper component to synchronize Leaflet map view when coordinates change and handle map clicks
const RegisterMapEventsHandler: React.FC<{
  onPinMove: (lat: number, lng: number) => void;
  center: [number, number];
}> = ({ onPinMove, center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);

  useMapEvents({
    click(e) {
      onPinMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const RegisterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerStudent, registerOwner } = useAuth();
  const { registerMess } = useMessData();

  const roleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<'student' | 'owner'>(
    roleParam === 'owner' ? 'owner' : 'student'
  );

  useEffect(() => {
    if (roleParam === 'owner') {
      setActiveRole('owner');
    } else if (roleParam === 'student') {
      setActiveRole('student');
    }
  }, [roleParam]);

  const handleRoleChange = (role: 'student' | 'owner') => {
    setActiveRole(role);
    setSearchParams({ role });
    setError(null);
  };

  // Shared form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student specific
  const [college, setCollege] = useState('');

  // Owner specific (Mess profile details)
  const [messName, setMessName] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>({
    latitude: 18.5204,
    longitude: 73.8567,
  });
  const [geoStatus, setGeoStatus] = useState<string>('Coordinates synchronized (Pune Center)');
  const [isManualLocation, setIsManualLocation] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState<boolean>(false);
  const [pincodeUnavailable, setPincodeUnavailable] = useState<boolean>(false);
  const reverseGeocodeCounterRef = useRef<number>(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [foodType, setFoodType] = useState<'Pure Veg' | 'Veg & Non-Veg'>('Pure Veg');
  const [monthlyPrice, setMonthlyPrice] = useState('3200');
  const [dailyPrice, setDailyPrice] = useState('100');
  const [operatingHours, setOperatingHours] = useState('7:30 AM – 10:30 PM');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize coordinates when street address changes - ONLY if not manually pinned or device-located
  useEffect(() => {
    if (activeRole !== 'owner') return;
    if (isManualLocation) return;
    if (!address.trim() || address.trim().length < 3) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const geo = await geocodeAddress(address, undefined, city);
        if (isMounted && geo && !isManualLocation) {
          setCoordinates({ latitude: geo.latitude, longitude: geo.longitude });
          setGeoStatus(`Address centroid: ${geo.latitude.toFixed(6)}° N, ${geo.longitude.toFixed(6)}° E (Click map to lock exact entrance)`);
        }
      } catch {
        if (isMounted) {
          setGeoStatus('Locality centroid placeholder');
        }
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [address, city, activeRole, isManualLocation]);

  /**
   * Reverse-geocodes exact coordinates and auto-fills Area / Campus Locality and PIN Code.
   * Uses an asynchronous request counter ref to prevent race conditions from rapid map clicks or pin drags.
   */
  const resolveLocationDetails = async (lat: number, lng: number) => {
    const currentRequestId = ++reverseGeocodeCounterRef.current;
    setIsResolvingLocation(true);
    // Never retain a stale PIN code when the location changes
    setPincode('');
    setPincodeUnavailable(false);

    try {
      const rev = await reverseGeocodeCoordinates(lat, lng);
      // Older response must never overwrite newer location selection
      if (currentRequestId !== reverseGeocodeCounterRef.current) {
        return;
      }

      if (rev) {
        if (rev.area) {
          setArea(rev.area);
        } else {
          setArea('');
        }

        if (rev.city) {
          setCity(rev.city);
        }

        if (rev.pincode) {
          setPincode(rev.pincode);
          setPincodeUnavailable(false);
        } else {
          setPincode('');
          setPincodeUnavailable(true);
        }

        // Auto-suggest street address if empty
        if (!address.trim() && rev.address) {
          setAddress(rev.address);
        }
      } else {
        setArea('');
        setPincode('');
        setPincodeUnavailable(true);
      }
    } catch {
      if (currentRequestId !== reverseGeocodeCounterRef.current) return;
      setArea('');
      setPincode('');
      setPincodeUnavailable(true);
    } finally {
      if (currentRequestId === reverseGeocodeCounterRef.current) {
        setIsResolvingLocation(false);
      }
    }
  };

  const handlePinMoved = (lat: number, lng: number) => {
    if (!isValidCoordinates(lat, lng)) {
      setGeoError('Invalid coordinates selected. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }
    setGeoError(null);
    setIsManualLocation(true);
    const fixedLat = Number(lat.toFixed(6));
    const fixedLng = Number(lng.toFixed(6));
    setCoordinates({ latitude: fixedLat, longitude: fixedLng });
    setGeoStatus(`Manually pinned at ${fixedLat.toFixed(6)}° N, ${fixedLng.toFixed(6)}° E`);

    resolveLocationDetails(fixedLat, fixedLng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please pin your mess entrance directly on the map.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (!isValidCoordinates(lat, lng)) {
          setGeoError('Device returned invalid geographic coordinates.');
          return;
        }

        setIsManualLocation(true);
        setCoordinates({ latitude: lat, longitude: lng });
        setGeoStatus(`Device location set to ${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`);

        resolveLocationDetails(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow location access in your browser or click on the map to pin your mess.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Device location information is unavailable. Please click or drag the marker on the map to pin your mess.');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out. Please try again or pin your mess directly on the map.');
            break;
          default:
            setGeoError('Unable to detect device location. Please pin your mess directly on the map.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeRole === 'student') {
        const result = await registerStudent({
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          college: college.trim() || undefined,
        });
        if (result.success) {
          navigate('/student/dashboard');
        } else {
          setError(result.error || 'Student registration failed. Please try again.');
        }
      } else {
        // Owner Registration
        if (!messName.trim()) {
          setError('Please provide your mess business name.');
          return;
        }
        if (!address.trim()) {
          setError('Please enter the mess physical address.');
          return;
        }
        if (!isManualLocation) {
          setError('Please pin your physical mess location on the map or click "Use My Current Location".');
          return;
        }
        if (!isValidCoordinates(coordinates.latitude, coordinates.longitude)) {
          setError('Please specify a valid physical location on the map (-90 to 90 lat, -180 to 180 lng).');
          return;
        }
        if (isResolvingLocation) {
          setError('Resolving location details from the map. Please wait a moment and submit again.');
          return;
        }

        const resolvedArea = area.trim() || 'Campus Area';

        // 1. Submit Mess Details to Verification Queue (creates with status: 'Pending')
        const newMessId = registerMess({
          name: messName.trim(),
          ownerName: fullName.trim(),
          ownerEmail: email.trim(),
          ownerPhone: phone.trim(),
          address: address.trim(),
          area: resolvedArea,
          foodType: foodType,
          monthlyPrice: Number(monthlyPrice) || 3000,
          dailyPrice: Number(dailyPrice) || 100,
          description: description.trim() || 'Homestyle hygienic dining for college students.',
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        } as any);

        // 2. Register Owner Account linked to this pending mess (backend registration + mess creation)
        const regRes = await registerOwner({
          name: fullName.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          messName: messName.trim(),
          messId: newMessId,
          address: address.trim(),
          area: resolvedArea,
          city: city.trim() || 'Pune',
          pincode: pincode.trim() || undefined,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          foodType: foodType === 'Pure Veg' ? 'VEG' : 'BOTH',
          monthlyPrice: Number(monthlyPrice) || 3000,
          dailyPrice: Number(dailyPrice) || 100,
          description: description.trim() || 'Homestyle hygienic dining for college students.',
        });

        if (regRes && !regRes.success) {
          setError(regRes.error || 'Owner registration failed.');
          return;
        }

        // 3. Immediately show the Pending Approval screen as required by Section 5.C
        navigate('/owner/pending-approval', {
          state: {
            messId: regRes.messId || newMessId,
            messName: messName.trim(),
            ownerName: fullName.trim(),
            area: resolvedArea,
            city: city.trim(),
            status: 'Pending',
          },
        });
      }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Brand Header */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '2rem',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
          }}
        >
          <MapPin size={22} />
        </div>
        <span>MessMap</span>
      </Link>

      {/* Form Card */}
      <div
        className="card"
        style={{
          maxWidth: activeRole === 'owner' ? '650px' : '500px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Role Tab Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: activeRole === 'student' ? '#ffffff' : 'transparent',
              color: activeRole === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeRole === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={17} /> Student Sign Up
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('owner')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: activeRole === 'owner' ? '#ffffff' : 'transparent',
              color: activeRole === 'owner' ? '#d97706' : 'var(--text-muted)',
              boxShadow: activeRole === 'owner' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Store size={17} /> Register Your Mess
          </button>
        </div>

        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {activeRole === 'student' ? 'Create Student Account' : 'Register Mess Service'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {activeRole === 'student'
              ? 'Join fellow campus students to discover verified messes, track meal passes, and rate meals.'
              : 'Submit your mess for campus verification. Once approved by admin, your mess appears in live student search.'}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal Credentials */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.4rem',
                marginBottom: '1rem',
              }}
            >
              1. Account Information
            </h4>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-fullname">
                {activeRole === 'student' ? 'Full Name' : 'Owner / Manager Full Name'} *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder={activeRole === 'student' ? 'e.g. Rahul Patil' : 'e.g. Rajesh Sharma'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="user@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+91 98220 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Phone
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
            </div>

            {activeRole === 'student' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-college">
                  College / Institute Name
                </label>
                <input
                  id="reg-college"
                  type="text"
                  placeholder="e.g. COEP Technological University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.4rem' }}
                    required
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  At least 6 characters
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirmpass">
                  Confirm Password *
                </label>
                <input
                  id="reg-confirmpass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password (min 6)"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mess Profile (Only for Mess Owner) */}
          {activeRole === 'owner' && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.4rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Store size={16} color="#d97706" /> 2. Mess Listing Details (Submitted for Admin Verification)
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-messname">
                  Mess Name *
                </label>
                <input
                  id="reg-messname"
                  type="text"
                  placeholder="e.g. Annapurna Deluxe Dining"
                  value={messName}
                  onChange={(e) => setMessName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-address">
                    Street Address *
                  </label>
                  <input
                    id="reg-address"
                    type="text"
                    placeholder="Shop / Plot Number, Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="reg-area" style={{ marginBottom: 0 }}>
                      Area / Campus Locality *
                    </label>
                    {isResolvingLocation && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary, #10b981)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={11} className="spin" /> Resolving...
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      id="reg-area"
                      type="text"
                      readOnly
                      placeholder={
                        isResolvingLocation
                          ? 'Resolving area from map...'
                          : 'Select a location on the map'
                      }
                      value={area}
                      className="form-input"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle, #f8fafc)',
                        cursor: 'default',
                        paddingRight: isResolvingLocation ? '2.2rem' : undefined,
                      }}
                    />
                    {isResolvingLocation && (
                      <RefreshCw
                        size={14}
                        className="spin"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {area
                      ? 'Auto-filled from mess location pin'
                      : isResolvingLocation
                      ? 'Detecting area from map coordinates...'
                      : isManualLocation
                      ? 'Area name unavailable for this pin. You can retry or reposition marker.'
                      : 'Click map or use device location to auto-detect area.'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-city">
                    City *
                  </label>
                  <input
                    id="reg-city"
                    type="text"
                    placeholder="e.g. Pune, Pimpri-Chinchwad, Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="reg-pincode" style={{ marginBottom: 0 }}>
                      Postal Code / Pincode
                    </label>
                    {isResolvingLocation && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary, #10b981)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={11} className="spin" /> Resolving...
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      id="reg-pincode"
                      type="text"
                      readOnly
                      placeholder={
                        isResolvingLocation
                          ? 'Resolving PIN code...'
                          : pincodeUnavailable
                          ? 'PIN code unavailable for this location'
                          : 'Select a location on the map'
                      }
                      value={pincode}
                      className="form-input"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle, #f8fafc)',
                        cursor: 'default',
                        color: pincodeUnavailable && !pincode ? 'var(--text-muted)' : 'inherit',
                        paddingRight: isResolvingLocation ? '2.2rem' : undefined,
                      }}
                    />
                    {isResolvingLocation && (
                      <RefreshCw
                        size={14}
                        className="spin"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      />
                    )}
                  </div>
                  {pincode ? (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Auto-filled from mess location pin
                    </span>
                  ) : pincodeUnavailable ? (
                    <span style={{ fontSize: '0.74rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} /> PIN code unavailable for this location
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      {isResolvingLocation
                        ? 'Detecting PIN code from map...'
                        : 'Auto-populated when location is pinned.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Location Pinning & Current Device Location Map */}
              <div
                style={{
                  background: 'var(--bg-card-subtle, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <h5
                      style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <MapPin size={16} color="var(--primary, #10b981)" /> Physical Mess Location Pin *
                    </h5>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Click the map or drag the pin to your exact entrance. (Sets physical mess location for student discovery).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="btn btn-outline btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '5px 12px',
                    }}
                  >
                    {isLocating ? (
                      <RefreshCw size={14} className="spin" />
                    ) : (
                      <Crosshair size={14} color="var(--primary)" />
                    )}
                    {isLocating ? 'Detecting Location...' : 'Use My Current Location'}
                  </button>
                </div>

                {/* Geolocation / Validation Error Alert */}
                {geoError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{geoError}</span>
                  </div>
                )}

                {/* Coordinates Feedback Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                    background: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>Coordinates:</strong> {coordinates.latitude.toFixed(6)}° N, {coordinates.longitude.toFixed(6)}° E
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isResolvingLocation && (
                      <span style={{ fontSize: '0.72rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} className="spin" /> Resolving location...
                      </span>
                    )}
                    {isManualLocation && !isResolvingLocation && (!area || !pincode) && (
                      <button
                        type="button"
                        onClick={() => resolveLocationDetails(coordinates.latitude, coordinates.longitude)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.72rem', padding: '2px 6px', height: 'auto', color: 'var(--primary, #10b981)' }}
                      >
                        Retry reverse geocode
                      </button>
                    )}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isManualLocation ? '#059669' : '#d97706',
                        background: isManualLocation ? '#ecfdf5' : '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {isManualLocation ? '✓ Exact Pin Locked' : 'Default Centroid (Click map to pin)'}
                    </span>
                  </div>
                </div>

                {/* Leaflet Map */}
                <div
                  style={{
                    height: '240px',
                    width: '100%',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
                  }}
                >
                  <MapContainer
                    center={[coordinates.latitude, coordinates.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[coordinates.latitude, coordinates.longitude]}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const marker = e.target;
                          const pos = marker.getLatLng();
                          handlePinMoved(pos.lat, pos.lng);
                        },
                      }}
                      icon={pinIcon}
                    />
                    <RegisterMapEventsHandler
                      onPinMove={handlePinMoved}
                      center={[coordinates.latitude, coordinates.longitude]}
                    />
                  </MapContainer>
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 1000,
                      background: 'rgba(255, 255, 255, 0.94)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      pointerEvents: 'none',
                    }}
                  >
                    🖱️ Click map or drag marker to entrance
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-foodtype">
                    Food Category
                  </label>
                  <select
                    id="reg-foodtype"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Veg & Non-Veg">Veg & Non-Veg</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-monthlyprice">
                    Monthly Fee (₹)
                  </label>
                  <input
                    id="reg-monthlyprice"
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="form-input"
                    min="1000"
                    max="15000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-dailyprice">
                    Daily Meal (₹)
                  </label>
                  <input
                    id="reg-dailyprice"
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="form-input"
                    min="40"
                    max="300"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-hours">
                  Daily Operating Hours
                </label>
                <input
                  id="reg-hours"
                  type="text"
                  placeholder="e.g. 7:30 AM – 10:30 PM (Lunch 12:30-3:00, Dinner 7:30-10:30)"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-description">
                  Mess Description & Specialties
                </label>
                <textarea
                  id="reg-description"
                  rows={2}
                  placeholder="Describe your menu specialties, hygiene practices, and dining capacity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: activeRole === 'owner' ? '#d97706' : 'var(--primary)',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting
              ? 'Creating Account...'
              : (activeRole === 'student' ? 'Complete Registration & Start' : 'Submit Mess for Verification →')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link
            to={`/login?role=${activeRole}`}
            style={{ color: activeRole === 'owner' ? '#d97706' : 'var(--primary)', fontWeight: 700 }}
          >
            Sign in here →
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          ← Back to Public Home
        </Link>
      </div>
    </div>
  );
};
