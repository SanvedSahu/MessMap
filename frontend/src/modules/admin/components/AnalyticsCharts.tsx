import React from 'react';

export const GrowthBarChart: React.FC = () => {
  const months = [
    { label: 'May', students: 1200, messes: 65 },
    { label: 'Jun', students: 1650, messes: 82 },
    { label: 'Jul', students: 2100, messes: 110 },
    { label: 'Aug', students: 2750, messes: 145 },
    { label: 'Sep', students: 3100, messes: 168 },
    { label: 'Oct', students: 3420, messes: 184 },
  ];

  const maxStudents = 4000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.785rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Registered Students</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3b82f6' }} />
          <span style={{ color: 'var(--text-muted)' }}>Messes Onboarded</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', gap: '0.5rem' }}>
        {months.map((m) => {
          const studentHeight = (m.students / maxStudents) * 100;
          const messHeight = ((m.messes * 15) / maxStudents) * 100;

          return (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '70%', justifyContent: 'center', height: '100%' }}>
                {/* Student Bar */}
                <div
                  title={`${m.students} students`}
                  style={{
                    width: '50%',
                    maxWidth: '20px',
                    height: `${studentHeight}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
                {/* Mess Bar */}
                <div
                  title={`${m.messes} messes`}
                  style={{
                    width: '50%',
                    maxWidth: '20px',
                    height: `${messHeight}%`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CuisineDonutBreakdown: React.FC = () => {
  const cuisines = [
    { label: 'Pure Veg', percent: 48, count: 88, color: '#10b981' },
    { label: 'Veg & Non-Veg', percent: 38, count: 70, color: '#f59e0b' },
    { label: 'Jain Friendly', percent: 14, count: 26, color: '#6366f1' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Progress Bars */}
      <div style={{ height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
        {cuisines.map((c) => (
          <div
            key={c.label}
            style={{
              width: `${c.percent}%`,
              backgroundColor: c.color,
              transition: 'width 0.4s ease',
            }}
            title={`${c.label}: ${c.percent}%`}
          />
        ))}
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {cuisines.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.color }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{c.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.count} messes</span>
              <strong style={{ color: 'var(--text-main)', minWidth: '32px', textAlign: 'right' }}>{c.percent}%</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CampusAreaDistribution: React.FC = () => {
  const areas = [
    { area: 'South Gate (Hostel Hub)', count: 62, percent: 34, rating: 4.6 },
    { area: 'Engineering Quad', count: 48, percent: 26, rating: 4.4 },
    { area: 'North Campus', count: 36, percent: 20, rating: 4.7 },
    { area: 'University Road', count: 24, percent: 13, rating: 4.5 },
    { area: 'Tech Park IT Corridor', count: 14, percent: 7, rating: 3.9 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {areas.map((a) => (
        <div key={a.area} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a.area}</span>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong>{a.count}</strong> messes • avg ★ {a.rating}
            </span>
          </div>
          <div style={{ height: '7px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${a.percent * 2.5}%`,
                backgroundColor: 'var(--primary)',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
