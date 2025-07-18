import { apiFetch } from '@/lib/api';

// Reports CRUD
export async function fetchReports(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  return apiFetch(`/reports?${queryParams.toString()}`);
}

export async function createReport(data: any) {
  return apiFetch('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReport(id: string, data: any) {
  return apiFetch(`/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id: string) {
  return apiFetch(`/reports/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchReportById(id: string) {
  return apiFetch(`/reports/${id}`);
}

// Report Templates CRUD
export async function fetchReportTemplates() {
  return apiFetch('/report-templates');
}

export async function createReportTemplate(data: any) {
  return apiFetch('/report-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReportTemplate(id: string, data: any) {
  return apiFetch(`/report-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReportTemplate(id: string) {
  return apiFetch(`/report-templates/${id}`, {
    method: 'DELETE',
  });
}