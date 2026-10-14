import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.admin.email);
    setPassword(DEMO_CREDENTIALS.admin.password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide administrator email or username.');
      return;
    }
    if (!password) {
      setError('Please enter administrator password.');
      return;
    }

    const result = login('admin', email.trim(), password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Access denied. Valid administrator credentials required.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a', // Sleek dark aesthetic for secure admin portal
        color: '#f8fafc',
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
          color: '#ffffff',
          marginBottom: '2rem',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          <Shield size={22} />
        </div>
        <span>MessMap Admin Gateway</span>
      </Link>

      {/* Main Form Card */}
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            <Lock size={12} /> Restricted Security Gateway
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Administrator Sign In
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            Mess verification, user access control, and campus food grievance audit.
          </p>
        </div>

        {/* Demo Helper Box */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#34d399' }}>Sprint Demo Credentials</div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              admin@messmap.com / admin
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-sm"
            style={{
              backgroundColor: '#0f172a',
              color: '#34d399',
              border: '1px solid #334155',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} /> Auto-Fill
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '0.4rem',
              }}
            >
              Administrator Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                type="text"
                placeholder="admin@messmap.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.6rem',
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                }}
                autoComplete="username"
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '0.4rem',
              }}
            >
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.6rem 0.7rem 2.6rem',
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                }}
                autoComplete="current-password"
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
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
                  color: '#64748b',
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
              backgroundColor: '#10b981',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            Authenticate & Open Admin Dashboard →
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #334155',
            fontSize: '0.8rem',
            color: '#64748b',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Security Notice: Public user registration is not permitted for administrator accounts. Access attempts are audited.
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
          ← Back to Public Homepage
        </Link>
      </div>
    </div>
  );
};
