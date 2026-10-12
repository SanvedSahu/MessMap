import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  Grid,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { mockMesses } from '../data/mockMesses';
import { MessCard } from '../components/common/MessCard';
import { MessMapView } from '../components/map/MessMapView';
import { PlanModal } from '../components/common/PlanModal';
import { EmptyState } from '../components/EmptyState';

export const FindMessPage = () => {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'split' : 'split';

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedFoodType, setSelectedFoodType] = useState('all');
  const [maxPrice, setMaxPrice] = useState(4500);
  const [maxDistance, setMaxDistance] = useState(3.0);
  const [minRating, setMinRating] = useState(0);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [selectedMessId, setSelectedMessId] = useState(null);
  const [viewMode, setViewMode] = useState(initialView);

  // Subscription modal
  const [selectedMessForPlan, setSelectedMessForPlan] = useState(null);

  // Filtered messes logic
  const filteredMesses = useMemo(() => {
    return mockMesses.filter((mess) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = mess.name.toLowerCase().includes(query);
        const matchesAddress = mess.address.toLowerCase().includes(query);
        const matchesLandmark = mess.landmark?.toLowerCase().includes(query);
        const matchesTagline = mess.tagline.toLowerCase().includes(query);
        const matchesDish =
          mess.todayMenu?.lunch?.sabji1?.toLowerCase().includes(query) ||
          mess.todayMenu?.lunch?.sabji2?.toLowerCase().includes(query);

        if (!matchesName && !matchesAddress && !matchesLandmark && !matchesTagline && !matchesDish) {
          return false;
        }
      }

      if (selectedFoodType !== 'all') {
        if (selectedFoodType === 'Pure Veg' && mess.foodType !== 'Pure Veg') return false;
        if (selectedFoodType === 'Veg & Non-Veg' && mess.foodType !== 'Veg & Non-Veg' && !mess.foodType.includes('Both')) return false;
      }

      if (mess.monthlyPrice > maxPrice) return false;
      if (mess.distanceKm > maxDistance) return false;
      if (minRating > 0 && mess.rating < minRating) return false;
      if (onlyOpen && !mess.isOpenNow) return false;

      return true;
    });
  }, [searchTerm, selectedFoodType, maxPrice, maxDistance, minRating, onlyOpen]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFoodType('all');
    setMaxPrice(4500);
    setMaxDistance(3.0);
    setMinRating(0);
    setOnlyOpen(false);
    setSelectedMessId(null);
  };

  const isFilterActive =
    searchTerm ||
    selectedFoodType !== 'all' ||
    maxPrice < 4500 ||
    maxDistance < 3.0 ||
    minRating > 0 ||
    onlyOpen;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Find Nearby Mess Facilities
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Discover and filter student dining messes near your hostel with live menus, ratings, and map navigation.
        </p>
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Input Bar (Matches Theme Guide Section 4C) */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '560px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: searchTerm ? '36px' : '1rem' }}
              placeholder="Search by mess name, college campus, or dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', padding: '3px', borderRadius: 'var(--radius-md)', marginLeft: 'auto' }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: viewMode === 'split' ? '#ffffff' : 'transparent',
                color: viewMode === 'split' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: viewMode === 'split' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <SlidersHorizontal size={14} /> Map & List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <Grid size={14} /> Grid Only
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: viewMode === 'map' ? '#ffffff' : 'transparent',
                color: viewMode === 'map' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: viewMode === 'map' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <MapIcon size={14} /> Map Only
            </button>
          </div>
        </div>

        {/* Filter Pills & Sliders (Matches Theme Guide Section 4A) */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Dietary Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '🍲 All Diets' },
              { id: 'Pure Veg', label: '🌱 Pure Veg' },
              { id: 'Veg & Non-Veg', label: '🍗 Veg & Non-Veg' }
            ].map((type) => {
              const isSelected = selectedFoodType === type.id;
              return (
                <button
                  key={type.id}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                    color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-full)',
                    fontWeight: isSelected ? 700 : 500,
                    padding: '0.4rem 1rem'
                  }}
                  onClick={() => setSelectedFoodType(type.id)}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Distance Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Distance:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
            >
              <option value={1.0}>Within 1.0 km</option>
              <option value={1.5}>Within 1.5 km</option>
              <option value={2.5}>Within 2.5 km</option>
              <option value={5.0}>Within 5.0 km</option>
            </select>
          </div>

          {/* Budget Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Budget:</span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
            >
              <option value={4500}>All Prices</option>
              <option value={2600}>Under ₹2,600 / mo</option>
              <option value={3200}>Under ₹3,200 / mo</option>
              <option value={3600}>Under ₹3,600 / mo</option>
            </select>
          </div>

          {/* Rating filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>★ 4.5+ Top Rated</option>
              <option value={4.0}>★ 4.0+</option>
            </select>
          </div>

          {/* Open Now Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            Open Now
          </label>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                color: 'var(--danger)',
                fontWeight: 700
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filteredMesses.length}</strong> of {mockMesses.length} student messes found in Campus Area
        </div>
      </div>

      {/* MAIN VIEW CONTENT (SPLIT, GRID, OR MAP) */}
      {filteredMesses.length === 0 ? (
        <EmptyState
          title="No Nearby Messes Found"
          description="Try widening your distance filter or changing your dietary preference."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'split' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '820px', overflowY: 'auto', paddingRight: '6px' }}>
            {filteredMesses.map((mess) => (
              <div
                key={mess.id}
                onMouseEnter={() => setSelectedMessId(mess.id)}
                style={{
                  outline: selectedMessId === mess.id ? '2px solid var(--primary)' : 'none',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <MessCard
                  mess={mess}
                  onSubscribeClick={(m) => setSelectedMessForPlan(m)}
                />
              </div>
            ))}
          </div>

          {/* Right Sticky Map */}
          <div style={{ position: 'sticky', top: '90px', height: '650px' }}>
            <MessMapView
              messes={filteredMesses}
              selectedMessId={selectedMessId}
              onSelectMess={(id) => setSelectedMessId(id)}
              height="100%"
            />
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-cols-auto">
          {filteredMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              onSubscribeClick={(m) => setSelectedMessForPlan(m)}
            />
          ))}
        </div>
      ) : (
        <div style={{ height: '700px' }}>
          <MessMapView
            messes={filteredMesses}
            selectedMessId={selectedMessId}
            onSelectMess={(id) => setSelectedMessId(id)}
            height="100%"
          />
        </div>
      )}

      {/* Plan Subscribe Modal */}
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
