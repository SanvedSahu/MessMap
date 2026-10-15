import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  ArrowRight,
  Home
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useMessData } from '../../../context/MessDataContext';

export const PendingApprovalPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messes } = useMessData();

  // Find current mess from location state or user
  const passedState = location.state as any;
  const currentMess = messes.find((m) => m.id === user.messId || m.id === passedState?.messId) || {
    name: passedState?.messName || user.messName || 'Your Registered Mess',
    ownerName: user.name || passedState?.ownerName || 'Mess Partner',
    area: passedState?.area || 'Campus Vicinity',
    status: 'Pending',
    registeredDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  const isRejected = currentMess.status === 'Rejected';

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

      {/* Main Status Container */}
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: isRejected ? 'var(--danger-bg)' : '#fffbeb',
            border: `2px solid ${isRejected ? 'var(--danger-border)' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: isRejected ? 'var(--danger)' : '#d97706',
          }}
        >
          {isRejected ? <AlertCircle size={36} /> : <Clock size={36} />}
        </div>

        <span
          className={`badge ${isRejected ? 'badge-danger' : 'badge-warning'}`}
          style={{ fontSize: '0.82rem', padding: '5px 12px', marginBottom: '1rem' }}
        >
          {isRejected ? 'Application Status: Rejected' : 'Listing Status: Pending Admin Verification'}
        </span>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          {isRejected ? 'Listing Needs Revision' : 'Your Mess Details Have Been Submitted'}
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          {isRejected ? (
            <span>
              Your registration dossier did not meet campus health verification criteria.{' '}
              <strong>Reason: {currentMess.rejectionReason || 'Incomplete licensing documents.'}</strong>
            </span>
          ) : (
            'Your mess details have been submitted. An admin will review them before your mess appears to students.'
          )}
        </p>

        {/* Details Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Registered Mess</span>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{currentMess.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Owner Contact</span>
            <span style={{ fontWeight: 600 }}>{currentMess.ownerName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Campus Area</span>
            <span style={{ fontWeight: 600 }}>{currentMess.area}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Public Visibility</span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isRejected ? 'var(--danger)' : '#d97706',
              }}
            >
              {isRejected ? 'Hidden from search' : 'Hidden until Admin approves'}
            </span>
          </div>
        </div>

        {/* Steps notice */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            fontSize: '0.82rem',
            color: '#166534',
            lineHeight: 1.5,
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Campus Verification in Progress:</strong> Administrators review hygiene checklists and
            dining parameters. You can still access your partner portal to manage your menu and operational settings.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: '#d97706' }}
          >
            Enter Owner Portal Preview <ArrowRight size={18} />
          </button>

          <Link to="/" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
            <Home size={18} /> Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
