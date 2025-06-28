import { apiFetch } from '@/lib/api';

export async function fetchAnalytics(period: string = '30d') {
  try {
    return await apiFetch(`/api/analytics?period=${period}`);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

export async function generateReport(templateId: string, parameters: any) {
  try {
    return await apiFetch('/api/analytics/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ templateId, parameters }),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}