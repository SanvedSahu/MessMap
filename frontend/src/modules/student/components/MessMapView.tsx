import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import { FoodBadge } from '../../../components/ui/Badge';
import { MessItem } from '../../../types/student.types';

// Helper component to center or pan map
interface ChangeViewProps {
  center: LatLngExpression;
  zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Custom Marker creator for Messes with Mint / Emerald Theme
const createMessIcon = (foodType: string, isSelected: boolean) => {
  const isVeg = foodType === 'Pure Veg';
  const bgColor = isVeg ? '#10b981' : '#e11d48';
  const iconEmoji = isVeg ? '🌱' : '🍗';

  return L.divIcon({
    className: 'custom-mess-marker',
    html: `
      <div style="
        background: ${isSelected ? '#0f172a' : bgColor};
        width: ${isSelected ? '38px' : '32px'};
        height: ${isSelected ? '38px' : '32px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        border: 2px solid #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isSelected ? '16px' : '13px'};
          line-height: 1;
        ">${iconEmoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Student location marker
const studentIcon = L.divIcon({
  className: 'student-gps-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        inset: 0;
        background: #10b981;
        border-radius: 50%;
        opacity: 0.3;
        animation: pulseMap 2s infinite;
      "></div>
      <div style="
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        background: #10b981;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export interface MessMapViewProps {
  messes?: MessItem[];
  selectedMessId?: string | null;
  onSelectMess?: ((id: string) => void) | null;
  height?: string;
  studentPos?: [number, number] | null;
}

export const MessMapView: React.FC<MessMapViewProps> = ({
  messes = [],
  selectedMessId = null,
  onSelectMess = null,
  height = '500px',
  studentPos = null,
}) => {
  const defaultCampusPos: [number, number] = [18.5204, 73.8402];
  const activeStudentPos: [number, number] = studentPos || defaultCampusPos;
  const [center, setCenter] = useState<LatLngExpression>(activeStudentPos);
  const [zoom, setZoom] = useState(14);

  // Sync center when student position updates and no mess is explicitly selected
  useEffect(() => {
    if (studentPos && !selectedMessId) {
      setCenter(studentPos);
      setZoom(15);
    }
  }, [studentPos, selectedMessId]);

  useEffect(() => {
    if (selectedMessId) {
      const found = messes.find((m) => m.id === selectedMessId);
      if (found && found.lat && found.lng) {
        setCenter([found.lat, found.lng]);
        setZoom(16);
      }
    }
  }, [selectedMessId, messes]);

  const handleCenterOnMe = () => {
    setCenter(activeStudentPos);
    setZoom(15);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Student Location Marker */}
        <Marker position={activeStudentPos} icon={studentIcon}>
          <Popup>
            <div style={{ padding: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                📍 {studentPos ? 'Your Current Location' : 'Your Campus Location'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {studentPos
                  ? `${activeStudentPos[0].toFixed(4)}° N, ${activeStudentPos[1].toFixed(4)}° E`
                  : 'Fergusson College & Hostels'}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Mess Markers */}
        {messes
          .filter(
            (m) =>
              typeof m.lat === 'number' &&
              typeof m.lng === 'number' &&
              !isNaN(m.lat) &&
              !isNaN(m.lng)
          )
          .map((mess) => {
            const isSelected = mess.id === selectedMessId;
            return (
              <Marker
                key={mess.id}
                position={[mess.lat, mess.lng]}
                icon={createMessIcon(mess.foodType, isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onSelectMess) onSelectMess(mess.id);
                  },
                }}
              >
                <Popup>
                  <div style={{ width: '220px', padding: '4px' }}>
                    <img
                      src={mess.heroImage}
                      alt={mess.name}
                      style={{
                        width: '100%',
                        height: '95px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '8px',
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'var(--text-main)',
                        marginBottom: '2px',
                      }}
                    >
                      {mess.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--warning)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        ★ {mess.rating}
                      </span>
                      {typeof mess.distanceKm === 'number' && !isNaN(mess.distanceKm) ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {mess.distanceKm < 1 ? `${Math.round(mess.distanceKm * 1000)} m away` : `${mess.distanceKm.toFixed(1)} km away`}
                        </span>
                      ) : mess.area ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {mess.area}
                        </span>
                      ) : null}
                    </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <FoodBadge type={mess.foodType} />
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      ₹{mess.monthlyPrice}/mo
                    </span>
                  </div>
                  <Link
                    to={`/mess/${mess.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem', textAlign: 'center' }}
                  >
                    View Menu & Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Recenter Button */}
      <button
        type="button"
        onClick={handleCenterOnMe}
        className="btn btn-sm"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-main)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Navigation size={14} color="var(--primary)" />
        My Campus Location
      </button>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Pure Veg Mess</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e11d48' }} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Veg & Non-Veg</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>You (Hostel GPS)</span>
        </div>
      </div>
    </div>
  );
};
