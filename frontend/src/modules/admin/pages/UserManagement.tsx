import React, { useState, useMemo } from 'react';
import { User } from '../types/admin.types';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  GraduationCap,
  Store,
  UserPlus,
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onToggleUserStatus: (id: string, reason?: string) => void;
  onAddNewUser: (newUser: User) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onSelectUser,
  onToggleUserStatus,
  onAddNewUser,
  searchTerm,
  onSearchChange,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Confirm dialog state for Status toggles
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);

  const selectedUserForAction = useMemo(() => {
    return users.find((u) => u.id === confirmUserId);
  }, [users, confirmUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        searchTerm === '' ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleSimulateNewUser = () => {
    const newId = `USR-${200 + users.length + 1}`;
    const newUser: User = {
      id: newId,
      name: `Rahul Vaidya #${users.length + 1}`,
      email: `student.${users.length + 1}@campus.edu`,
      phone: '+91 98229 11002',
      role: 'Student',
      status: 'Active',
      college: 'PICT Pune',
      registeredDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      reviewsCount: 1,
      complaintsCount: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    onAddNewUser(newUser);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Campus User & Proprietor Directory
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor authenticated students, registered dining operators, and authorization levels
          </p>
        </div>

        <button onClick={handleSimulateNewUser} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <UserPlus size={16} /> Simulate Student Onboarding
        </button>
      </div>

      {/* Filter toolbar */}
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
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by student name, email, college..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All User Roles</option>
              <option value="Student">Student</option>
              <option value="Mess Owner">Mess Owner</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
        </div>

        {(roleFilter !== 'All' || statusFilter !== 'All' || searchTerm !== '') && (
          <button
            onClick={() => {
              setRoleFilter('All');
              setStatusFilter('All');
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

      {/* User table */}
      {paginatedUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="We couldn't find any users matching your criteria. Try adjusting the search term or role filter."
          actionText="Reset Filters"
          onAction={() => {
            setRoleFilter('All');
            setStatusFilter('All');
            onSearchChange('');
          }}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>College Affiliation</th>
                  <th>Engagement</th>
                  <th>Account Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {user.email} • {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            user.role === 'Student'
                              ? '#ecfdf5'
                              : user.role === 'Mess Owner'
                              ? '#eff6ff'
                              : '#faf5ff',
                          color:
                            user.role === 'Student'
                              ? '#065f46'
                              : user.role === 'Mess Owner'
                              ? '#1e40af'
                              : '#6b21a8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {user.role === 'Student' ? (
                          <GraduationCap size={13} />
                        ) : user.role === 'Mess Owner' ? (
                          <Store size={13} />
                        ) : (
                          <Shield size={13} />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {user.college}
                      </div>
                      {user.associatedMess && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Dining: {user.associatedMess}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        <strong>{user.reviewsCount}</strong> reviews
                      </div>
                      <div style={{ fontSize: '0.75rem', color: user.complaintsCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                        {user.complaintsCount} grievances filed
                      </div>
                    </td>

                    <td>
                      <Badge variant={getStatusBadgeVariant(user.status)} dot>
                        {user.status}
                      </Badge>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {user.lastActive}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onSelectUser(user)}
                          className="btn btn-outline btn-sm"
                          title="View Profile Details"
                        >
                          <Eye size={14} /> Dossier
                        </button>

                        <button
                          onClick={() => setConfirmUserId(user.id)}
                          className={`btn btn-sm ${user.status === 'Active' ? 'btn-ghost' : 'btn-success'}`}
                          style={{ color: user.status === 'Active' ? '#ef4444' : '#ffffff' }}
                          title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {user.status === 'Active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
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
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Status Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmUserId !== null}
        onClose={() => setConfirmUserId(null)}
        onConfirm={(reason) => {
          if (confirmUserId) {
            onToggleUserStatus(confirmUserId, reason);
            setConfirmUserId(null);
          }
        }}
        title={selectedUserForAction?.status === 'Active' ? 'Suspend User Access' : 'Reactivate User Account'}
        message={
          selectedUserForAction?.status === 'Active'
            ? `Are you sure you want to suspend ${selectedUserForAction?.name}? They will lose access to reviewing, rating, and managing listings.`
            : `Are you sure you want to restore active privileges for ${selectedUserForAction?.name}?`
        }
        confirmText={selectedUserForAction?.status === 'Active' ? 'Confirm Suspension' : 'Reactivate Account'}
        variant={selectedUserForAction?.status === 'Active' ? 'danger' : 'success'}
        requiresReason={selectedUserForAction?.status === 'Active'}
        reasonPlaceholder="e.g. Repeated spam ratings, terms of service breach, student misconduct report..."
      />
    </div>
  );
};
