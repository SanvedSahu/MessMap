import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Save,
  Coffee,
  Sun,
  Moon,
  Sparkles,
  Wifi,
  Droplets,
  Award,
  Plus,
  X,
  Check,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useOutletContext } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../../context/AuthContext';
import type { OwnerOutletContextType } from '../layouts/OwnerLayout';
import {
  getOwnerProfileApi,
  updateOwnerProfileApi,
  getOwnerMessApi,
  updateOwnerMessProfileApi,
  createMessApi,
  updateMessTimingsApi,
  updateMessAmenitiesApi,
} from '../../../api/ownerApi';
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
  isValidCoordinates,
  POPULAR_PUNE_AREAS,
} from '../../../utils/geocoding';
import './ProfilePage.css';

// Custom Map Marker Pin for Mess Owner Location
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
const MapEventsHandler: React.FC<{
  isEditing: boolean;
  onPinMove: (lat: number, lng: number) => void;
  center: [number, number];
}> = ({ isEditing, onPinMove, center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);

  useMapEvents({
    click(e) {
      if (isEditing) {
        onPinMove(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const outletCtx = useOutletContext<OwnerOutletContextType | null>();
  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com';
  const storageKey = `messmap_owner_profile_${user.id}`;

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user-scoped saved profile data or use defaults
  const savedProfile = (() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  })();

  // Track if this owner has an active mess profile
  const [hasMess, setHasMess] = useState<boolean>(() => {
    if (outletCtx?.ownerMess) return true;
    if (user.messId) return true;
    if (isDemoOwner) return true;
    if (savedProfile?.messName) return true;
    return false;
  });

  // Profile data states
  const [messName, setMessName] = useState(
    savedProfile?.messName || (isDemoOwner ? 'Annapurna Deluxe Mess' : '')
  );
  const [ownerName, setOwnerName] = useState(
    savedProfile?.ownerName || user.name || (isDemoOwner ? 'Rajesh Sharma' : '')
  );
  const [phone, setPhone] = useState(
    savedProfile?.phone || user.phone || (isDemoOwner ? '+91 98231 44550' : '')
  );
  const [email, setEmail] = useState(
    savedProfile?.email || user.email || (isDemoOwner ? 'contact@annapurnamess.com' : '')
  );

  // Unified Location State
  const [location, setLocation] = useState<{
    address: string;
    area: string;
    city: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }>({
    address:
      savedProfile?.address ||
      (isDemoOwner
        ? 'Shop No. 4 & 5, Near Bharati Vidyapeeth Gate 2, Katraj-Kondhwa Road'
        : ''),
    area: savedProfile?.area || (isDemoOwner ? 'Katraj' : 'Shivaji Nagar'),
    city: savedProfile?.city || 'Pune',
    pincode: savedProfile?.pincode || (isDemoOwner ? '411046' : '411004'),
    latitude: savedProfile?.latitude != null ? Number(savedProfile.latitude) : 18.5204,
    longitude: savedProfile?.longitude != null ? Number(savedProfile.longitude) : 73.8567,
  });

  const [geocodingStatus, setGeocodingStatus] = useState<string | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Pricing & Description states
  const [monthlyPrice, setMonthlyPrice] = useState(savedProfile?.monthlyPrice || '3200');
  const [dailyPrice, setDailyPrice] = useState(savedProfile?.dailyPrice || '110');
  const [description, setDescription] = useState(
    savedProfile?.description ||
      (isDemoOwner
        ? 'Serving hygienic, homemade traditional Maharashtrian and North Indian thalis for college students and working professionals since 2018. Daily fresh rotis, seasonal vegetables, and unlimited rice.'
        : 'Authentic homestyle dining for college students with daily fresh meals and affordable monthly subscriptions.')
  );

  // Operating Timings
  const [breakfastTiming, setBreakfastTiming] = useState(
    savedProfile?.breakfastTiming || '7:30 AM – 10:00 AM'
  );
  const [lunchTiming, setLunchTiming] = useState(
    savedProfile?.lunchTiming || '12:30 PM – 3:30 PM'
  );
  const [dinnerTiming, setDinnerTiming] = useState(
    savedProfile?.dinnerTiming || '7:30 PM – 10:30 PM'
  );

  // Amenities & Highlights
  const [amenities, setAmenities] = useState<string[]>(
    savedProfile?.amenities || [
      'RO Filtered Water',
      'Unlimited Roti / Rice',
      'Free High-Speed WiFi',
      'Airy Seating (60+ Diners)',
      'Daily Cleanliness Checks',
      'Tiffin Delivery Service',
    ]
  );
  const [customAmenity, setCustomAmenity] = useState('');

  // Load live owner profile and mess details from backend if JWT token exists
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerProfileApi(token)
        .then((res) => {
          if (res?.data) {
            if (res.data.name) setOwnerName(res.data.name);
            if (res.data.phone) setPhone(res.data.phone);
            if (res.data.email) setEmail(res.data.email);
            if (res.data.messes && res.data.messes.length > 0) {
              setHasMess(true);
              const primaryMess = res.data.messes[0];
              if (primaryMess.name) setMessName(primaryMess.name);
              if (primaryMess.address) {
                setLocation((prev) => ({
                  ...prev,
                  address: primaryMess.address || prev.address,
                  area: primaryMess.area || prev.area,
                  city: primaryMess.city || prev.city,
                  pincode: primaryMess.pincode || prev.pincode,
                  latitude: primaryMess.latitude != null ? Number(primaryMess.latitude) : prev.latitude,
                  longitude: primaryMess.longitude != null ? Number(primaryMess.longitude) : prev.longitude,
                }));
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Backend profile fetch note:', err.message);
        });

      getOwnerMessApi(token)
        .then((res) => {
          if (res?.data) {
            setHasMess(true);
            const m = res.data;
            if (m.name) setMessName(m.name);
            if (m.phone) setPhone(m.phone);
            if (m.email) setEmail(m.email);
            if (m.monthlyPrice != null) setMonthlyPrice(String(m.monthlyPrice));
            if (m.dailyPrice != null) setDailyPrice(String(m.dailyPrice));
            if (m.description) setDescription(m.description);
            if (m.breakfastTiming) setBreakfastTiming(m.breakfastTiming);
            if (m.lunchTiming) setLunchTiming(m.lunchTiming);
            if (m.dinnerTiming) setDinnerTiming(m.dinnerTiming);
            if (m.amenities && m.amenities.length > 0) {
              setAmenities(m.amenities);
            }
            setLocation((prev) => ({
              address: m.address || prev.address,
              area: m.area || prev.area,
              city: m.city || prev.city,
              pincode: m.pincode || prev.pincode,
              latitude: m.latitude != null ? Number(m.latitude) : prev.latitude,
              longitude: m.longitude != null ? Number(m.longitude) : prev.longitude,
            }));
          }
        })
        .catch((err) => {
          if (
            err.message &&
            (err.message.includes('not found') || err.message.includes('No mess'))
          ) {
            if (!isDemoOwner) {
              setHasMess(false);
            }
          } else {
            console.warn('Backend mess profile fetch note:', err.message);
          }
        });
    }
  }, [user.id, isDemoOwner]);

  // Synchronize form fields whenever active owner mess is switched or loaded
  useEffect(() => {
    if (outletCtx?.ownerMess) {
      setHasMess(true);
      const m = outletCtx.ownerMess;
      if (m.name) setMessName(m.name);
      if (m.phone) setPhone(m.phone);
      if (m.email) setEmail(m.email);
      if (m.monthlyPrice != null) setMonthlyPrice(String(m.monthlyPrice));
      if (m.dailyPrice != null) setDailyPrice(String(m.dailyPrice));
      if (m.description) setDescription(m.description);
      if (m.breakfastTiming) setBreakfastTiming(m.breakfastTiming);
      if (m.lunchTiming) setLunchTiming(m.lunchTiming);
      if (m.dinnerTiming) setDinnerTiming(m.dinnerTiming);
      if (m.amenities && m.amenities.length > 0) {
        setAmenities(m.amenities);
      }
      setLocation((prev) => ({
        address: m.address || prev.address,
        area: m.area || prev.area,
        city: m.city || prev.city,
        pincode: m.pincode || prev.pincode,
        latitude: m.latitude != null ? Number(m.latitude) : prev.latitude,
        longitude: m.longitude != null ? Number(m.longitude) : prev.longitude,
      }));
    }
  }, [outletCtx?.ownerMess]);

  const commonAmenities = [
    'RO Filtered Water',
    'Unlimited Roti / Rice',
    'Free High-Speed WiFi',
    'Airy Seating (60+ Diners)',
    'Daily Cleanliness Checks',
    'Tiffin Delivery Service',
    'Pure Veg Kitchen',
    'Air Conditioned',
    'CCTV Security',
    'Separate Handwash Area',
  ];

  const handleToggleAmenity = (name: string) => {
    setAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = (e: React.MouseEvent) => {
    e.preventDefault();
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities((prev) => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleRemoveAmenity = (name: string) => {
    setAmenities((prev) => prev.filter((a) => a !== name));
  };

  // Forward geocode address -> update latitude and longitude
  const handleAddressGeocode = async (
    addr = location.address,
    ar = location.area,
    ct = location.city
  ) => {
    if (!addr.trim() && !ar.trim()) {
      setGeocodingError('Please enter a street address or locality to locate on the map.');
      return;
    }
    setIsGeocoding(true);
    setGeocodingError(null);
    setGeocodingStatus('Geocoding location...');

    try {
      const geo = await geocodeAddress(addr, ar, ct);
      if (geo && isValidCoordinates(geo.latitude, geo.longitude)) {
        setLocation((prev) => ({
          ...prev,
          latitude: Number(geo.latitude.toFixed(6)),
          longitude: Number(geo.longitude.toFixed(6)),
          pincode: geo.pincode || prev.pincode,
          city: geo.city || prev.city,
        }));
        setGeocodingStatus(`Location pinned at ${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E`);
      } else {
        setGeocodingError('Unable to automatically find location. Please drag the pin on the map to set your position.');
        setGeocodingStatus(null);
      }
    } catch {
      setGeocodingError('Geocoding service unavailable. You can click on the map or drag the pin to set coordinates.');
      setGeocodingStatus(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Reverse geocode when pin is moved or map is clicked
  const handlePinMoved = async (lat: number, lng: number) => {
    if (!isValidCoordinates(lat, lng)) {
      setGeocodingError('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }
    setGeocodingError(null);
    const fixedLat = Number(lat.toFixed(6));
    const fixedLng = Number(lng.toFixed(6));

    setLocation((prev) => ({
      ...prev,
      latitude: fixedLat,
      longitude: fixedLng,
    }));
    setGeocodingStatus('Reverse-geocoding address from pin...');

    try {
      const rev = await reverseGeocodeCoordinates(fixedLat, fixedLng);
      if (rev) {
        setLocation((prev) => ({
          ...prev,
          address: rev.address || prev.address,
          area: rev.area || prev.area,
          city: rev.city || prev.city,
          pincode: rev.pincode || prev.pincode,
          latitude: fixedLat,
          longitude: fixedLng,
        }));
        setGeocodingStatus(`Pin synchronized at ${fixedLat.toFixed(4)}° N, ${fixedLng.toFixed(4)}° E`);
      } else {
        setGeocodingStatus(`Coordinates set to ${fixedLat.toFixed(4)}° N, ${fixedLng.toFixed(4)}° E`);
      }
    } catch {
      setGeocodingStatus(`Coordinates set to ${fixedLat.toFixed(4)}° N, ${fixedLng.toFixed(4)}° E`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messName.trim()) {
      alert('Mess business name is required.');
      return;
    }
    if (!location.address.trim()) {
      alert('Physical street address is required.');
      return;
    }
    if (!isValidCoordinates(location.latitude, location.longitude)) {
      alert('Valid map coordinates are required. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }

    const dataToSave = {
      messName,
      ownerName,
      phone,
      email,
      address: location.address,
      area: location.area,
      city: location.city,
      pincode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
      monthlyPrice,
      dailyPrice,
      description,
      breakfastTiming,
      lunchTiming,
      dinnerTiming,
      amenities,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      const token = localStorage.getItem('messmap_auth_token');
      if (token) {
        await updateOwnerProfileApi(token, {
          name: ownerName,
          phone,
        });

        try {
          await updateOwnerMessProfileApi(token, {
            name: messName,
            address: location.address,
            area: location.area,
            city: location.city,
            pincode: location.pincode,
            phone,
            latitude: location.latitude,
            longitude: location.longitude,
            monthlyPrice: Number(monthlyPrice) || 0,
            dailyPrice: Number(dailyPrice) || 0,
            description,
          });
        } catch (updateErr: any) {
          if (
            updateErr?.message?.includes('No mess profile found') ||
            updateErr?.message?.includes('not found')
          ) {
            const createRes = await createMessApi(token, {
              name: messName,
              address: location.address,
              area: location.area,
              city: location.city,
              pincode: location.pincode,
              phone,
              latitude: location.latitude,
              longitude: location.longitude,
              monthlyPrice: Number(monthlyPrice) || 0,
              dailyPrice: Number(dailyPrice) || 0,
              description,
            });
            if (createRes?.data?.id) {
              updateProfile({
                messId: String(createRes.data.id),
                messName: createRes.data.name,
              });
            }
          } else {
            console.warn('Update mess profile warning:', updateErr);
          }
        }

        await updateMessTimingsApi(token, {
          breakfastTiming,
          lunchTiming,
          dinnerTiming,
        });
        await updateMessAmenitiesApi(token, {
          amenities,
        });
      }
    } catch (err: any) {
      console.warn('Backend sync warning:', err.message);
    }

    if (outletCtx?.refreshOwnerMess) {
      try {
        await outletCtx.refreshOwnerMess();
      } catch {
        // ignore
      }
    }

    setHasMess(true);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // If newly registered owner has not created a mess profile yet
  if (!hasMess && !isEditing) {
    return (
      <div className="profile-page-container">
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '2rem auto',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Store size={36} color="#10b981" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '0.6rem',
              color: 'var(--text-primary)',
            }}
          >
            You haven't created your mess profile yet.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Register your mess business location, meal plans, pricing, and operating timings to make
            your mess discoverable to college students across Pune.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setIsEditing(true);
              setHasMess(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.8rem 1.8rem',
              fontWeight: 700,
            }}
          >
            <Plus size={18} /> Create Mess Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Top Notification Toast */}
      {saveSuccess && (
        <div className="save-toast-banner">
          <CheckCircle2 size={18} />
          <span>Mess Profile updated successfully! Changes are live for students.</span>
        </div>
      )}

      {/* Profile Header Hero */}
      <section className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-box">
            <Store size={36} className="store-icon" />
          </div>
          <div className="profile-title-area">
            <div className="title-row">
              <h2 className="mess-display-name">{messName || 'My Mess Business'}</h2>
              <span className="badge badge-green">
                <ShieldCheck size={14} /> {isDemoOwner ? 'Verified by Admin' : 'Active Owner Profile'}
              </span>
            </div>
            <p className="owner-subline">Managed by {ownerName || user.name || 'Owner'}</p>
            <div className="meta-pills">
              <span className="meta-pill">
                <MapPin size={13} /> {location.area ? `${location.area}, ${location.city}` : location.city || 'Pune'}
              </span>
              <span className="meta-pill">
                <Award size={13} /> Pure Veg & Non-Veg
              </span>
              {isDemoOwner && <span className="meta-pill">4.7 ★ (94 Reviews)</span>}
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Mess Details
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setGeocodingError(null);
                setGeocodingStatus(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Details Form / View */}
      <form onSubmit={handleSave} className="profile-content-grid">
        {/* Left Column: Basic Details & Location */}
        <div className="profile-col-left">
          <div className="card profile-card">
            <h3 className="card-section-title">Mess Information</h3>
            <p className="card-section-desc">Public information displayed on student search and map pins</p>

            <div className="form-fields-stack">
              <div className="form-group">
                <label className="form-label">Mess Business Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={messName}
                  onChange={(e) => setMessName(e.target.value)}
                  placeholder="e.g. Annapurna Deluxe Mess"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">About / Description</label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Owner Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Email Address</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Map Coordinates */}
          <div className="card profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="card-section-title">Physical Address & Map Location</h3>
                <p className="card-section-desc">
                  Move the map pin or update the address to synchronize latitude & longitude
                </p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleAddressGeocode()}
                  disabled={isGeocoding}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                  }}
                >
                  {isGeocoding ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
                  Find on Map
                </button>
              )}
            </div>

            <div className="form-fields-stack">
              <div className="form-group">
                <label className="form-label">Street Address & Landmark *</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={location.address}
                  onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
                  onBlur={() => {
                    if (isEditing && location.address.trim()) {
                      handleAddressGeocode();
                    }
                  }}
                  placeholder="e.g. Shop No. 4 & 5, Near Bharati Vidyapeeth Gate 2"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Area / Locality *</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  list="profile-area-suggestions"
                  value={location.area}
                  onChange={(e) => setLocation((prev) => ({ ...prev, area: e.target.value }))}
                  onBlur={() => {
                    if (isEditing && location.area.trim()) {
                      handleAddressGeocode();
                    }
                  }}
                  placeholder="e.g. Shivaji Nagar, Kothrud, Hinjewadi"
                  className="form-input"
                  required
                />
                <datalist id="profile-area-suggestions">
                  {POPULAR_PUNE_AREAS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={location.city}
                    onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={location.pincode}
                    onChange={(e) => setLocation((prev) => ({ ...prev, pincode: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Status and Feedback Messages */}
              {geocodingError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{geocodingError}</span>
                </div>
              )}

              {geocodingStatus && !geocodingError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{geocodingStatus}</span>
                </div>
              )}

              {/* Interactive Leaflet Map for Location Selection */}
              <div
                style={{
                  height: '240px',
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  position: 'relative',
                  marginTop: '6px',
                }}
              >
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={14}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[location.latitude, location.longitude]}
                    draggable={isEditing}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        handlePinMoved(pos.lat, pos.lng);
                      },
                    }}
                    icon={pinIcon}
                  />
                  <MapEventsHandler
                    isEditing={isEditing}
                    onPinMove={handlePinMoved}
                    center={[location.latitude, location.longitude]}
                  />
                </MapContainer>
                {isEditing && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 1000,
                      background: 'rgba(255, 255, 255, 0.92)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    Drag pin or click map to relocate
                  </div>
                )}
              </div>

              {/* Coordinates Preview and Manual Adjustment */}
              <div className="coordinates-preview-box">
                <div className="coords-icon-col">
                  <MapPin size={22} className="map-pin-accent" />
                </div>
                <div className="coords-details" style={{ width: '100%' }}>
                  <div className="coords-text">
                    <strong>Latitude:</strong> {location.latitude.toFixed(6)}° N &nbsp;|&nbsp;{' '}
                    <strong>Longitude:</strong> {location.longitude.toFixed(6)}° E
                  </div>
                  <span className="coords-badge">Geo-Synchronized via Leaflet OpenStreetMap</span>

                  {isEditing && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginTop: '10px',
                      }}
                    >
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          Manual Latitude (-90 to 90)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          min="-90"
                          max="90"
                          value={location.latitude}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setLocation((prev) => ({ ...prev, latitude: val }));
                            }
                          }}
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          Manual Longitude (-180 to 180)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          min="-180"
                          max="180"
                          value={location.longitude}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setLocation((prev) => ({ ...prev, longitude: val }));
                            }
                          }}
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Hours, Facilities */}
        <div className="profile-col-right">
          {/* Pricing Plans */}
          <div className="card profile-card">
            <h3 className="card-section-title">Pricing & Meal Plans</h3>
            <div className="pricing-mini-grid">
              <div className="price-item-box">
                <span className="price-label">Monthly Plan (2 Meals/Day)</span>
                <div className="price-val-wrap">
                  <span className="rupee">₹</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="inline-price-input"
                  />
                  <span className="duration">/ month</span>
                </div>
              </div>

              <div className="price-item-box">
                <span className="price-label">Single Meal / Daily Thali</span>
                <div className="price-val-wrap">
                  <span className="rupee">₹</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="inline-price-input"
                  />
                  <span className="duration">/ thali</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="card profile-card">
            <h3 className="card-section-title">Daily Operating Hours</h3>
            <div className="form-fields-stack">
              <div className="timing-slot-row">
                <div className="timing-label">
                  <Coffee size={16} /> Breakfast
                </div>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={breakfastTiming}
                  onChange={(e) => setBreakfastTiming(e.target.value)}
                  className="timing-input"
                />
              </div>

              <div className="timing-slot-row">
                <div className="timing-label">
                  <Sun size={16} /> Lunch Thali
                </div>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={lunchTiming}
                  onChange={(e) => setLunchTiming(e.target.value)}
                  className="timing-input"
                />
              </div>

              <div className="timing-slot-row">
                <div className="timing-label">
                  <Moon size={16} /> Dinner Thali
                </div>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={dinnerTiming}
                  onChange={(e) => setDinnerTiming(e.target.value)}
                  className="timing-input"
                />
              </div>
            </div>
          </div>

          {/* Amenities & Badges */}
          <div className="card profile-card">
            <h3 className="card-section-title">Facilities & Amenities</h3>
            <p className="card-section-desc">Select features available at your mess premise</p>

            {isEditing ? (
              <div className="edit-amenities-wrap">
                <div className="common-amenities-grid">
                  {commonAmenities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleAmenity(item)}
                      className={`amenity-choice-chip ${amenities.includes(item) ? 'active' : ''}`}
                    >
                      {amenities.includes(item) ? <Check size={14} /> : <Plus size={14} />}
                      {item}
                    </button>
                  ))}
                </div>

                <div className="custom-amenity-row">
                  <input
                    type="text"
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="form-input"
                  />
                  <button type="button" onClick={handleAddCustomAmenity} className="btn btn-secondary">
                    Add
                  </button>
                </div>

                <div className="active-amenities-review">
                  <span className="active-label">Currently Selected:</span>
                  <div className="active-tags-flow">
                    {amenities.map((item) => (
                      <span key={item} className="active-tag-pill">
                        {item}
                        <button type="button" onClick={() => handleRemoveAmenity(item)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="facilities-tags-wrap">
                {amenities.map((item) => (
                  <span key={item} className="facility-tag">
                    {item.includes('Water') ? (
                      <Droplets size={14} />
                    ) : item.includes('WiFi') ? (
                      <Wifi size={14} />
                    ) : item.includes('Roti') ? (
                      <Sparkles size={14} />
                    ) : (
                      <Check size={14} color="var(--primary)" />
                    )}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save Action If Editing */}
          {isEditing && (
            <div className="profile-save-banner">
              <p>You have unsaved changes.</p>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
