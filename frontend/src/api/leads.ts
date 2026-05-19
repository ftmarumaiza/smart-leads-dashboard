import apiClient from './client';
import { ApiResponse, Lead, LeadFilters, LeadFormData, LeadStats } from '../types';

export const leadsApi = {
  getLeads: async (filters: LeadFilters): Promise<ApiResponse<Lead[]>> => {
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const res = await apiClient.get<ApiResponse<Lead[]>>('/leads', { params });
    return res.data;
  },

  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    const res = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data;
  },

  createLead: async (data: LeadFormData): Promise<ApiResponse<Lead>> => {
    const res = await apiClient.post<ApiResponse<Lead>>('/leads', data);
    return res.data;
  },

  updateLead: async (id: string, data: Partial<LeadFormData>): Promise<ApiResponse<Lead>> => {
    const res = await apiClient.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data;
  },

  deleteLead: async (id: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/leads/${id}`);
    return res.data;
  },

  exportCSV: (filters: LeadFilters): void => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const token = localStorage.getItem('token');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}/leads/export?${params.toString()}`;

    // Use fetch with auth header for file download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'leads.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  },

  getStats: async (): Promise<ApiResponse<LeadStats>> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>('/leads/stats');
    return res.data;
  },
};
