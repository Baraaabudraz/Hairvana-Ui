import { apiFetch } from '@/lib/api';

// Reports CRUD
export async function fetchReports() {
  return apiFetch('/api/reports');
}

export async function createReport(data: any) {
  return apiFetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReport(id: string, data: any) {
  return apiFetch(`/api/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id: string) {
  return apiFetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchReportById(id: string) {
  return apiFetch(`/api/reports/${id}`);
}

// Report Templates CRUD
export async function fetchReportTemplates() {
  return apiFetch('/api/report-templates');
}

export async function createReportTemplate(data: any) {
  return apiFetch('/api/report-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReportTemplate(id: string, data: any) {
  return apiFetch(`/api/report-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReportTemplate(id: string) {
  return apiFetch(`/api/report-templates/${id}`, {
    method: 'DELETE',
  });
}