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
  Award
} from 'lucide-react';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile data states
  const [messName, setMessName] = useState('Annapurna Deluxe Mess');
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('+91 98231 44550');
  const [email, setEmail] = useState('contact@annapurnamess.com');
  const [address, setAddress] = useState('Shop No. 4 & 5, Near Bharati Vidyapeeth Gate 2, Katraj-Kondhwa Road');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411046');
  const [monthlyPrice, setMonthlyPrice] = useState('3200');
  const [dailyPrice, setDailyPrice] = useState('110');
  const [description, setDescription] = useState(
    'Serving hygienic, homemade traditional Maharashtrian and North Indian thalis for college students and working professionals since 2018. Daily fresh rotis, seasonal vegetables, and unlimited rice.'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
                <span className="timing-hours">7:30 AM – 10:00 AM</span>
              </div>
              <div className="timing-row">
                <div className="timing-type">
                  <Sun size={16} className="timing-icon" />
                  <span>Lunch</span>
                </div>
                <span className="timing-hours">12:30 PM – 3:30 PM</span>
              </div>
              <div className="timing-row">
                <div className="timing-type">
                  <Moon size={16} className="timing-icon" />
                  <span>Dinner</span>
                </div>
                <span className="timing-hours">7:30 PM – 10:30 PM</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="card profile-card">
            <h3 className="card-section-title">Amenities & Highlights</h3>
            <div className="facilities-tags-wrap">
              <span className="facility-tag"><Droplets size={14} /> RO Filtered Water</span>
              <span className="facility-tag"><Sparkles size={14} /> Unlimited Roti / Rice</span>
              <span className="facility-tag"><Wifi size={14} /> Free High-Speed WiFi</span>
              <span className="facility-tag">Airy Seating (60+ Diners)</span>
              <span className="facility-tag">Daily Cleanliness Checks</span>
              <span className="facility-tag">Tiffin Delivery Service</span>
            </div>
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
