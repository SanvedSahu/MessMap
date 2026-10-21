import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  CheckCircle2,
  Save
} from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');
  const [saveToast, setSaveToast] = useState(false);

  // Settings states
  const [smsEnquiryAlert, setSmsEnquiryAlert] = useState(true);
  const [emailReviewAlert, setEmailReviewAlert] = useState(true);
  const [autoCloseSundayDinner, setAutoCloseSundayDinner] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="settings-page-container">
      {saveToast && (
        <div className="settings-save-toast">
          <CheckCircle2 size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="settings-header">
        <h2 className="page-heading">Owner Account & Portal Settings</h2>
        <p className="page-subheading">
          Manage your operational defaults, notifications, and login credentials.
        </p>
      </div>

      {/* Settings Tab Navigation */}
      <div className="settings-tabs-bar">
        <button
          className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Settings size={16} /> Operational Preferences
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} /> Notifications & Alerts
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={16} /> Security & Password
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="settings-form-content">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="card settings-section-card">
            <h3 className="section-title">Mess Operational Rules</h3>
            <p className="section-desc">Default behaviors for your public listing on MessMap</p>

            <div className="settings-toggles-stack">
              <label className="toggle-setting-row">
                <div className="toggle-text">
                  <span className="toggle-title">Auto-Close on Sunday Dinners</span>
                  <span className="toggle-subtitle">
                    Automatically mark mess status as closed after 4:00 PM every Sunday.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCloseSundayDinner}
                  onChange={(e) => setAutoCloseSundayDinner(e.target.checked)}
                  className="switch-checkbox"
                />
              </label>
            </div>

            <div className="form-divider" />

            <div className="form-group">
              <label className="form-label">Weekly Closed Day (if any)</label>
              <select className="form-input" defaultValue="none">
                <option value="none">Open 7 days a week</option>
                <option value="sunday_night">Sunday Dinner Only</option>
                <option value="monday">Every Monday</option>
              </select>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card settings-section-card">
            <h3 className="section-title">Notification Preferences</h3>
            <p className="section-desc">Choose how you wish to receive updates from prospective diners</p>

            <div className="settings-toggles-stack">
              <label className="toggle-setting-row">
                <div className="toggle-text">
                  <span className="toggle-title">SMS & WhatsApp Alerts for New Enquiries</span>
                  <span className="toggle-subtitle">
                    Receive an immediate alert on +91 98231 44550 when a student sends an enquiry.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnquiryAlert}
                  onChange={(e) => setSmsEnquiryAlert(e.target.checked)}
                  className="switch-checkbox"
                />
              </label>

              <label className="toggle-setting-row">
                <div className="toggle-text">
                  <span className="toggle-title">Email Notification for New Reviews</span>
                  <span className="toggle-subtitle">
                    Receive an email summary whenever a diner rates your mess.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailReviewAlert}
                  onChange={(e) => setEmailReviewAlert(e.target.checked)}
                  className="switch-checkbox"
                />
              </label>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card settings-section-card">
            <h3 className="section-title">Change Password</h3>
            <p className="section-desc">Ensure your mess management account is protected</p>

            <div className="form-fields-stack">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="form-input" />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" placeholder="Minimum 8 characters" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" placeholder="Repeat new password" className="form-input" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="settings-footer-actions">
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
