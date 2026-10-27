import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calculator,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  UtensilsCrossed,
} from 'lucide-react';
import { MessItem } from '../../../types/student.types';
import {
  getMessesApi,
  adaptMessSummaryToMessItem,
  getMessDailyMenuApi,
  DailyMealResponse,
} from '../../../api/studentApi';
import { AskEnquiryModal } from '../../../components/enquiry/AskEnquiryModal';

export const MenuPricingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Today');
  const [selectedMessId, setSelectedMessId] = useState<string>('');
  const [messes, setMesses] = useState<MessItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Daily Meal Menu dynamic database state
  const [dailyMenu, setDailyMenu] = useState<DailyMealResponse | null>(null);
  const [dailyMenuLoading, setDailyMenuLoading] = useState<boolean>(false);
  const [dailyMenuError, setDailyMenuError] = useState<string | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);

  // Interactive Student Calculator State
  const [calcMealsPerDay, setCalcMealsPerDay] = useState<number>(2);
  const [calcDuration, setCalcDuration] = useState<number>(30);
  const [calcDiet, setCalcDiet] = useState<'veg' | 'nonveg'>('veg');
  const [calcDelivery, setCalcDelivery] = useState<boolean>(false);

  const fetchMesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMessesApi();
      if (res.data && res.data.length > 0) {
        const adapted = res.data.map(adaptMessSummaryToMessItem);
        setMesses(adapted);
        setSelectedMessId((prev) => (prev && adapted.some((m) => m.id === prev) ? prev : adapted[0].id));
      } else {
        setMesses([]);
      }
    } catch (err: any) {
      console.error('[MenuPricingPage] Failed to fetch messes from API:', err);
      setError('Unable to load mess list. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  const selectedMess = messes.find((m) => m.id === selectedMessId) || messes[0];

  const baseRatePerDay =
    calcDiet === 'veg'
      ? calcMealsPerDay === 1
        ? 50
        : calcMealsPerDay === 2
        ? 95
        : 135
      : calcMealsPerDay === 1
      ? 70
      : calcMealsPerDay === 2
      ? 120
      : 165;

  const calculatedTotal =
    baseRatePerDay * calcDuration + (calcDelivery ? (calcDuration === 15 ? 150 : 300) : 0);

  const weekDays = [
    'Today',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Dynamic daily menu fetch connected to database
  useEffect(() => {
    if (!selectedMess?.id) return;
    let isCurrent = true;
    setDailyMenuLoading(true);
    setDailyMenuError(null);

    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayOfWeekNames[new Date().getDay()];
    const queryDay = selectedDay === 'Today' ? todayName : selectedDay;

    getMessDailyMenuApi(selectedMess.id, queryDay)
      .then((res) => {
        if (!isCurrent) return;
        if (res?.data) {
          setDailyMenu(res.data);
        } else {
          setDailyMenu(null);
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn(`[MenuPricingPage] Failed to fetch daily menu for mess ${selectedMess.id}, day ${queryDay}:`, err);
        setDailyMenuError('Menu not updated yet for this day.');
        setDailyMenu(null);
      })
      .finally(() => {
        if (isCurrent) setDailyMenuLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedMess?.id, selectedDay]);

  const currentMenu = {
    breakfast: dailyMenu?.breakfast?.trim() || null,
    lunch: dailyMenu?.lunch?.trim() || null,
    dinner: dailyMenu?.dinner?.trim() || null,
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
            }}
          >
            <Sparkles size={14} /> Full Transparency
          </div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.4rem',
              color: 'var(--text-main)',
            }}
          >
            Weekly Menus & Student Subscription Pricing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Check day-by-day food menus, compare meal packages, and calculate custom subscription fees.
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Loader2
            size={36}
            className="animate-spin"
            style={{ margin: '0 auto 1rem', color: 'var(--primary)' }}
          />
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
            Loading approved campus messes & pricing...
          </p>
        </div>
      </div>
    );
  }

  if (error || messes.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
            }}
          >
            <Sparkles size={14} /> Full Transparency
          </div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.4rem',
              color: 'var(--text-main)',
            }}
          >
            Weekly Menus & Student Subscription Pricing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Check day-by-day food menus, compare meal packages, and calculate custom subscription fees.
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertCircle
            size={40}
            style={{ margin: '0 auto 1rem', color: error ? 'var(--danger)' : 'var(--warning)' }}
          />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {error ? 'Failed to Load Menus' : 'No Approved Messes Found'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {error || 'There are currently no approved messes available for viewing.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchMesses}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.65rem',
          }}
        >
          <Sparkles size={14} /> Full Transparency
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.4rem',
            color: 'var(--text-main)',
          }}
        >
          Weekly Menus & Student Subscription Pricing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Check day-by-day food menus, compare meal packages, and calculate custom subscription fees.
        </p>
      </div>

      {/* SECTION 1: WEEKLY DAY SCHEDULE SELECTOR */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Explore Daily Meal Menus
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Select a day of the week and a mess facility
            </div>
          </div>

          {/* Mess Selector dropdown & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Viewing Mess:
              </span>
              <select
                className="form-select"
                value={selectedMessId}
                onChange={(e) => setSelectedMessId(e.target.value)}
                style={{ width: 'auto', padding: '0.45rem 0.85rem', fontWeight: 700 }}
              >
                {messes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.foodType})
                  </option>
                ))}
              </select>
            </div>

            {selectedMess && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsEnquiryModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <HelpCircle size={15} /> Ask Enquiry
                </button>
                <Link
                  to={`/mess/${selectedMess.id}`}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  View Details →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Days of week pill tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '1.5rem',
          }}
        >
          {weekDays.map((day) => {
            const active = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: active ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  background: active ? 'var(--primary-light)' : '#ffffff',
                  color: active ? 'var(--primary-dark)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                {day === 'Today' ? '⚡ Today Live' : day}
              </button>
            );
          })}
        </div>

        {/* 3 Meals breakdown for selected day */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Breakfast */}
          <div
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.75rem',
                color: 'var(--warning-dark)',
                fontWeight: 800,
              }}
            >
              <Coffee size={18} />
              <span>BREAKFAST (07:30 – 10:00 AM)</span>
            </div>
            {dailyMenuLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Loading breakfast menu...</span>
              </div>
            ) : currentMenu.breakfast ? (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {currentMenu.breakfast}
              </p>
            ) : (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                Menu not updated yet
              </p>
            )}
          </div>

          {/* Lunch */}
          <div
            style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.75rem',
                color: 'var(--primary-dark)',
                fontWeight: 800,
              }}
            >
              <Sun size={18} />
              <span>LUNCH (12:15 – 03:00 PM)</span>
            </div>
            {dailyMenuLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Loading lunch menu...</span>
              </div>
            ) : currentMenu.lunch ? (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {currentMenu.lunch}
              </p>
            ) : (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                Menu not updated yet
              </p>
            )}
          </div>

          {/* Dinner */}
          <div
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.75rem',
                color: '#4338ca',
                fontWeight: 800,
              }}
            >
              <Moon size={18} />
              <span>DINNER (07:30 – 10:15 PM)</span>
            </div>
            {dailyMenuLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Loading dinner menu...</span>
              </div>
            ) : currentMenu.dinner ? (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {currentMenu.dinner}
              </p>
            ) : (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                Menu not updated yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE STUDENT SUBSCRIPTION CALCULATOR */}
      <div
        className="card"
        style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Calculator size={22} color="var(--primary)" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Custom Student Meal Cost Estimator
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {/* Controls */}
          <div>
            <div className="form-group">
              <label className="form-label">Meals per Day:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { count: 1, label: '1 Meal (Lunch)' },
                  { count: 2, label: '2 Meals (Lunch & Dinner)' },
                  { count: 3, label: '3 Meals (+ Breakfast)' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setCalcMealsPerDay(item.count)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border:
                        calcMealsPerDay === item.count
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-color)',
                      background: calcMealsPerDay === item.count ? 'var(--primary-light)' : '#ffffff',
                      color:
                        calcMealsPerDay === item.count ? 'var(--primary-dark)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pass Duration:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[15, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setCalcDuration(days)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border:
                        calcDuration === days
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-color)',
                      background: calcDuration === days ? 'var(--primary-light)' : '#ffffff',
                      color: calcDuration === days ? 'var(--primary-dark)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {days} Days {days === 60 ? '(2 Months)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={calcDiet === 'nonveg'}
                  onChange={(e) => setCalcDiet(e.target.checked ? 'nonveg' : 'veg')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Include Non-Veg Days (Wed / Sun)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={calcDelivery}
                  onChange={(e) => setCalcDelivery(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Hostel Tiffin Delivery (+₹300/mo)
              </label>
            </div>
          </div>

          {/* Result Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Estimated Total Subscription
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--primary-dark)',
                margin: '8px 0',
              }}
            >
              ₹{calculatedTotal.toLocaleString('en-IN')}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
              }}
            >
              Covers approx. <strong>{calcMealsPerDay * calcDuration} meals</strong> (~₹
              {Math.round(calculatedTotal / (calcMealsPerDay * calcDuration))} per meal)
            </div>

            <Link to="/find-mess" className="btn btn-primary" style={{ width: '100%' }}>
              Browse Messes in this Budget <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {selectedMess && (
        <AskEnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          messId={selectedMess.id}
          messName={selectedMess.name}
        />
      )}
    </div>
  );
};
