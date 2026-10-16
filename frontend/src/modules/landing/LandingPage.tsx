import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Utensils,
  Store,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  Search,
  Check,
  HeartHandshake,
  Clock,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessData } from '../../context/MessDataContext';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { approvedMesses } = useMessData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-mess?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/find-mess');
    }
  };

  // Top 3 featured approved messes
  const featured = approvedMesses.slice(0, 3);

  return (
    <div className="landing-wrapper">
      {/* 1. Header */}
      <header className="landing-header">
        <div className="landing-nav-container">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <MapPin size={22} />
            </div>
            <span>MessMap</span>
          </Link>

          <nav>
            <ul className="landing-nav-links">
              <li>
                <Link to="/" className="landing-nav-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/find-mess" className="landing-nav-link">
                  Find Messes
                </Link>
              </li>
              <li>
                <a href="#about" className="landing-nav-link">
                  About
                </a>
              </li>
              <li>
                <a href="#roles" className="landing-nav-link">
                  Portals
                </a>
              </li>
            </ul>
          </nav>

          <div className="landing-auth-buttons">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {role === 'admin' && (
                  <Link to="/admin" className="btn btn-primary btn-sm">
                    <Shield size={16} /> Admin Portal
                  </Link>
                )}
                {role === 'owner' && (
                  <Link to="/owner/dashboard" className="btn btn-primary btn-sm">
                    <Store size={16} /> Owner Hub
                  </Link>
                )}
                {role === 'student' && (
                  <Link to="/student/dashboard" className="btn btn-primary btn-sm">
                    <Compass size={16} /> Student Dashboard
                  </Link>
                )}
                <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Campus Food Discovery & Hygiene Network</span>
          </div>

          <h1 className="hero-heading">
            Find Your <span>Perfect Mess</span> Nearby
          </h1>

          <p className="hero-subtext">
            Discover nearby messes, compare prices, explore menus, and find food that suits you.
          </p>

          <div className="hero-cta-group">
            <Link to="/find-mess" className="btn btn-primary btn-lg">
              <Compass size={18} />
              Find Messes
            </Link>
            <Link to="/register?role=owner" className="btn btn-secondary btn-lg">
              <Store size={18} />
              List Your Mess
            </Link>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hero-quick-search">
            <Search size={20} color="var(--primary)" />
            <input
              type="text"
              placeholder="Search by mess name, college campus, or area (e.g. Fergusson, Shivajinagar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              Search Now
            </button>
          </form>
        </div>
      </section>

      {/* 3. Role Selection Section */}
      <section id="roles" className="roles-section">
        <div className="section-header">
          <h2 className="section-title">Choose How You Use MessMap</h2>
          <p className="section-desc">
            Simple, dedicated tools designed for college students, mess service partners, and campus administrators.
          </p>
        </div>

        <div className="roles-grid">
          {/* Role 1: Student */}
          <div className="role-card student-card">
            <div className="role-icon-box">
              <Compass size={28} />
            </div>
            <h3 className="role-title">1. Student</h3>
            <p className="role-desc">
              Find messes, compare prices, view menus, and explore locations.
            </p>
            <ul className="role-features-list">
              <li>
                <Check size={16} color="var(--primary)" /> Interactive Leaflet map of nearby messes
              </li>
              <li>
                <Check size={16} color="var(--primary)" /> Filter by Pure Veg, Veg & Non-Veg, or Price
              </li>
              <li>
                <Check size={16} color="var(--primary)" /> Live daily lunch and dinner menu listings
              </li>
              <li>
                <Check size={16} color="var(--primary)" /> Authentic community reviews & hygiene ratings
              </li>
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <Link to="/find-mess" className="btn btn-primary" style={{ flex: 1 }}>
                Find Messes
              </Link>
              <Link to="/login?role=student" className="btn btn-secondary" title="Student Login">
                Login
              </Link>
            </div>
          </div>

          {/* Role 2: Mess Owner */}
          <div className="role-card owner-card">
            <div className="role-icon-box">
              <Store size={28} />
            </div>
            <h3 className="role-title">2. Mess Owner</h3>
            <p className="role-desc">
              Register your mess, manage its details, and track approval.
            </p>
            <ul className="role-features-list">
              <li>
                <Check size={16} color="#d97706" /> Register mess with menu and pricing
              </li>
              <li>
                <Check size={16} color="#d97706" /> Track verification & admin approval in real-time
              </li>
              <li>
                <Check size={16} color="#d97706" /> Update daily menus, meal times, and holidays
              </li>
              <li>
                <Check size={16} color="#d97706" /> Respond to student enquiries and reviews
              </li>
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <Link to="/register?role=owner" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#d97706' }}>
                Register Mess
              </Link>
              <Link to="/login?role=owner" className="btn btn-secondary" title="Owner Login">
                Login
              </Link>
            </div>
          </div>

          {/* Role 3: Admin */}
          <div className="role-card admin-card">
            <div className="role-icon-box">
              <Shield size={28} />
            </div>
            <h3 className="role-title">3. Admin</h3>
            <p className="role-desc">
              Manage accounts and verify mess listings.
            </p>
            <ul className="role-features-list">
              <li>
                <Check size={16} color="#2563eb" /> Review pending mess registration applications
              </li>
              <li>
                <Check size={16} color="#2563eb" /> Verify hygiene standards, approve or reject
              </li>
              <li>
                <Check size={16} color="#2563eb" /> Manage student accounts and resolve complaints
              </li>
              <li>
                <Check size={16} color="#2563eb" /> Export campus nutrition and food audits
              </li>
            </ul>
            <Link to="/admin/login" className="btn btn-secondary" style={{ marginTop: 'auto', borderColor: '#2563eb', color: '#2563eb' }}>
              Admin Login →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Approved Messes */}
      <section className="featured-section">
        <div className="featured-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                <CheckCircle2 size={16} /> VERIFIED & ACTIVE
              </div>
              <h2 className="section-title" style={{ marginBottom: '4px' }}>Popular Campus Messes</h2>
              <p className="section-desc" style={{ textAlign: 'left', margin: 0 }}>
                Approved by campus administrators. Verified for food hygiene and student safety.
              </p>
            </div>
            <Link to="/find-mess" className="btn btn-outline-primary btn-sm">
              View All {approvedMesses.length} Approved Messes →
            </Link>
          </div>

          <div className="featured-grid">
            {featured.map((mess) => (
              <div key={mess.id} className="featured-card">
                <img
                  src={(mess as any).heroImage || 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80'}
                  alt={mess.name}
                  className="featured-card-img"
                />
                <div className="featured-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`badge ${mess.foodType === 'Pure Veg' ? 'badge-success' : 'badge-danger'}`}>
                      {mess.foodType === 'Pure Veg' ? '🌱 Pure Veg' : '🍗 Veg & Non-Veg'}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={14} fill="currentColor" /> {mess.rating}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                    {mess.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    📍 {mess.area || mess.address}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Monthly Rate</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{mess.monthlyPrice}
                      </span>
                    </div>
                    <Link to={`/mess/${mess.id}`} className="btn btn-primary btn-sm">
                      View Menu & Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why MessMap / Trust Section */}
      <section id="about" className="values-section">
        <div className="section-header">
          <h2 className="section-title">Built For Better Campus Life</h2>
          <p className="section-desc">
            No more relying on unverified flyers or walking miles to find a good meal.
          </p>
        </div>

        <div className="values-grid">
          <div className="value-item">
            <Shield size={32} className="value-icon" />
            <h4 className="value-title">Admin Verified</h4>
            <p className="value-desc">
              Every mess is reviewed by campus admins for food safety compliance before appearing to students.
            </p>
          </div>

          <div className="value-item">
            <Compass size={32} className="value-icon" />
            <h4 className="value-title">Distance & Map Search</h4>
            <p className="value-desc">
              Locate walking-distance messes right from your hostel using our interactive OpenStreetMap view.
            </p>
          </div>

          <div className="value-item">
            <Utensils size={32} className="value-icon" />
            <h4 className="value-title">Daily Live Menus</h4>
            <p className="value-desc">
              Check what is cooking for lunch or dinner before you step out of your hostel room.
            </p>
          </div>

          <div className="value-item">
            <Star size={32} className="value-icon" />
            <h4 className="value-title">Transparent Reviews</h4>
            <p className="value-desc">
              Read authentic feedback and ratings from fellow college students who eat there every day.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div>
            <div className="landing-logo" style={{ marginBottom: '1rem' }}>
              <div className="landing-logo-icon">
                <MapPin size={20} />
              </div>
              <span>MessMap</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px' }}>
              Connecting hostel students with safe, verified, and affordable mess services across Pune college campuses.
            </p>
          </div>

          <div>
            <h5 className="footer-col-title">For Students</h5>
            <ul className="footer-links">
              <li><Link to="/find-mess">Search Messes</Link></li>
              <li><Link to="/login?role=student">Student Login</Link></li>
              <li><Link to="/register">Student Sign Up</Link></li>
              <li><Link to="/menu-pricing">Compare Menus</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-col-title">For Mess Owners</h5>
            <ul className="footer-links">
              <li><Link to="/register?role=owner">Register Your Mess</Link></li>
              <li><Link to="/login?role=owner">Owner Dashboard</Link></li>
              <li><a href="#roles">Approval Process</a></li>
              <li><Link to="/help">Partner Support</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-col-title">Administration</h5>
            <ul className="footer-links">
              <li><Link to="/admin/login">Admin Gateway</Link></li>
              <li><Link to="/help">Help & Contact</Link></li>
              <li><span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Sprint Demo Build v1.0</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} MessMap Campus Network. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Hostel Campus Safety</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
