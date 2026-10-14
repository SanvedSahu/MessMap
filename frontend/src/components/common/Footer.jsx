import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, Phone, Mail, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem 1.5rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌱</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Mess<span style={{ color: 'var(--primary)' }}>Map</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            A student-first mess discovery and subscription management platform built to help college students find healthy, affordable, and homestyle food near campus.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
            <Shield size={14} /> FSSAI Verified Listings
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Student Navigation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li><Link to="/">Student Dashboard</Link></li>
            <li><Link to="/find-mess">Find Nearby Messes</Link></li>
            <li><Link to="/subscriptions">Meal Subscription Pass</Link></li>
            <li><Link to="/menu-pricing">Weekly Menus & Pricing</Link></li>
            <li><Link to="/favorites">Saved Favorite Messes</Link></li>
          </ul>
        </div>

        {/* Student Locations */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            College Campus Zones
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--primary)" /> FC Road & BMCC, Pune</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--primary)" /> COEP & Shivajinagar Campus</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--primary)" /> Kothrud & MIT WPU Area</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--primary)" /> Deccan & Karve Road</li>
          </ul>
        </div>

        {/* Student Support Helpline */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            MessMap Helpline
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Facing any meal delivery issue or mess grievance? Contact campus student support:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="var(--primary)" /> +91 98234 00000 (Hostel Support)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="var(--info)" /> support@messmap.edu
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          © 2026 MessMap — Final Year Project | User Module
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/help">Student FAQs</Link>
          <Link to="/reviews">Community Reviews</Link>
          <Link to="/help">Report a Grievance</Link>
        </div>
      </div>
    </footer>
  );
};
