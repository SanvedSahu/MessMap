import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Calendar,
  Clock,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Receipt,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useNotification } from '../context/NotificationContext';
import { QRModal } from '../components/common/QRModal';
import { Badge } from '../components/Badge';

export const SubscriptionsPage = () => {
  const {
    subscription,
    invoices,
    pauseSubscription,
    resumeSubscription,
    renewCurrentSubscription
  } = useSubscription();
  const { showToast } = useNotification();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseDays, setPauseDays] = useState(3);
  const [pauseReason, setPauseReason] = useState('Visiting hometown for weekend');

  const handlePauseSubmit = (e) => {
    e.preventDefault();
    pauseSubscription(pauseDays, pauseReason);
    setIsPauseModalOpen(false);
    showToast(`Meals paused for ${pauseDays} days! Subscription extended accordingly.`, 'info');
  };

  const handleResume = () => {
    resumeSubscription();
    showToast('Meals resumed! Your daily meal pass is now active again. 🍲', 'success');
  };

  const handleRenew = () => {
    renewCurrentSubscription();
    showToast('Subscription renewed for 30 more days! 🎉', 'success');
  };

  const handleDownloadInvoice = (invoiceId) => {
    showToast(`Downloaded official receipt for ${invoiceId}! 📄`, 'success');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Subscription & Meal Pass Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Track your active mess plan, show your digital meal QR pass, pause meals when traveling home, and view payment receipts.
        </p>
      </div>

      {/* ACTIVE SUBSCRIPTION CARD */}
      {subscription ? (
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            className="card"
            style={{
              borderLeft: subscription.status === 'Active' ? '6px solid var(--primary)' : '6px solid var(--warning)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {/* Top Status & Token Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant={subscription.status === 'Active' ? 'success' : 'warning'}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subscription.status === 'Active' ? 'var(--primary)' : 'var(--warning)', display: 'inline-block' }} />
                  {subscription.status === 'Active' ? 'Active Meal Pass' : 'Meals Paused'}
                </Badge>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Token Code: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{subscription.tokenCode}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <QrCode size={16} /> Show QR Meal Pass
                </button>
              </div>
            </div>

            {/* Mess & Plan Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Mess Facility
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
                  {subscription.messName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {subscription.messAddress}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Subscription Plan
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
                  {subscription.planName}
                </h4>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  ₹{subscription.planPrice} / month
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Validity Period
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>
                  {subscription.startDate} ➔ <span style={{ color: 'var(--primary-dark)' }}>{subscription.endDate}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Meals: {subscription.mealsIncluded?.join(' & ') || 'Lunch & Dinner'}
                </div>
              </div>
            </div>

            {/* Days Progress Bar */}
            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.75rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  Days Elapsed: <strong>{subscription.daysUsed}</strong> of {subscription.totalDays} Days
                </span>
                <span style={{ color: 'var(--primary-dark)', fontWeight: 800 }}>
                  {subscription.totalDays - subscription.daysUsed} Days Remaining
                </span>
              </div>
              <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((subscription.daysUsed / subscription.totalDays) * 100)}%`,
                    background: 'var(--primary)',
                    borderRadius: '5px'
                  }}
                />
              </div>
            </div>

            {/* Meal Pause Notification banner */}
            {subscription.status === 'Paused' && (
              <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PauseCircle size={22} color="var(--warning-dark)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--warning-dark)' }}>
                      Meals Paused ({subscription.pausedDaysCount || 3} Days)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Reason: {subscription.pauseReason || 'Traveling'}. Automatic resumption on {subscription.resumesOn || 'soon'}.
                    </div>
                  </div>
                </div>
                <button onClick={handleResume} className="btn btn-primary btn-sm">
                  <PlayCircle size={15} /> Resume Meals Early
                </button>
              </div>
            )}

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              {subscription.status === 'Active' ? (
                <button onClick={() => setIsPauseModalOpen(true)} className="btn btn-outline">
                  <PauseCircle size={16} /> Pause Meals (Going Home)
                </button>
              ) : (
                <button onClick={handleResume} className="btn btn-primary">
                  <PlayCircle size={16} /> Resume Meals Now
                </button>
              )}

              <button onClick={handleRenew} className="btn btn-outline-primary">
                <RotateCcw size={16} /> Renew for Next Month
              </button>

              <Link to={`/mess/${subscription.messId}`} className="btn btn-ghost">
                Check Today's Menu <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state-box" style={{ marginBottom: '2.5rem' }}>
          <div className="empty-state-icon">💳</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            No Active Subscription Found
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            You haven't subscribed to any mess yet. Explore nearby campus messes and pick a monthly student pass.
          </p>
          <Link to="/find-mess" className="btn btn-primary">
            Explore Messes & Subscribe
          </Link>
        </div>
      )}

      {/* BILLING & INVOICE HISTORY */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Receipt size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Payment & Invoice History</h2>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Invoice ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Mess Name</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Plan Description</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Billing Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {inv.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {inv.messName}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                      {inv.plan}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                      {inv.date}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-success">
                        ✓ Paid
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="btn btn-ghost btn-sm"
                        title="Download Receipt PDF"
                      >
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PAUSE MEALS MODAL */}
      {isPauseModalOpen && (
        <div className="mm-modal-backdrop" onClick={() => setIsPauseModalOpen(false)}>
          <div className="mm-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Pause Meal Subscription
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Going home or traveling? Pause your meals so you don't lose days. Your subscription validity is automatically extended.
            </p>

            <form onSubmit={handlePauseSubmit}>
              <div className="form-group">
                <label className="form-label">How many days do you want to pause?</label>
                <select
                  className="form-select"
                  value={pauseDays}
                  onChange={(e) => setPauseDays(Number(e.target.value))}
                >
                  <option value={1}>1 Day (Single day leave)</option>
                  <option value={2}>2 Days (Weekend trip)</option>
                  <option value={3}>3 Days (Long weekend)</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={6}>6 Days (Max allowed per month)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Meal Pause:</label>
                <input
                  type="text"
                  className="form-input"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="e.g. Traveling home, unwell, college trip"
                  required
                />
              </div>

              <div style={{ background: 'var(--primary-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--primary-dark)' }}>
                ℹ️ <strong>Rule:</strong> Meal pauses take effect starting from the next meal window. You can resume at any time early.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsPauseModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Pause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {subscription && (
        <QRModal
          subscription={subscription}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
};
