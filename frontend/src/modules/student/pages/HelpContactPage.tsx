import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck
} from 'lucide-react';
import { mockFaqs } from '../../../data/mockFaqs';
import { mockMesses } from '../../../data/mockMesses';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

export const HelpContactPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('0-0');

  const [contactData, setContactData] = useState({
    name: user?.name || 'Rahul Patil',
    email: user?.email || 'rahul.patil@coep.ac.in',
    category: 'Subscription Inquiry',
    messName: 'Annapurna Executive Mess',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (key: string) => {
    setOpenFaqIndex((prev) => (prev === key ? null : key));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.message.trim()) {
      showToast('Please enter your message or query details', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Grievance / Inquiry ticket submitted! Ticket #MM-TK-4412 created.', 'success');
      setContactData((prev) => ({ ...prev, message: '' }));
    }, 600);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <HelpCircle size={14} /> 24x7 Student Assistance
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Help, FAQs & Campus Support
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Have questions about meal pausing, billing, or food hygiene? Check instant answers or raise a student support ticket.
        </p>
      </div>

      {/* QUICK CONTACT CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT HELPLINE</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>+91 98234 00000</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily: 8:00 AM – 10:30 PM</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>WHATSAPP BOT</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>+91 98234 11223</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant meal pause via chat</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--info-light)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT DESK EMAIL</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>support@messmap.edu</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response within 2 hours</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: FAQS ACCORDION (LEFT) & CONTACT FORM (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* LEFT: FAQS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              placeholder="Search FAQs (e.g. pause, Sunday, refund, trial)..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mockFaqs.map((cat, catIdx) => {
              const filteredItems = cat.items.filter((item) => {
                if (!faqSearch.trim()) return true;
                const query = faqSearch.toLowerCase();
                return item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query);
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={catIdx}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cat.category}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredItems.map((item, itemIdx) => {
                      const key = `${catIdx}-${itemIdx}`;
                      const isOpen = openFaqIndex === key;

                      return (
                        <div
                          key={itemIdx}
                          style={{
                            background: '#ffffff',
                            border: isOpen ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(key)}
                            style={{
                              width: '100%',
                              padding: '1rem 1.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              textAlign: 'left',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: isOpen ? 'var(--primary-dark)' : 'var(--text-main)',
                              background: isOpen ? 'var(--primary-light)' : '#ffffff'
                            }}
                          >
                            <span>{item.q}</span>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>

                          {isOpen && (
                            <div style={{ padding: '0.85rem 1.25rem 1.25rem 1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: '#ffffff' }}>
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SUBMIT INQUIRY / GRIEVANCE FORM */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Submit an Inquiry or Feedback
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Report an issue with a mess, request a refund, or ask about hostel tiffin delivery.
          </p>

          <form onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Email Address</label>
              <input
                type="email"
                className="form-input"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={contactData.category}
                onChange={(e) => setContactData({ ...contactData, category: e.target.value })}
              >
                <option value="Subscription Inquiry">Subscription & QR Pass Inquiry</option>
                <option value="Meal Pause / Refund">Meal Pause / Billing Adjustment</option>
                <option value="Food Quality / Hygiene Report">Food Quality or Cleanliness Grievance</option>
                <option value="Hostel Delivery Issue">Hostel Tiffin Delivery Issue</option>
                <option value="General Suggestion">Platform Suggestion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Concerned Mess Facility</label>
              <select
                className="form-select"
                value={contactData.messName}
                onChange={(e) => setContactData({ ...contactData, messName: e.target.value })}
              >
                <option value="General MessMap Platform">General (All Messes)</option>
                {mockMesses.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Message</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Explain the problem or inquiry in detail..."
                value={contactData.message}
                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <Send size={16} /> {isSubmitting ? 'Submitting Ticket...' : 'Send Message / Submit Ticket'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', background: 'var(--primary-light)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--primary-dark)' }}>
            <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              All student grievances are directly monitored by campus student representatives and mess supervisors.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
