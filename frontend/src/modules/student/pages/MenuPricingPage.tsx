import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calculator,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';
import { mockMesses } from '../../../data/mockMesses';
import { PlanModal } from '../components/PlanModal';
import { MessItem } from '../../../types/student.types';

export const MenuPricingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Today');
  const [selectedMessId, setSelectedMessId] = useState<string>(mockMesses[0].id);
  const [selectedMessForPlan, setSelectedMessForPlan] = useState<MessItem | null>(null);

  // Interactive Student Calculator State
  const [calcMealsPerDay, setCalcMealsPerDay] = useState<number>(2);
  const [calcDuration, setCalcDuration] = useState<number>(30);
  const [calcDiet, setCalcDiet] = useState<'veg' | 'nonveg'>('veg');
  const [calcDelivery, setCalcDelivery] = useState<boolean>(false);

  const selectedMess = ((mockMesses.find((m) => m.id === selectedMessId) ||
    mockMesses[0]) as unknown) as MessItem;

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

  const weeklySchedule: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
    Monday: {
      breakfast: 'Poha with Roasted Peanuts & Masala Chai',
      lunch: 'Paneer Bhurji, Dal Tadka, Steamed Rice, 4 Phulkas, Salad',
      dinner: 'Aloo Gobi Matar, Moong Dal Fry, Kolam Rice, Phulkas',
    },
    Tuesday: {
      breakfast: 'Upma with Coconut Chutney & Filter Coffee',
      lunch: 'Chole Masala, Mix Veg Sabji, Dal Fry, Jeera Rice, Phulkas, Boondi Raita',
      dinner: 'Baingan Masala, Yellow Dal, Steamed Rice, Chapati',
    },
    Wednesday: {
      breakfast: 'Idli Sambar with Podi & Tea',
      lunch: 'Paneer Makhani (or Chicken Sukka for non-veg), Dal Makhani, Fried Rice, Phulkas',
      dinner: 'Matki Usal (Sprouts), Varan Bhaat with Ghee, Phulkas, Papad',
    },
    Thursday: {
      breakfast: 'Methi Paratha with Curd & Pickle',
      lunch: 'Rajma Rasila, Aloo Jeera Sukha, Dal Fry, Steamed Rice, Phulkas, Salad',
      dinner: 'Lauki Chana Dal, Tomato Rasam, Rice, Phulkas',
    },
    Friday: {
      breakfast: 'Kanda Poha & Boiled Egg / Sprouts',
      lunch: 'Dal Makhani Slow-cooked, Shahi Paneer, Jeera Rice, Hot Phulkas, Kheer',
      dinner: 'Egg Curry / Shev Bhaji, Dal Tadka, Rice, Chapati',
    },
    Saturday: {
      breakfast: 'Sabudana Khichdi with Curd & Peanut Chutney',
      lunch: 'Kadhi Pakora, Aloo Shimlamirch, Steamed Rice, Phulkas, Papad',
      dinner: 'Mix Veg Kolhapuri, Dal Fry, Khichdi, Phulkas',
    },
    Sunday: {
      breakfast: 'Misal Pav with Farsan & Lemon',
      lunch: '🌟 SUNDAY FEAST: Shrikhand / Gulab Jamun, Puri, Chana Masala, Pulao, Dal',
      dinner: 'Light Khichdi / Veg Biryani with Boondi Raita',
    },
  };

  const currentMenu =
    selectedDay === 'Today'
      ? {
          breakfast:
            selectedMess.todayMenu?.breakfast?.dish || 'Poha with roasted peanuts & tea',
          lunch: `${selectedMess.todayMenu?.lunch?.sabji1}, ${selectedMess.todayMenu?.lunch?.sabji2}, ${selectedMess.todayMenu?.lunch?.dal}, ${selectedMess.todayMenu?.lunch?.bread}`,
          dinner: `${selectedMess.todayMenu?.dinner?.sabji1}, ${selectedMess.todayMenu?.dinner?.sabji2}, ${selectedMess.todayMenu?.dinner?.dal}, ${selectedMess.todayMenu?.dinner?.bread}`,
        }
      : weeklySchedule[selectedDay];

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

          {/* Mess Selector dropdown */}
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
              {mockMesses.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.foodType})
                </option>
              ))}
            </select>
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
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {currentMenu.breakfast}
            </p>
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
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {currentMenu.lunch}
            </p>
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
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {currentMenu.dinner}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: PLANS COMPARISON MATRIX */}
      <div style={{ marginBottom: '3rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '0.4rem',
            color: 'var(--text-main)',
          }}
        >
          Subscription Plan Comparison
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Pick the package that matches your college schedule and budget.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Plan 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Trial / Ad-hoc
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: '4px 0 8px 0',
                color: 'var(--text-main)',
              }}
            >
              Single Meal Token
            </h3>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '1rem',
              }}
            >
              ₹85 – ₹110{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                / thali
              </span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              <li>✓ Instant single meal pass</li>
              <li>✓ Unlimited hot phulkas & dal</li>
              <li>✓ No advance commitment</li>
              <li>✗ No Sunday sweet included</li>
              <li>✗ No meal pause needed</li>
            </ul>
            <button
              type="button"
              onClick={() => setSelectedMessForPlan(selectedMess)}
              className="btn btn-outline btn-sm"
              style={{ marginTop: 'auto' }}
            >
              Get Meal Token
            </button>
          </div>

          {/* Plan 2: 15-Day Flexi */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#0284c7',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Exam Special
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: '4px 0 8px 0',
                color: 'var(--text-main)',
              }}
            >
              15-Day Flexi Pass
            </h3>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '1rem',
              }}
            >
              ₹1,750{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                / 15 days
              </span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              <li>✓ 30 Meals (Lunch + Dinner)</li>
              <li>✓ Unlimited chapatis</li>
              <li>✓ 2 Days meal pause allowed</li>
              <li>✓ Ideal for semester exam weeks</li>
            </ul>
            <button
              type="button"
              onClick={() => setSelectedMessForPlan(selectedMess)}
              className="btn btn-outline btn-sm"
              style={{ marginTop: 'auto' }}
            >
              Choose 15-Day Pass
            </button>
          </div>

          {/* Plan 3: Monthly Standard (Popular) */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid var(--primary)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-11px',
                right: '16px',
                background: 'var(--primary)',
                color: 'white',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              STUDENT CHOICE
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Full Month (2 Meals)
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: '4px 0 8px 0',
                color: 'var(--text-main)',
              }}
            >
              Monthly Standard
            </h3>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--primary-dark)',
                marginBottom: '1rem',
              }}
            >
              ₹3,200{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                / month
              </span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              <li>✓ 60 Meals (Lunch & Dinner daily)</li>
              <li>✓ Unlimited phulkas & rice</li>
              <li>✓ Free Sunday Sweet Feast included</li>
              <li>✓ Up to 6 Days Meal Pause with validity extension</li>
              <li>✓ Digital QR meal pass on phone</li>
            </ul>
            <button
              type="button"
              onClick={() => setSelectedMessForPlan(selectedMess)}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'auto' }}
            >
              Subscribe Standard
            </button>
          </div>

          {/* Plan 4: Complete */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              All 3 Meals
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: '4px 0 8px 0',
                color: 'var(--text-main)',
              }}
            >
              Monthly Complete
            </h3>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '1rem',
              }}
            >
              ₹4,100{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                / month
              </span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              <li>✓ Breakfast + Lunch + Dinner (90 Meals)</li>
              <li>✓ Morning Special Tea / Coffee</li>
              <li>✓ Priority counter access</li>
              <li>✓ Free hostel tiffin delivery</li>
            </ul>
            <button
              type="button"
              onClick={() => setSelectedMessForPlan(selectedMess)}
              className="btn btn-outline btn-sm"
              style={{ marginTop: 'auto' }}
            >
              Subscribe Complete
            </button>
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

      {/* Plan Modal */}
      {selectedMessForPlan && (
        <PlanModal
          mess={selectedMessForPlan}
          isOpen={!!selectedMessForPlan}
          onClose={() => setSelectedMessForPlan(null)}
        />
      )}
    </div>
  );
};
