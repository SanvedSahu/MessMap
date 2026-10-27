import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  Grid,
  X,
  RotateCcw,
  RefreshCw,
  Crosshair,
  Compass,
  AlertCircle,
} from 'lucide-react';
import {
  getMessesApi,
  getNearbyMessesApi,
  adaptMessSummaryToMessItem,
  MessFilterParams,
} from '../../../api/studentApi';
import { MessCard } from '../components/MessCard';
import { MessMapView } from '../components/MessMapView';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MessItem } from '../../../types/student.types';
import {
  POPULAR_PUNE_AREAS,
  calculateHaversineDistanceKm,
  isValidCoordinates,
} from '../../../utils/geocoding';

export const FindMessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'split' : 'split';

  // Filters State
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialQuery);
  const [selectedFoodType, setSelectedFoodType] = useState<string>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(4500);
  const [maxDistance, setMaxDistance] = useState<number>(3.0);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false);
  const [selectedMessId, setSelectedMessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>(initialView);

  // Student Geolocation & Nearby Discovery State
  const [studentLocation, setStudentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isNearbyOnly, setIsNearbyOnly] = useState<boolean>(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(5.0);

  // Backend Live State
  const [backendMesses, setBackendMesses] = useState<MessItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Dynamically compute selectable localities from popular areas and registered messes
  const availableLocalities = useMemo(() => {
    const locSet = new Set<string>();
    POPULAR_PUNE_AREAS.forEach((a) => locSet.add(a));
    backendMesses.forEach((m) => {
      if (m.area && m.area.trim()) locSet.add(m.area.trim());
      if (m.city && m.city.trim() && m.city.toLowerCase() !== 'pune') {
        locSet.add(m.city.trim());
      }
    });
    if (selectedLocality && selectedLocality !== 'all') {
      locSet.add(selectedLocality);
    }
    return Array.from(locSet).sort();
  }, [backendMesses, selectedLocality]);

  // Debounce search input to avoid duplicate / race condition requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser Geolocation is not supported by your current browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (isValidCoordinates(lat, lng)) {
          setStudentLocation({ lat, lng });
          setIsNearbyOnly(true);
          setLocationError(null);
        } else {
          setLocationError('Device returned invalid geographic coordinates.');
        }
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Please allow location access in your browser or search by campus locality.');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('Device location information is unavailable. You can continue searching by locality or college name.');
            break;
          case err.TIMEOUT:
            setLocationError('Location request timed out. Please retry or filter by locality.');
            break;
          default:
            setLocationError('Unable to detect current location. Please filter by campus locality.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setStudentLocation(null);
    setIsNearbyOnly(false);
    setLocationError(null);
  };

  // Fetch live messes from backend GET /api/messes or GET /api/messes/nearby
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    if (isNearbyOnly && studentLocation) {
      // Nearby discovery with student origin and radius
      getNearbyMessesApi({
        latitude: studentLocation.lat,
        longitude: studentLocation.lng,
        radiusKm: nearbyRadiusKm,
        foodType: selectedFoodType !== 'all' ? selectedFoodType : undefined,
        search: debouncedSearch.trim() || undefined,
        maxPrice: maxPrice < 4500 ? maxPrice : undefined,
      })
        .then((res) => {
          if (!isCurrent) return;
          if (res && Array.isArray(res.data)) {
            const adapted = res.data.map(adaptMessSummaryToMessItem);
            // Ensure distance is accurately calculated and sorted
            const withDistances = adapted.map((m) => {
              const dist = calculateHaversineDistanceKm(
                studentLocation.lat,
                studentLocation.lng,
                m.lat,
                m.lng
              );
              return {
                ...m,
                distanceKm: !isNaN(dist) ? dist : m.distanceKm,
              };
            });
            withDistances.sort((a, b) => {
              const da = typeof a.distanceKm === 'number' && !isNaN(a.distanceKm) ? a.distanceKm : Infinity;
              const db = typeof b.distanceKm === 'number' && !isNaN(b.distanceKm) ? b.distanceKm : Infinity;
              return da - db;
            });
            setBackendMesses(withDistances);
          } else {
            setBackendMesses([]);
          }
        })
        .catch((err: any) => {
          if (!isCurrent) return;
          setError(err?.message || 'Unable to fetch nearby messes.');
          setBackendMesses([]);
        })
        .finally(() => {
          if (isCurrent) {
            setIsLoading(false);
          }
        });
    } else {
      // Standard discovery
      const params: MessFilterParams = {
        search: debouncedSearch.trim() || undefined,
        foodType: selectedFoodType !== 'all' ? selectedFoodType : undefined,
        locality: selectedLocality !== 'all' ? selectedLocality : undefined,
        maxPrice: maxPrice < 4500 ? maxPrice : undefined,
      };

      getMessesApi(params)
        .then((res) => {
          if (!isCurrent) return;
          if (res && Array.isArray(res.data)) {
            const adapted = res.data.map(adaptMessSummaryToMessItem);
            // If student location is known, calculate distances for standard list
            if (studentLocation) {
              const withDist = adapted.map((m) => {
                const dist = calculateHaversineDistanceKm(
                  studentLocation.lat,
                  studentLocation.lng,
                  m.lat,
                  m.lng
                );
                return {
                  ...m,
                  distanceKm: !isNaN(dist) ? dist : m.distanceKm,
                };
              });
              setBackendMesses(withDist);
            } else {
              setBackendMesses(adapted);
            }
          } else {
            setBackendMesses([]);
          }
        })
        .catch((err: any) => {
          if (!isCurrent) return;
          setError(err?.message || 'Unable to connect to MessMap backend service.');
          setBackendMesses([]);
        })
        .finally(() => {
          if (isCurrent) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [
    debouncedSearch,
    selectedFoodType,
    selectedLocality,
    maxPrice,
    refreshTrigger,
    isNearbyOnly,
    studentLocation,
    nearbyRadiusKm,
  ]);

  // Client-side secondary filters for rating, open status, and distance
  const filteredMesses = useMemo(() => {
    return backendMesses.filter((mess) => {
      if (isNearbyOnly && studentLocation) {
        // Exclude messes without valid precise coordinates from distance-based results
        if (!isValidCoordinates(mess.lat, mess.lng)) return false;
        if (typeof mess.distanceKm === 'number' && mess.distanceKm > nearbyRadiusKm) return false;
      }
      if (minRating > 0 && mess.rating < minRating) return false;
      if (onlyOpen && !mess.isOpenNow) return false;
      return true;
    });
  }, [backendMesses, minRating, onlyOpen, isNearbyOnly, studentLocation, nearbyRadiusKm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFoodType('all');
    setSelectedLocality('all');
    setMaxPrice(4500);
    setMaxDistance(5.0);
    setMinRating(0);
    setOnlyOpen(false);
    setSelectedMessId(null);
    setIsNearbyOnly(false);
    setStudentLocation(null);
    setLocationError(null);
  };

  const isFilterActive =
    searchTerm ||
    selectedFoodType !== 'all' ||
    selectedLocality !== 'all' ||
    maxPrice < 4500 ||
    minRating > 0 ||
    onlyOpen ||
    isNearbyOnly ||
    studentLocation !== null;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.4rem',
            color: 'var(--text-main)',
          }}
        >
          Find Nearby Mess Facilities
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Discover and filter student dining messes near your hostel with live menus, ratings, and
          map navigation.
        </p>
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Student Geolocation Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '1rem',
            padding: '10px 14px',
            background: studentLocation ? '#ecfdf5' : 'var(--bg-card-subtle)',
            border: `1px solid ${studentLocation ? '#a7f3d0' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className={`btn btn-sm ${studentLocation ? 'btn-success' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {isLocating ? <RefreshCw size={14} className="spin" /> : <Crosshair size={14} />}
              {isLocating
                ? 'Detecting GPS...'
                : studentLocation
                ? 'Update My Location'
                : 'Use My Current Location'}
            </button>

            {studentLocation && (
              <>
                <button
                  type="button"
                  onClick={() => setIsNearbyOnly(!isNearbyOnly)}
                  className={`btn btn-sm ${isNearbyOnly ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Compass size={14} /> Nearby Messes {isNearbyOnly ? '(Active)' : ''}
                </button>

                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                >
                  <X size={14} /> Clear Location / Show All
                </button>
              </>
            )}

            {studentLocation && (
              <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                📍 GPS Origin: {studentLocation.lat.toFixed(4)}° N, {studentLocation.lng.toFixed(4)}° E
              </span>
            )}
          </div>

          {/* Radius selector when location is active */}
          {studentLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Radius:</span>
              <select
                value={nearbyRadiusKm}
                onChange={(e) => setNearbyRadiusKm(Number(e.target.value))}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <option value={1.0}>1.0 km</option>
                <option value={2.0}>2.0 km</option>
                <option value={3.0}>3.0 km</option>
                <option value={5.0}>5.0 km (Standard)</option>
                <option value={10.0}>10.0 km</option>
                <option value={15.0}>15.0 km</option>
              </select>
            </div>
          )}
        </div>

        {locationError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Input Bar */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '560px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
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
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card-subtle)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              marginLeft: 'auto',
            }}
          >
            <button
              type="button"
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
                boxShadow: viewMode === 'split' ? 'var(--shadow-xs)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={14} /> Map & List
            </button>
            <button
              type="button"
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
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Grid size={14} /> Grid Only
            </button>
            <button
              type="button"
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
                boxShadow: viewMode === 'map' ? 'var(--shadow-xs)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <MapIcon size={14} /> Map Only
            </button>
          </div>
        </div>

        {/* Filter Pills & Sliders */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {/* Dietary Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '🍲 All Diets' },
              { id: 'Pure Veg', label: '🌱 Pure Veg' },
              { id: 'Veg & Non-Veg', label: '🍗 Veg & Non-Veg' },
            ].map((type) => {
              const isSelected = selectedFoodType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                    color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-full)',
                    fontWeight: isSelected ? 700 : 500,
                    padding: '0.4rem 1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedFoodType(type.id)}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Locality Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}
          >
            <MapPin size={14} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Locality:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Localities</option>
              {availableLocalities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Radius:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={1.0}>Within 1.0 km</option>
              <option value={1.5}>Within 1.5 km</option>
              <option value={2.5}>Within 2.5 km</option>
              <option value={5.0}>Within 5.0 km</option>
            </select>
          </div>

          {/* Budget Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Budget:</span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={4500}>All Prices</option>
              <option value={2600}>Under ₹2,600 / mo</option>
              <option value={3200}>Under ₹3,200 / mo</option>
              <option value={3600}>Under ₹3,600 / mo</option>
            </select>
          </div>

          {/* Rating filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>★ 4.5+ Top Rated</option>
              <option value={4.0}>★ 4.0+</option>
            </select>
          </div>

          {/* Open Now Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            Open Now
          </label>

          {/* Refresh & Reset Filters */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                background: 'var(--primary-light)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
              title="Refresh mess listings from backend"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--danger)',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLoading ? (
            <span>Loading verified student messes from backend...</span>
          ) : error ? (
            <span style={{ color: 'var(--danger)' }}>Backend connection error</span>
          ) : (
            <span>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filteredMesses.length}</strong> of{' '}
              {backendMesses.length} student messes found
            </span>
          )}
        </div>
      </div>

      {/* MAIN VIEW CONTENT (LOADING, ERROR, EMPTY, SPLIT, GRID, OR MAP) */}
      {isLoading ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Finding Verified Messes...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Querying campus backend for approved mess listings, menus, and ratings
            </p>
          </div>
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            border: '1.5px solid #fecaca',
            background: '#fff5f5',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.4rem' }}>
            Backend Unavailable
          </h3>
          <p style={{ color: '#7f1d1d', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="btn btn-primary btn-sm"
          >
            Retry Loading Messes
          </button>
        </div>
      ) : filteredMesses.length === 0 ? (
        <EmptyState
          title="No Nearby Messes Found"
          description="Try widening your distance filter or changing your dietary preference."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'split' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Cards List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '820px',
              overflowY: 'auto',
              paddingRight: '6px',
            }}
          >
            {filteredMesses.map((mess) => (
              <div
                key={mess.id}
                onMouseEnter={() => setSelectedMessId(mess.id)}
                style={{
                  outline: selectedMessId === mess.id ? '2px solid var(--primary)' : 'none',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <MessCard mess={mess} />
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
              studentPos={studentLocation ? [studentLocation.lat, studentLocation.lng] : null}
            />
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-cols-auto">
          {filteredMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
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
            studentPos={studentLocation ? [studentLocation.lat, studentLocation.lng] : null}
          />
        </div>
      )}
    </div>
  );
};
