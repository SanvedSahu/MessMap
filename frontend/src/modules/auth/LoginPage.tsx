import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Store,
  Eye,
  EyeOff,
  MapPin,
  Lock,
  Mail,
  AlertCircle,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS, UserRole } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<'student' | 'owner'>(
    roleParam === 'owner' ? 'owner' : 'student'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'owner') {
      setActiveRole('owner');
    } else if (roleParam === 'student') {
      setActiveRole('student');
    }
  }, [roleParam]);

  const handleRoleChange = (newRole: 'student' | 'owner') => {
    setActiveRole(newRole);
    setSearchParams({ role: newRole });
    setError(null);
  };

  const handleFillDemo = () => {
    const cred = DEMO_CREDENTIALS[activeRole];
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const result = login(activeRole, email.trim(), password);
    if (result.success) {
      if (activeRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
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
        padding: '2rem 1.5rem',
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

      {/* Main Card */}
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.25rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
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
            <Compass size={17} /> Student Login
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
            <Store size={17} /> Mess Owner
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {activeRole === 'student' ? 'Student Sign In' : 'Mess Owner Portal'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {activeRole === 'student'
              ? 'Access nearby mess discovery, meal passes, and menus'
              : 'Manage your mess profile, daily menus, and student reviews'}
          </p>
        </div>

        {/* Demo Helper Box */}
        <div
          style={{
            backgroundColor: activeRole === 'student' ? 'var(--primary-light)' : '#fffbeb',
            border: `1px solid ${activeRole === 'student' ? 'var(--success-border)' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Demo {activeRole === 'student' ? 'Student' : 'Mess Owner'} Account
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {DEMO_CREDENTIALS[activeRole].email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-sm"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} color="var(--primary)" /> Fill Demo
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
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
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address or Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="text"
                placeholder={activeRole === 'student' ? 'student@coep.ac.in' : 'owner@annapurnamess.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="username"
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

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
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
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              backgroundColor: activeRole === 'owner' ? '#d97706' : 'var(--primary)',
            }}
          >
            Sign In as {activeRole === 'student' ? 'Student' : 'Mess Owner'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link
            to={`/register?role=${activeRole}`}
            style={{ color: activeRole === 'owner' ? '#d97706' : 'var(--primary)', fontWeight: 700 }}
          >
            Sign up here →
          </Link>
        </div>

        {/* Protected Admin Gateway link */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <Link
            to="/admin/login"
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={14} color="#3b82f6" /> Campus Official? Enter Admin Login →
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
