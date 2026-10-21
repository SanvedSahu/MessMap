import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessData } from '../../context/MessDataContext';
import { geocodeAddress, POPULAR_PUNE_AREAS } from '../../utils/geocoding';

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
  const [area, setArea] = useState('Shivaji Nagar');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411004');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>({
    latitude: 18.5204,
    longitude: 73.8567,
  });
  const [geoStatus, setGeoStatus] = useState<string>('Coordinates synchronized (Pune Center)');
  const [foodType, setFoodType] = useState<'Pure Veg' | 'Veg & Non-Veg'>('Pure Veg');
  const [monthlyPrice, setMonthlyPrice] = useState('3200');
  const [dailyPrice, setDailyPrice] = useState('100');
  const [operatingHours, setOperatingHours] = useState('7:30 AM – 10:30 PM');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize coordinates whenever address, area, or city changes
  useEffect(() => {
    if (activeRole !== 'owner') return;
    if (!address.trim() && !area.trim()) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const geo = await geocodeAddress(address, area, city);
        if (isMounted && geo) {
          setCoordinates({ latitude: geo.latitude, longitude: geo.longitude });
          if (geo.pincode && !pincode) {
            setPincode(geo.pincode);
          }
          setGeoStatus(`Coordinates: ${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E`);
        }
      } catch (e) {
        if (isMounted) {
          setGeoStatus('Manual location set');
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [address, area, city, activeRole]);

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

        // 1. Submit Mess Details to Verification Queue (creates with status: 'Pending')
        const newMessId = registerMess({
          name: messName.trim(),
          ownerName: fullName.trim(),
          ownerEmail: email.trim(),
          ownerPhone: phone.trim(),
          address: address.trim(),
          area: area.trim() || 'Campus Area',
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
          area: area.trim() || 'Campus Area',
          city: city.trim() || 'Pune',
          pincode: pincode.trim() || '411004',
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
            messId: newMessId,
            messName: messName.trim(),
            ownerName: fullName.trim(),
            area: area.trim(),
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
                  <label className="form-label" htmlFor="reg-area">
                    Area / Campus Locality *
                  </label>
                  <input
                    id="reg-area"
                    list="area-suggestions"
                    type="text"
                    placeholder="e.g. Shivaji Nagar, Kothrud, Hinjewadi"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="form-input"
                    required
                  />
                  <datalist id="area-suggestions">
                    {POPULAR_PUNE_AREAS.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
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
                  <label className="form-label" htmlFor="reg-pincode">
                    Postal Code / Pincode
                  </label>
                  <input
                    id="reg-pincode"
                    type="text"
                    placeholder="e.g. 411004"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Coordinates synchronization preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card-subtle, #f8fafc)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #64748b)',
                  marginBottom: '1rem',
                }}
              >
                <MapPin size={15} color="#10b981" />
                <span><strong>Map Location:</strong> {geoStatus}</span>
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
