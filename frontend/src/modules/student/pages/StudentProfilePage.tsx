import React, { useState } from 'react';
import {
  User,
  Bell,
  ShieldCheck,
  Save,
  Key
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Badge } from '../../../components/ui/Badge';

export const StudentProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    name: user?.name || 'Rahul Patil',
    email: user?.email || 'rahul.patil@coep.ac.in',
    phone: user?.phone || '+91 98223 34455',
    college: user?.college || 'COEP Technological University, Pune',
    hostel: user?.hostel || 'Hostel Block B, Room 304, Shivajinagar',
    dietaryPref: user?.dietaryPref || 'Pure Veg',
    studentId: user?.studentId || 'COEP-CS-2023-89',
    lunchReminder: true,
    dinnerReminder: true,
    sundayAlerts: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    showToast('Student profile updated successfully! ✅', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    setIsPasswordModalOpen(false);
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('Account password changed successfully! 🔐', 'success');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Student Profile & Preferences
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your personal details, campus hostel delivery address, and food preferences.
        </p>
      </div>

      {/* 1. TOP PROFILE HEADER CARD */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem', position: 'relative' }}>
        {/* Avatar */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 800,
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}
        >
          {user?.avatar || 'RP'}
        </div>

        {/* User Quick Info */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.name || 'Rahul Patil'}</h2>
            <Badge variant="success">
              <ShieldCheck size={14} /> Verified Student
            </Badge>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {user?.college}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>PRN ID: <strong style={{ color: 'var(--text-main)' }}>{user?.studentId || 'COEP-CS-2023-89'}</strong></span>
            <span>•</span>
            <span>Diet: <strong style={{ color: 'var(--primary-dark)' }}>{user?.dietaryPref || 'Pure Veg'}</strong></span>
            <span>•</span>
            <span>Member Since: {user?.joinedDate || 'Aug 2026'}</span>
          </div>
        </div>

        {/* Edit Button */}
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary btn-sm"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* 2. PROFILE DETAILS FORM */}
      <form onSubmit={handleProfileSave}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <User size={18} color="var(--primary)" /> Personal & Academic Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Registered Student Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* College */}
            <div className="form-group">
              <label className="form-label">College / Institute Name</label>
              <input
                type="text"
                name="college"
                className="form-input"
                disabled={!isEditing}
                value={formData.college}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Hostel / Room */}
          <div className="form-group">
            <label className="form-label">Hostel Name / Room Number / Campus Address</label>
            <input
              type="text"
              name="hostel"
              className="form-input"
              disabled={!isEditing}
              value={formData.hostel}
              onChange={handleInputChange}
              placeholder="Used for hostel tiffin parcel delivery"
            />
          </div>

          {/* Dietary Preference */}
          <div className="form-group">
            <label className="form-label">Primary Dietary Preference</label>
            <select
              name="dietaryPref"
              className="form-select"
              disabled={!isEditing}
              value={formData.dietaryPref}
              onChange={handleInputChange}
            >
              <option value="Pure Veg">Pure Veg (Sattvic & Homestyle)</option>
              <option value="Veg & Non-Veg">Veg & Non-Veg (Poultry, Egg, Fish)</option>
              <option value="Jain Food">Jain Food (No root veggies / garlic)</option>
              <option value="High-Protein Diet">High-Protein Fitness Diet</option>
            </select>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          )}
        </div>

        {/* 3. MEAL NOTIFICATIONS & REMINDERS */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Bell size={18} color="var(--primary)" /> Meal Timing Alerts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Lunch Window Reminder</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alert 15 mins before lunch serving begins (12:00 PM)</div>
              </div>
              <input
                type="checkbox"
                name="lunchReminder"
                checked={formData.lunchReminder}
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Dinner Window Reminder</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alert 15 mins before dinner serving begins (7:15 PM)</div>
              </div>
              <input
                type="checkbox"
                name="dinnerReminder"
                checked={formData.dinnerReminder}
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Sunday Special Feast Alert</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Notification when your mess posts Sunday sweet special</div>
              </div>
              <input
                type="checkbox"
                name="sundayAlerts"
                checked={formData.sundayAlerts}
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>
          </div>
        </div>
      </form>

      {/* 4. ACCOUNT SECURITY & ACTIONS */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '2px', color: 'var(--text-main)' }}>Security & Credentials</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Update your account password or sign out from this device.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn btn-outline btn-sm"
          >
            <Key size={14} /> Change Password
          </button>
          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="mm-modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="mm-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Change Account Password
            </h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="At least 6 characters"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="Repeat new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { StudentProfilePage as ProfilePage };
