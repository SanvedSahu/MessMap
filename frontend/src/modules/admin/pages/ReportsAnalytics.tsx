import React, { useState } from 'react';
import {
  Download,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { GrowthBarChart, CuisineDonutBreakdown, CampusAreaDistribution } from '../components/AnalyticsCharts';

interface ReportsAnalyticsProps {
  onExportReport: (format: 'csv' | 'pdf') => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ onExportReport }) => {
  const [dateRange, setDateRange] = useState<string>('month');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header with Date Filter and Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Campus Food Services Analytics & Reports
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Data-driven insights into student dining costs, hygiene inspections, and regional mess coverage
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Date range picker */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`btn btn-sm ${dateRange === range ? 'btn-primary' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize', padding: '0.35rem 0.75rem' }}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days' : range === 'month' ? 'This Month' : 'Last Quarter'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onExportReport('csv')}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <FileSpreadsheet size={15} color="#10b981" /> Export CSV
            </button>
            <button
              onClick={() => onExportReport('pdf')}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <Download size={15} /> Export Audit PDF
            </button>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid-stats">
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Monthly Fee</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            ₹3,380
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.35rem' }}>
            <TrendingUp size={13} /> +4.2% vs previous semester
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Campus Hygiene Index</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            4.62 / 5.0
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Based on 98 sanitary inspections
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Grievance Resolution Speed</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
            1.4 Days
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.35rem' }}>
            94.8% tickets closed within SLA
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student Satisfaction</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            91.4%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Derived from 1,250+ student ratings
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2col">
        {/* Growth trends */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Student Signups & Mess Expansion</div>
              <div className="card-subtitle">Trajectory for the current {dateRange} cycle</div>
            </div>
          </div>
          <GrowthBarChart />
        </div>

        {/* Cuisine ratio */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cuisine & Diet Distribution</div>
              <div className="card-subtitle">Composition across student meal preferences</div>
            </div>
          </div>
          <CuisineDonutBreakdown />
        </div>
      </div>

      {/* Bottom Area Density & Pricing Breakdown */}
      <div className="grid-2col">
        {/* Regional Density */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Campus Zone Mess Density & Average Rating</div>
              <div className="card-subtitle">Distribution across hostel clusters and university gates</div>
            </div>
          </div>
          <CampusAreaDistribution />
        </div>

        {/* Price Tier Segmentation */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Subscription Price Bands</div>
              <div className="card-subtitle">Market affordability breakdown for students</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Budget Friendly (&lt; ₹3,000 / mo)</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>32% (58 messes)</span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Targeted at hostellers seeking basic, wholesome daily meal coverage.
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Standard Tier (₹3,000 - ₹3,600 / mo)</span>
                <span style={{ fontWeight: 800, color: '#3b82f6' }}>52% (96 messes)</span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Includes weekly specials, Sunday sweet dish, and unlimited bread/rice.
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Executive Dining (&gt; ₹3,600 / mo)</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>16% (30 messes)</span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Air-conditioned dining spaces, non-veg feasts, and customizable diet menus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
