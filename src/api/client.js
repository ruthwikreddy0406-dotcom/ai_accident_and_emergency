import axios from 'axios';

const isDevPort = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000');
const API_BASE_URL = isDevPort ? 'http://127.0.0.1:8000/api' : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('roadguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  getOperators: async () => {
    const res = await apiClient.get('/auth/operators');
    return res.data;
  },

  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard
  getKPIs: async () => {
    const res = await apiClient.get('/dashboard/kpis');
    return res.data;
  },

  // Incidents
  getIncidents: async (params = {}) => {
    const res = await apiClient.get('/incidents', { params });
    return res.data;
  },
  getIncidentById: async (id) => {
    const res = await apiClient.get(`/incidents/${id}`);
    return res.data;
  },
  verifyIncident: async (id, verification_state, notes = '') => {
    const res = await apiClient.post(`/incidents/${id}/verify`, { verification_state, notes });
    return res.data;
  },
  updateIncidentStatus: async (id, workflow_status, notes = '') => {
    const res = await apiClient.patch(`/incidents/${id}/status`, { workflow_status, notes });
    return res.data;
  },
  updateIncidentSeverity: async (id, severity, reason) => {
    const res = await apiClient.post(`/incidents/${id}/severity`, { severity, reason });
    return res.data;
  },
  assignIncident: async (id, operator_id, notes = '') => {
    const res = await apiClient.post(`/incidents/${id}/assign`, { operator_id, notes });
    return res.data;
  },
  logResponseAction: async (id, action_type, notes = '', is_simulation = true) => {
    const res = await apiClient.post(`/incidents/${id}/response-actions`, { action_type, notes, is_simulation });
    return res.data;
  },

  // Videos & Ingestion
  uploadVideo: async (formData, onProgress) => {
    const res = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },
  simulateLiveFeed: async (scenarioType = 'highway_rear_end') => {
    const form = new FormData();
    form.append('scenario_type', scenarioType);
    const res = await apiClient.post('/videos/simulate-analysis', form);
    return res.data;
  },

  // Jobs
  getJobs: async () => {
    const res = await apiClient.get('/jobs');
    return res.data;
  },
  getJobById: async (jobId) => {
    const res = await apiClient.get(`/jobs/${jobId}`);
    return res.data;
  },

  // Cameras
  getCameras: async () => {
    const res = await apiClient.get('/cameras');
    return res.data;
  },
  createCamera: async (cameraData) => {
    const res = await apiClient.post('/cameras', cameraData);
    return res.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },
  getExportCsvUrl: () => `${API_BASE_URL}/analytics/export-csv`,

  // Notifications
  getNotifications: async (unreadOnly = false) => {
    const res = await apiClient.get('/notifications', { params: { unread_only: unreadOnly } });
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.post('/notifications/mark-all-read');
    return res.data;
  },

  // Static Evidence helper URL
  getEvidenceImageUrl: (filename) => {
    if (!filename) return null;
    return isDevPort
      ? `http://127.0.0.1:8000/evidence-files/${filename}`
      : `/evidence-files/${filename}`;
  }
};
