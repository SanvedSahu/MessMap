import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, CheckCircle2, AlertCircle, Send, User, Phone, Mail, Building } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createStudentEnquiryApi } from '../../api/studentApi';

interface AskEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messId: number | string;
  messName: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'Monthly Meal Plan',
  'Trial Meal',
  'Tiffin Service',
  'Menu & Food Quality',
  'Pricing & Payment',
  'Other',
];

const PLAN_PREFERENCES = [
  'None / General Inquiry',
  'Monthly (2 Meals - Lunch & Dinner)',
  'Monthly (Lunch only)',
  'Monthly (Dinner only)',
  '15-Day Flexi Pass',
  'Single Meal Trial',
  'Tiffin Delivery to Hostel',
];

export const AskEnquiryModal: React.FC<AskEnquiryModalProps> = ({
  isOpen,
  onClose,
  messId,
  messName,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [category, setCategory] = useState<string>('Monthly Meal Plan');
  const [planPreference, setPlanPreference] = useState<string>('None / General Inquiry');
  const [message, setMessage] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setMessage('');
      setCategory('Monthly Meal Plan');
      setPlanPreference('None / General Inquiry');
      if (user?.phone) {
        setContactPhone(user.phone);
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      setErrorMessage('Please sign in as a student to submit an enquiry.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please enter your enquiry message or question.');
      return;
    }

    const token = localStorage.getItem('messmap_auth_token');
    if (!token) {
      setErrorMessage('Session expired. Please sign in again.');
      return;
    }

    const numericMessId = Number(messId);
    if (!numericMessId || isNaN(numericMessId)) {
      setErrorMessage('Invalid mess identifier. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createStudentEnquiryApi(
        {
          messId: numericMessId,
          category,
          message: message.trim(),
          planPreference: planPreference !== 'None / General Inquiry' ? planPreference : undefined,
          contactPhone: contactPhone.trim() || undefined,
        },
        token
      );

      setIsSuccess(true);
      showToast(`Enquiry submitted to ${messName}! The mess owner will respond shortly.`, 'success');
      onSuccess?.();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('[AskEnquiryModal] Submission error:', err);
      setErrorMessage(err?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask Enquiry / Contact Mess"
      subtitle={`Send a direct question to the owner of ${messName}`}
      maxWidth="580px"
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} color="#059669" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Enquiry Sent Successfully!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto' }}>
            Your question has been sent directly to the mess owner's customer enquiries inbox. You can track their reply or expect a call/WhatsApp message.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mess Name Banner */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Building size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Enquiry Target Mess</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>{messName}</div>
            </div>
          </div>

          {/* Authenticated Student Profile Card */}
          {isAuthenticated && user ? (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <User size={14} color="var(--primary)" />
                <span>
                  <strong>Student:</strong> {user.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Mail size={14} color="var(--primary)" />
                <span>
                  <strong>Email:</strong> {user.email}
                </span>
              </div>
              {user.college && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Building size={14} color="var(--primary)" />
                  <span>
                    <strong>College:</strong> {user.college}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>You are not signed in. Sign in to submit an enquiry.</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/auth/login')}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Form Fields: Category and Plan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Enquiry Category <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Plan Preference (Optional)
              </label>
              <select
                value={planPreference}
                onChange={(e) => setPlanPreference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                }}
              >
                {PLAN_PREFERENCES.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              Your Phone Number for WhatsApp / Call
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Used by the mess owner to reply to you via phone call or WhatsApp.
            </span>
          </div>

          {/* Message Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              Message or Question <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. I am looking for a monthly meal pass starting next week. Can I come for a trial lunch today? Does your plan include Sunday feast?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                resize: 'vertical',
              }}
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isAuthenticated}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
