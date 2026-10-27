import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import type { OwnerOutletContextType } from '../layouts/OwnerLayout';
import './EnquiriesPage.css';

interface Enquiry {
  id: string;
  studentName: string;
  college: string;
  phone: string;
  planType: 'Monthly (2 Meals)' | 'Monthly (Lunch only)' | 'Trial Meal' | 'Tiffin Service';
  message: string;
  date: string;
  status: 'new' | 'replied';
  replyNotes?: string;
}

const mockEnquiries: Enquiry[] = [
  {
    id: 'e1',
    studentName: 'Rahul Verma',
    college: 'Bharati Vidyapeeth Engg College',
    phone: '+91 98765 43210',
    planType: 'Monthly (2 Meals)',
    message: 'Hello sir, I am a 2nd year student staying in Katraj. Does your monthly plan include Sunday feast lunch? Also can I pay in two instalments?',
    date: 'Today, 11:20 AM',
    status: 'new',
  },
  {
    id: 'e2',
    studentName: 'Snehal Kulkarni',
    college: 'PICT College',
    phone: '+91 91234 56789',
    planType: 'Trial Meal',
    message: 'Can I come for a trial lunch today at 1:30 PM with 2 friends? We want to taste your regular chapati and dal.',
    date: 'Today, 9:45 AM',
    status: 'new',
  },
  {
    id: 'e3',
    studentName: 'Amit Patel',
    college: 'SKN Sinhgad Institute',
    phone: '+91 99887 76655',
    planType: 'Tiffin Service',
    message: 'Do you provide daily tiffin delivery to Ambegaon BK? Looking for dinner tiffin starting from next Monday.',
    date: 'Yesterday, 6:15 PM',
    status: 'new',
  },
  {
    id: 'e4',
    studentName: 'Priya Joshi',
    college: 'MIT WPU',
    phone: '+91 97654 32109',
    planType: 'Monthly (Lunch only)',
    message: 'Interested in lunch-only meal plan for 30 days. Can I visit today to taste the food before joining?',
    date: '10 Oct, 2026',
    status: 'replied',
    replyNotes: 'Replied via call. Invited student for lunch tasting today.',
  },
];

export const EnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const outletCtx = useOutletContext<OwnerOutletContextType | null>();
  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';
  const displayMessName = outletCtx?.ownerMess?.name || user.messName || (isDemoOwner ? 'Annapurna Mess' : 'My Mess');

  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => (isDemoOwner ? mockEnquiries : []));
  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleMarkReplied = (id: string, notes?: string) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'replied',
              replyNotes: notes || e.replyNotes || 'Marked as replied by owner.',
            }
          : e
      )
    );
    setReplyInputId(null);
    setReplyText('');
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch =
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.college.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="enquiries-page-container">
      {/* Top Header */}
      <div className="enquiries-header-row">
        <div>
          <h2 className="page-heading">Student & Customer Enquiries</h2>
          <p className="page-subheading">
            Review prospective diners, inquiries about monthly meal passes, and trial bookings.
          </p>
        </div>

        <div className="badge badge-green" style={{ fontSize: '13px', padding: '6px 14px' }}>
          <Sparkles size={14} /> Quick Response builds higher trust & rating
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="enquiries-controls-bar">
        <div className="filter-pill-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Enquiries ({enquiries.length})
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            Awaiting Response ({enquiries.filter((e) => e.status === 'new').length})
          </button>
          <button
            className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
            onClick={() => setFilter('replied')}
          >
            Answered ({enquiries.filter((e) => e.status === 'replied').length})
          </button>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student, college, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Enquiries Feed */}
      <div className="enquiries-list">
        {filteredEnquiries.map((item) => (
          <div key={item.id} className={`card enquiry-card ${item.status === 'new' ? 'is-new' : ''}`}>
            <div className="enquiry-card-header">
              <div className="student-profile-info">
                <div className="student-avatar-badge">
                  {item.studentName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="student-name">{item.studentName}</h4>
                  <p className="student-college">{item.college}</p>
                </div>
              </div>

              <div className="enquiry-header-meta">
                <span className="plan-badge">{item.planType}</span>
                <span className="enquiry-date"><Clock size={12} /> {item.date}</span>
                {item.status === 'new' ? (
                  <span className="badge badge-warning">New</span>
                ) : (
                  <span className="badge badge-green">
                    <CheckCircle2 size={12} /> Answered
                  </span>
                )}
              </div>
            </div>

            <div className="enquiry-card-body">
              <p className="enquiry-message-content">"{item.message}"</p>

              {item.replyNotes && (
                <div className="reply-notes-box">
                  <strong>Owner Note:</strong> {item.replyNotes}
                </div>
              )}
            </div>

            <div className="enquiry-card-footer">
              <div className="contact-quick-info">
                <Phone size={14} className="phone-icon" />
                <span className="phone-number">{item.phone}</span>
              </div>

              <div className="enquiry-action-buttons">
                {/* WhatsApp Direct Action */}
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                    item.studentName
                  )},%20this%20is%20${encodeURIComponent(displayMessName)}.%20Regarding%20your%20enquiry:`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-green-subtle"
                  onClick={() => handleMarkReplied(item.id, 'Responded via WhatsApp')}
                >
                  <MessageCircle size={15} /> WhatsApp Reply
                </a>

                {/* Call Student */}
                <a href={`tel:${item.phone}`} className="btn btn-secondary">
                  <Phone size={14} /> Call
                </a>

                {item.status === 'new' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (replyInputId === item.id) {
                        setReplyInputId(null);
                      } else {
                        setReplyInputId(item.id);
                      }
                    }}
                  >
                    Add Note
                  </button>
                )}
              </div>
            </div>

            {/* In-card Note Form */}
            {replyInputId === item.id && (
              <div className="quick-reply-form">
                <input
                  type="text"
                  placeholder="e.g. Called student, confirmed 3-day trial pass..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="quick-reply-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleMarkReplied(item.id, replyText)}
                >
                  Save & Resolve
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredEnquiries.length === 0 && (
          <div className="empty-enquiries-card">
            <MessageSquare size={44} className="empty-icon" />
            <h3>No enquiries found</h3>
            <p>
              {enquiries.length === 0
                ? 'No customer enquiries received yet. When students submit enquiries for your mess, they will appear here.'
                : 'You have responded to all enquiries in this category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
