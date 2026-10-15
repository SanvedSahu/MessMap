import React, { useState, useMemo } from 'react';
import { Mess } from '../types/admin.types';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface MessManagementProps {
  messes: Mess[];
  onSelectMess: (mess: Mess) => void;
  onApproveMess: (id: string) => void;
  onRejectMess: (id: string, reason?: string) => void;
  onAddNewMess: (newMess: Mess) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const MessManagement: React.FC<MessManagementProps> = ({
  messes,
  onSelectMess,
  onApproveMess,
  onRejectMess,
  onAddNewMess,
  searchTerm,
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Confirm dialog state for Rejecting
  const [rejectingMessId, setRejectingMessId] = useState<string | null>(null);

  // Filter logic
  const filteredMesses = useMemo(() => {
    return messes.filter((m) => {
      const matchSearch =
        searchTerm === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchFood = foodTypeFilter === 'All' || m.foodType === foodTypeFilter;
      const matchArea = areaFilter === 'All' || m.area === areaFilter;

      return matchSearch && matchStatus && matchFood && matchArea;
    });
  }, [messes, searchTerm, statusFilter, foodTypeFilter, areaFilter]);

  // Unique areas for dropdown
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(messes.map((m) => m.area)));
  }, [messes]);

  // Pagination slice
  const totalPages = Math.ceil(filteredMesses.length / pageSize) || 1;
  const paginatedMesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMesses.slice(start, start + pageSize);
  }, [filteredMesses, currentPage, pageSize]);

  const handleQuickAddSample = () => {
    const newId = `MESS-${100 + messes.length + 1}`;
    const sampleMess: Mess = {
      id: newId,
      name: `Saraswati Dining Hall #${messes.length + 1}`,
      ownerName: 'Vijay Narvekar',
      ownerPhone: '+91 98223 99011',
      ownerEmail: 'vijay.saraswati@gmail.com',
      address: 'Lane 5, Near Central Library',
      area: 'North Campus',
      foodType: 'Pure Veg',
      monthlyPrice: 3100,
      dailyPrice: 115,
      rating: 4.5,
      reviewCount: 18,
      status: 'Pending',
      operatingStatus: 'Open',
      timings: { breakfast: '7:30 AM - 9:30 AM', lunch: '12:30 PM - 3:00 PM', dinner: '8:00 PM - 10:30 PM' },
      menuHighlights: ['Dal Makhani', 'Paneer Bhurji', 'Phulka', 'Jeera Rice'],
      hygieneScore: 4.4,
      registeredDate: new Date().toISOString().split('T')[0],
      description: 'Newly registered hostel mess facility with steel thalis and pure RO water system.',
      features: ['RO Water', 'Digital Payments', 'Unlimited Roti'],
      capacity: 75,
    };
    onAddNewMess(sampleMess);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Campus Mess Directory & Verification
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total {messes.length} registered facilities ({messes.filter((m) => m.status === 'Approved').length} approved, {messes.filter((m) => m.status === 'Pending').length} pending review)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.6rem' }}
              aria-label="Table View"
            >
              <List size={16} /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.6rem' }}
              aria-label="Card View"
            >
              <LayoutGrid size={16} /> Cards
            </button>
          </div>

          <button
            onClick={handleQuickAddSample}
            className="btn btn-primary"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} /> Simulate New Mess Submission
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {/* Search input */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by mess name, proprietor, area..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          {/* Food Type filter */}
          <select
            className="form-select"
            value={foodTypeFilter}
            onChange={(e) => {
              setFoodTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Food Types</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Veg & Non-Veg">Veg & Non-Veg</option>
            <option value="Jain Friendly">Jain Friendly</option>
          </select>

          {/* Area filter */}
          <select
            className="form-select"
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Campus Zones</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {(statusFilter !== 'All' || foodTypeFilter !== 'All' || areaFilter !== 'All' || searchTerm !== '') && (
          <button
            onClick={() => {
              setStatusFilter('All');
              setFoodTypeFilter('All');
              setAreaFilter('All');
              onSearchChange('');
              setCurrentPage(1);
            }}
            className="btn btn-ghost btn-sm"
            style={{ color: '#ef4444' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Mess Content: Table or Grid */}
      {paginatedMesses.length === 0 ? (
        <EmptyState
          title="No Dining Facilities Found"
          description="We couldn't find any mess matching your current filter criteria. Try adjusting your search query or reset the filters."
          actionText="Reset All Filters"
          onAction={() => {
            setStatusFilter('All');
            setFoodTypeFilter('All');
            setAreaFilter('All');
            onSearchChange('');
          }}
        />
      ) : viewMode === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mess & Proprietor</th>
                  <th>Campus Area</th>
                  <th>Food Preference</th>
                  <th>Monthly Rate</th>
                  <th>Rating / Hygiene</th>
                  <th>Verification Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMesses.map((mess) => (
                  <tr key={mess.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                          {mess.name}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Owner: <strong>{mess.ownerName}</strong> • {mess.ownerPhone}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>{mess.area}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {mess.foodType}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{mess.monthlyPrice.toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹{mess.dailyPrice}/meal</span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                          ★ {mess.rating}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          ({mess.reviewCount})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={12} /> {mess.hygieneScore}/5 Hygiene
                      </div>
                    </td>

                    <td>
                      <Badge variant={getStatusBadgeVariant(mess.status)} dot>
                        {mess.status}
                      </Badge>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onSelectMess(mess)}
                          className="btn btn-outline btn-sm"
                          title="View Full Profile"
                        >
                          <Eye size={14} /> Dossier
                        </button>

                        {mess.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApproveMess(mess.id)}
                              className="btn btn-success btn-sm"
                              title="Approve Mess Listing"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => setRejectingMessId(mess.id)}
                              className="btn btn-danger btn-sm"
                              title="Reject Mess Listing"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMesses.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* Card Grid View */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {paginatedMesses.map((mess) => (
              <div key={mess.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <Badge variant={getStatusBadgeVariant(mess.status)} dot>
                      {mess.status}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Capacity: {mess.capacity}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {mess.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <MapPin size={13} color="var(--primary)" />
                    {mess.area} • {mess.address}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', margin: '0.85rem 0', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                      {mess.foodType}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                      ★ {mess.rating} ({mess.reviewCount})
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
                      Hygiene: {mess.hygieneScore}/5
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {mess.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Monthly</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{mess.monthlyPrice}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => onSelectMess(mess)} className="btn btn-outline btn-sm">
                      Dossier
                    </button>
                    {mess.status === 'Pending' && (
                      <button onClick={() => onApproveMess(mess.id)} className="btn btn-success btn-sm">
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredMesses.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Rejecting Mess */}
      <ConfirmDialog
        isOpen={rejectingMessId !== null}
        onClose={() => setRejectingMessId(null)}
        onConfirm={(reason) => {
          if (rejectingMessId) {
            onRejectMess(rejectingMessId, reason);
            setRejectingMessId(null);
          }
        }}
        title="Reject Mess Registration"
        message="Are you sure you want to reject this mess submission? The applicant will be informed with the specific reason."
        confirmText="Confirm Rejection"
        variant="danger"
        requiresReason={true}
        reasonPlaceholder="e.g. Incomplete FSSAI certification, failed kitchen hygiene check, inaccurate meal timings..."
      />
    </div>
  );
};
