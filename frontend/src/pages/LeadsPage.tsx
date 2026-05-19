import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFiltersBar } from '../components/leads/LeadFiltersBar';
import { LeadForm } from '../components/leads/LeadForm';
import { Pagination } from '../components/leads/Pagination';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { StatusBadge, SourceBadge } from '../components/ui/Badge';
import { Spinner, EmptyState } from '../components/ui/Spinner';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../store/AuthContext';
import { leadsApi } from '../api/leads';
import { Lead, LeadFilters, LeadFormData } from '../types';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const LeadsPage: React.FC = () => {
  const { isAdmin } = useAuth();

  // Filters state
  const [rawFilters, setRawFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sort: 'latest',
    search: '',
    status: '',
    source: '',
  });

  const debouncedSearch = useDebounce(rawFilters.search, 400);

  const activeFilters = useMemo<LeadFilters>(
    () => ({ ...rawFilters, search: debouncedSearch }),
    [rawFilters, debouncedSearch]
  );

  const { leads, meta, isLoading, error, refetch, deleteLead } = useLeads(activeFilters);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleFiltersChange = (partial: Partial<LeadFilters>) => {
    setRawFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setRawFilters({ page: 1, limit: 10, sort: 'latest', search: '', status: '', source: '' });
  };

  const handleCreate = async (data: LeadFormData) => {
    setFormLoading(true);
    try {
      await leadsApi.createLead(data);
      toast.success('Lead created!');
      setCreateOpen(false);
      refetch();
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editLead) return;
    setFormLoading(true);
    try {
      await leadsApi.updateLead(editLead._id, data);
      toast.success('Lead updated!');
      setEditLead(null);
      refetch();
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await leadsApi.deleteLead(deleteId);
      toast.success('Lead deleted');
      setDeleteId(null);
      refetch();
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    leadsApi.exportCSV(activeFilters);
    toast.success('Exporting CSV...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {meta ? `${meta.total} total leads` : 'Manage your leads pipeline'}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <LeadFiltersBar
            filters={rawFilters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
            onExport={handleExport}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={refetch} className="mt-3">
              Retry
            </Button>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your filters or create a new lead to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                Add your first lead
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <LeadTable
              leads={leads}
              onEdit={setEditLead}
              onDelete={(id) => setDeleteId(id)}
              onView={setViewLead}
            />
            {meta && meta.totalPages > 1 && (
              <Pagination
                meta={meta}
                onPageChange={(page) => handleFiltersChange({ page })}
              />
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            initialData={editLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditLead(null)}
            isLoading={formLoading}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details">
        {viewLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewLead.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewLead.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <StatusBadge status={viewLead.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</p>
                <SourceBadge source={viewLead.source} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {typeof viewLead.createdBy === 'object' ? viewLead.createdBy.name : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(viewLead.createdAt)}</p>
              </div>
            </div>
            {viewLead.notes && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {viewLead.notes}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => { setViewLead(null); setEditLead(viewLead); }}>
                Edit Lead
              </Button>
              <Button onClick={() => setViewLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsPage;
