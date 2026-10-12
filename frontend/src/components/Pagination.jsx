import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '2rem' }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn btn-outline btn-sm"
        style={{ padding: '6px 10px', opacity: currentPage === 1 ? 0.5 : 1 }}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
            style={{ minWidth: '36px', height: '36px', padding: '0 8px', fontWeight: isActive ? 800 : 600 }}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-outline btn-sm"
        style={{ padding: '6px 10px', opacity: currentPage === totalPages ? 0.5 : 1 }}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
