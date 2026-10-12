import React, { useState } from 'react';
import { AdminProfile } from '../types/admin.types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import {
  User,
  Shield,
  Bell,
  Lock,
  Save,
  Server,
  Key,
} from 'lucide-react';

interface AdminSettingsProps {
  adminProfile: AdminProfile;
  onUpdateProfile: (updated: Partial<AdminProfile>) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  adminProfile,
  onUpdateProfile,
  onShowToast,
}) => {
  // Profile form state
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [department, setDepartment] = useState(adminProfile.department);

  // Security toggles
  const [twoFactor, setTwoFactor] = useState(adminProfile.twoFactorEnabled);
  const [emailAlerts, setEmailAlerts] = useState(adminProfile.emailAlerts);
  const [systemAlerts, setSystemAlerts] = useState(adminProfile.systemAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(adminProfile.weeklyDigest);
  const [maintenanceMode, setMaintenanceMode] = useState(adminProfile.maintenanceMode);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Maintenance mode confirmation dialog
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast('Name and email cannot be empty.', 'error');
      return;
    }
    onUpdateProfile({
      name,
      email,
      phone,
      department,
      twoFactorEnabled: twoFactor,
      emailAlerts,
      systemAlerts,
      weeklyDigest,
      maintenanceMode,
    });
    onShowToast('Admin profile & system preferences updated successfully.', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Please enter current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onShowToast('Administrator password updated successfully.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Administrator Profile & System Configuration
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your credentials, automated safety notifications, and campus portal maintenance states
        </p>
      </div>

      <div className="grid-2col">
        {/* Left Column: Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={18} color="var(--primary)" /> Administrator Information
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <img
                  src={adminProfile.avatar}
                  alt={adminProfile.name}
                  style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{adminProfile.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                    {adminProfile.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Last login: {adminProfile.lastLogin}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Direct Telephone
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Department / Authority Office
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Platform Notifications & Automation Rules */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Bell size={18} color="var(--primary)" /> Alert Rules & Subscriptions
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Immediate Email on New Mess Registration
                  </div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                    Receive health inspection docket whenever an owner registers.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Critical Grievance Alert Trigger
                  </div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                    Instant notification on food safety or hygiene complaints.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={systemAlerts}
                  onChange={(e) => setSystemAlerts(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Weekly Campus Dining Summary Digest
                  </div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                    Weekly automated roll-up of meal price inflation and audits.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Maintenance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Security & Password */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Lock size={18} color="var(--primary)" /> Security & Password
              </div>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters..."
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-type new password..."
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                />
              </div>

              {passwordError && (
                <div style={{ fontSize: '0.8rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  {passwordError}
                </div>
              )}

              <button type="submit" className="btn btn-outline" style={{ marginTop: '0.25rem' }}>
                <Key size={15} /> Update Credentials
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Shield size={16} color="#10b981" /> Two-Factor Authentication (2FA)
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  Enforce TOTP authenticator code on admin login.
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => {
                  setTwoFactor(e.target.checked);
                  onShowToast(e.target.checked ? '2FA enabled.' : '2FA disabled.', 'info');
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* System Maintenance Mode */}
          <div className="card" style={{ border: maintenanceMode ? '1px solid #fecaca' : undefined }}>
            <div className="card-header">
              <div className="card-title" style={{ color: maintenanceMode ? '#ef4444' : 'var(--text-main)' }}>
                <Server size={18} color={maintenanceMode ? '#ef4444' : 'var(--text-muted)'} />
                Portal Maintenance Mode
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              When enabled, student and owner frontends will display an official scheduled maintenance notice. Administrators will retain full access.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: maintenanceMode ? '#fef2f2' : '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: maintenanceMode ? '#dc2626' : 'var(--text-main)' }}>
                  Status: {maintenanceMode ? 'ACTIVE MAINTENANCE' : 'Live & Accepting Traffic'}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {maintenanceMode ? 'Public routes disabled' : 'All student search services online'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmMaintenance(true)}
                className={`btn btn-sm ${maintenanceMode ? 'btn-success' : 'btn-danger'}`}
              >
                {maintenanceMode ? 'Deactivate Maintenance' : 'Enable Maintenance'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmMaintenance}
        onClose={() => setConfirmMaintenance(false)}
        onConfirm={() => {
          const next = !maintenanceMode;
          setMaintenanceMode(next);
          onUpdateProfile({ maintenanceMode: next });
          onShowToast(
            next
              ? 'Maintenance mode is now ACTIVE. Public portals will display maintenance notice.'
              : 'Maintenance mode deactivated. Full public services restored.',
            next ? 'error' : 'success'
          );
          setConfirmMaintenance(false);
        }}
        title={maintenanceMode ? 'Disable Maintenance Mode' : 'Enable System Maintenance Mode'}
        message={
          maintenanceMode
            ? 'Are you sure you want to restore regular student traffic and disable the maintenance barrier?'
            : 'Are you sure you want to activate maintenance mode? Students will temporarily be unable to search or review messes.'
        }
        confirmText={maintenanceMode ? 'Restore Normal Traffic' : 'Activate Maintenance Mode'}
        variant={maintenanceMode ? 'success' : 'danger'}
      />
    </div>
  );
};
