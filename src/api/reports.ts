import { apiFetch } from '@/lib/api';

// Reports CRUD
export async function fetchReports() {
  return apiFetch('/reports');
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