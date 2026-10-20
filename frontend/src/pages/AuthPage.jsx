import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ShieldCheck, UserCheck, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    college: 'COEP Technological University',
    hostel: 'Hostel Block B, Room 304',
    dietaryPref: 'Pure Veg',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [regErrors, setRegErrors] = useState({});

  const validateLogin = () => {
    const errs = {};
    if (!loginEmail.trim()) {
      errs.email = 'Please enter your registered student email';
    } else if (!loginEmail.includes('@')) {
      errs.email = 'Please enter a valid email address';
    }
    if (!loginPassword.trim()) {
      errs.password = 'Please enter your password';
    } else if (loginPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateLogin()) {
      login(loginEmail, loginPassword);
      showToast('Welcome back to MessMap! 🍛', 'success');
      navigate('/');
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    showToast('Signed in with Demo Student Account (Rahul Patil)!', 'success');
    navigate('/');
  };

  const validateRegister = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = 'Full name is required';
    if (!regData.email.trim()) {
      errs.email = 'Student email is required';
    } else if (!regData.email.includes('@')) {
      errs.email = 'Please enter a valid college or personal email';
    }
    if (!regData.phone.trim()) {
      errs.phone = '10-digit mobile number is required';
    } else if (!/^\d{10}$/.test(regData.phone.replace(/[^0-9]/g, ''))) {
      errs.phone = 'Enter valid 10-digit Indian phone number';
    }
    if (!regData.password) {
      errs.password = 'Password is required';
    } else if (regData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (regData.password !== regData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!regData.agreeTerms) {
      errs.agreeTerms = 'Please agree to MessMap Student Terms';
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (validateRegister()) {
      register(regData);
      showToast('Student account created successfully! Welcome to MessMap 🎓', 'success');
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left Side: Branding & Student Value Props */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={14} /> Student Food Portal
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Find your home meal away from home.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Discover trusted mess services near your campus, view daily live menus, pause meals when visiting home, and manage subscriptions with ease.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', flexShrink: 0 }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Verified Hygiene & Nutrition</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RO water, clean kitchens, and authentic homestyle food.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Flexible Student Meal Pause</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Never lose money when traveling home for festivals or exams.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-dark)', flexShrink: 0 }}>
                <BookOpen size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Campus Student Exclusive Rates</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Special student discounts starting from ₹2,400/month.</div>
              </div>
            </div>
          </div>

          {/* Quick Demo Fill Box */}
          <div style={{ background: 'var(--bg-card-subtle)', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Demo Presentation Mode
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Skip typing and log in instantly with student profile.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn btn-outline btn-sm"
              style={{ fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}
            >
              1-Click Demo Login
            </button>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textAlign: 'center',
                background: activeTab === 'login' ? '#ffffff' : 'transparent',
                color: activeTab === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === 'login' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textAlign: 'center',
                background: activeTab === 'register' ? '#ffffff' : 'transparent',
                color: activeTab === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === 'register' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              New Registration
            </button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Student Email / PRN ID</label>
                <input
                  type="email"
                  className={`form-input ${loginErrors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. rahul.patil@coep.ac.in"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: null }));
                  }}
                />
                {loginErrors.email && (
                  <div className="form-error-msg">
                    <AlertCircle size={13} /> {loginErrors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset link sent to registered email! 📧', 'info')}
                    style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 600 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${loginErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: null }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <div className="form-error-msg">
                    <AlertCircle size={13} /> {loginErrors.password}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <input type="checkbox" id="remember" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                <label htmlFor="remember" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Keep me logged in on this browser
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Sign In to MessMap
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  style={{ color: 'var(--primary-dark)', fontWeight: 700 }}
                >
                  Register here
                </button>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${regErrors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul Patil"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                />
                {regErrors.name && (
                  <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.name}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-input ${regErrors.email ? 'is-invalid' : ''}`}
                    placeholder="student@college.edu"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  />
                  {regErrors.email && (
                    <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-input ${regErrors.phone ? 'is-invalid' : ''}`}
                    placeholder="9823456789"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  />
                  {regErrors.phone && (
                    <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.phone}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">College / Institute</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regData.college}
                    onChange={(e) => setRegData({ ...regData, college: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Preference</label>
                  <select
                    className="form-select"
                    value={regData.dietaryPref}
                    onChange={(e) => setRegData({ ...regData, dietaryPref: e.target.value })}
                  >
                    <option value="Pure Veg">Pure Veg 🥗</option>
                    <option value="Veg & Non-Veg">Veg & Non-Veg 🍗</option>
                    <option value="Jain Food">Jain Food (No Onion/Garlic)</option>
                    <option value="High-Protein Diet">High-Protein Fitness</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hostel / Current Local Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Room 304, COEP Hostel, Shivajinagar"
                  value={regData.hostel}
                  onChange={(e) => setRegData({ ...regData, hostel: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-input ${regErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Min 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  />
                  {regErrors.password && (
                    <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-input ${regErrors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                  />
                  {regErrors.confirmPassword && (
                    <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={regData.agreeTerms}
                    onChange={(e) => setRegData({ ...regData, agreeTerms: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  I agree to MessMap Student Terms & Campus Guidelines
                </label>
                {regErrors.agreeTerms && (
                  <div className="form-error-msg"><AlertCircle size={13} /> {regErrors.agreeTerms}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Complete Student Registration
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{ color: 'var(--primary-dark)', fontWeight: 700 }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
