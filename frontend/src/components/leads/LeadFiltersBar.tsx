import React from 'react';
import { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { STATUSES, SOURCES } from '../../utils';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFiltersChange: (filters: Partial<LeadFilters>) => void;
  onReset: () => void;
  onExport: () => void;
}

export const LeadFiltersBar: React.FC<LeadFiltersBarProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
}) => {
  const hasActiveFilters =
    !!filters.status || !!filters.source || !!filters.search;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-40">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              onFiltersChange({ status: e.target.value as LeadStatus | '', page: 1 })
            }
            placeholder="All Statuses"
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {/* Source filter */}
        <div className="w-full sm:w-40">
          <Select
            value={filters.source || ''}
            onChange={(e) =>
              onFiltersChange({ source: e.target.value as LeadSource | '', page: 1 })
            }
            placeholder="All Sources"
            options={SOURCES.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {/* Sort */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.sort || 'latest'}
            onChange={(e) =>
              onFiltersChange({ sort: e.target.value as 'latest' | 'oldest' })
            }
            options={[
              { value: 'latest', label: 'Latest First' },
              { value: 'oldest', label: 'Oldest First' },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        {hasActiveFilters ? (
          <button
            onClick={onReset}
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            Clear filters
          </button>
        ) : (
          <span />
        )}

        <Button variant="secondary" size="sm" onClick={onExport}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>
    </div>
  );
};
