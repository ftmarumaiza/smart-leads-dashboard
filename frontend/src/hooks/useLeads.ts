import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import { leadsApi } from '../api/leads';
import toast from 'react-hot-toast';

export function useLeads(filters: LeadFilters) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leadsApi.getLeads(filters);
      if (res.success && res.data) {
        setLeads(res.data);
        setMeta(res.meta || null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const deleteLead = async (id: string) => {
    try {
      await leadsApi.deleteLead(id);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  return { leads, meta, isLoading, error, refetch: fetchLeads, deleteLead };
}
