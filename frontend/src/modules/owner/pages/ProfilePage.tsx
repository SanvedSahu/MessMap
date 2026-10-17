import React, { useState } from 'react';
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
} from 'lucide-react';
import { useEffect } from 'react';
import { getOwnerProfileApi, updateOwnerProfileApi } from '../../../api/ownerApi';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved profile data or use defaults
  const savedProfile = (() => {
    try {
      const item = localStorage.getItem('messmap_owner_profile_data');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  })();

  // Profile data states
  const [messName, setMessName] = useState(savedProfile?.messName || 'Annapurna Deluxe Mess');
  const [ownerName, setOwnerName] = useState(savedProfile?.ownerName || 'Rajesh Sharma');
  const [phone, setPhone] = useState(savedProfile?.phone || '+91 98231 44550');
  const [email, setEmail] = useState(savedProfile?.email || 'contact@annapurnamess.com');

  // Load live owner profile from backend if JWT token exists
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
              const primaryMess = res.data.messes[0];
              if (primaryMess.name) setMessName(primaryMess.name);
              if (primaryMess.address) setAddress(primaryMess.address);
              if (primaryMess.city) setCity(primaryMess.city);
            }
          }
        })
        .catch((err) => {
          console.warn('Backend profile fetch note:', err.message);
        });
    }
  }, []);
  const [address, setAddress] = useState(
    savedProfile?.address || 'Shop No. 4 & 5, Near Bharati Vidyapeeth Gate 2, Katraj-Kondhwa Road'
  );
  const [city, setCity] = useState(savedProfile?.city || 'Pune');
  const [pincode, setPincode] = useState(savedProfile?.pincode || '411046');
  const [monthlyPrice, setMonthlyPrice] = useState(savedProfile?.monthlyPrice || '3200');
  const [dailyPrice, setDailyPrice] = useState(savedProfile?.dailyPrice || '110');
  const [description, setDescription] = useState(
    savedProfile?.description ||
      'Serving hygienic, homemade traditional Maharashtrian and North Indian thalis for college students and working professionals since 2018. Daily fresh rotis, seasonal vegetables, and unlimited rice.'
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      messName,
      ownerName,
      phone,
      email,
      address,
      city,
      pincode,
      monthlyPrice,
      dailyPrice,
      description,
      breakfastTiming,
      lunchTiming,
      dinnerTiming,
      amenities,
    };
    try {
      localStorage.setItem('messmap_owner_profile_data', JSON.stringify(dataToSave));
      const token = localStorage.getItem('messmap_auth_token');
      if (token) {
        await updateOwnerProfileApi(token, {
          name: ownerName,
          phone,
        });
      }
    } catch (err: any) {
      console.warn('Backend sync warning:', err.message);
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

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
              <h2 className="mess-display-name">{messName}</h2>
              <span className="badge badge-green">
                <ShieldCheck size={14} /> Verified by Admin
              </span>
            </div>
            <p className="owner-subline">Managed by {ownerName} • Estd. 2018</p>
            <div className="meta-pills">
              <span className="meta-pill"><MapPin size={13} /> Katraj, Pune</span>
              <span className="meta-pill"><Award size={13} /> Pure Veg</span>
              <span className="meta-pill">4.7 ★ (94 Reviews)</span>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Mess Details
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
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
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">About the Mess</label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
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
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Contact Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
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
                />
              </div>
            </div>
          </div>

          {/* Location & Map Coordinates */}
          <div className="card profile-card">
            <h3 className="card-section-title">Physical Address & Map Location</h3>
            <p className="card-section-desc">Required for student distance calculations and route navigation</p>

            <div className="form-fields-stack">
              <div className="form-group">
                <label className="form-label">Street Address & Landmark</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Coordinates Preview Box */}
              <div className="coordinates-preview-box">
                <div className="coords-icon-col">
                  <MapPin size={22} className="map-pin-accent" />
                </div>
                <div className="coords-details">
                  <div className="coords-text">
                    <strong>Latitude:</strong> 18.4575° N &nbsp;|&nbsp; <strong>Longitude:</strong> 73.8508° E
                  </div>
                  <span className="coords-badge">Geo-Verified via Leaflet OpenStreetMap</span>
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
                <span className="price-label">Walk-in Thali (Single Meal)</span>
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

          {/* Operating Timings */}
          <div className="card profile-card">
            <h3 className="card-section-title">Operating Timings</h3>
            <div className="timings-list">
              <div className="timing-row">
                <div className="timing-type">
                  <Coffee size={16} className="timing-icon" />
                  <span>Breakfast</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={breakfastTiming}
                    onChange={(e) => setBreakfastTiming(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '200px', padding: '4px 8px', fontSize: '0.82rem' }}
                    placeholder="e.g. 7:30 AM – 10:00 AM"
                  />
                ) : (
                  <span className="timing-hours">{breakfastTiming}</span>
                )}
              </div>

              <div className="timing-row">
                <div className="timing-type">
                  <Sun size={16} className="timing-icon" />
                  <span>Lunch</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={lunchTiming}
                    onChange={(e) => setLunchTiming(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '200px', padding: '4px 8px', fontSize: '0.82rem' }}
                    placeholder="e.g. 12:30 PM – 3:30 PM"
                  />
                ) : (
                  <span className="timing-hours">{lunchTiming}</span>
                )}
              </div>

              <div className="timing-row">
                <div className="timing-type">
                  <Moon size={16} className="timing-icon" />
                  <span>Dinner</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={dinnerTiming}
                    onChange={(e) => setDinnerTiming(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '200px', padding: '4px 8px', fontSize: '0.82rem' }}
                    placeholder="e.g. 7:30 PM – 10:30 PM"
                  />
                ) : (
                  <span className="timing-hours">{dinnerTiming}</span>
                )}
              </div>
            </div>
          </div>

          {/* Amenities & Highlights */}
          <div className="card profile-card">
            <h3 className="card-section-title">Amenities & Highlights</h3>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click to select/unselect common amenities or add your own:
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {commonAmenities.map((item) => {
                    const isSelected = amenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleAmenity(item)}
                        style={{
                          background: isSelected ? 'var(--primary-light)' : '#f8fafc',
                          color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isSelected ? <Check size={12} /> : <Plus size={12} />}
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Add custom amenity */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="Add custom amenity..."
                    className="form-input"
                    style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
                          setAmenities((prev) => [...prev, customAmenity.trim()]);
                          setCustomAmenity('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="btn btn-outline btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    + Add
                  </button>
                </div>

                {/* Currently selected tags preview with remove */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Active on Mess Profile ({amenities.length}):
                  </div>
                  <div className="facilities-tags-wrap">
                    {amenities.map((item) => (
                      <span key={item} className="facility-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0 2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove amenity"
                        >
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
                    {item.includes('Water') ? <Droplets size={14} /> :
                     item.includes('WiFi') ? <Wifi size={14} /> :
                     item.includes('Roti') ? <Sparkles size={14} /> :
                     <Check size={14} color="var(--primary)" />}
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
