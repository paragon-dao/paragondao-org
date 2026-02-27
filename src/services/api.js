/**
 * API Service for ParagonDAO
 * Handles all API calls to the backend
 */

// API Base URL - configured for Cloudflare Workers
const getApiUrl = () => {
  // In production, use the deployed worker URL
  // In development, use localhost or the worker URL
  return import.meta.env.VITE_API_BASE_URL || '';
};

const API_URL = getApiUrl();

/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem('sso_token') || localStorage.getItem('paragondao_token');
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token) {
  localStorage.setItem('sso_token', token);
  localStorage.setItem('paragondao_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem('sso_token');
  localStorage.removeItem('paragondao_token');
  localStorage.removeItem('paragondao_user');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const user = localStorage.getItem('paragondao_user');
  return user ? JSON.parse(user) : null;
}

/**
 * Set current user in localStorage
 */
export function setCurrentUser(user) {
  localStorage.setItem('paragondao_user', JSON.stringify(user));
}

/**
 * API class with helper methods
 */
class ApiService {
  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    return response;
  }

  // =====================
  // AUTH ENDPOINTS
  // =====================

  /**
   * Login with Magic Link
   */
  async login(email, magicToken) {
    const response = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, magic_token: magicToken })
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      setAuthToken(data.access_token);
      setCurrentUser(data.user);
    }

    return data;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors
    }
    removeAuthToken();
  }

  /**
   * Get current user from API
   */
  async getMe() {
    const response = await this.request('/api/v1/auth/me');
    return response.json();
  }

  /**
   * Check if email is admin (public)
   */
  async checkAdminEmail(email) {
    const response = await fetch(
      `${API_URL}/api/v1/auth/check-admin-email?email=${encodeURIComponent(email)}`
    );
    return response.json();
  }

  /**
   * Check if user exists (public)
   * Returns: { exists: boolean, is_admin: boolean, has_account: boolean }
   */
  async checkUserExists(email) {
    const response = await fetch(
      `${API_URL}/api/v1/auth/check-user?email=${encodeURIComponent(email)}`
    );
    return response.json();
  }

  /**
   * Check if current user is admin
   */
  async checkAdmin() {
    const response = await this.request('/api/v1/auth/check-admin');
    return response.json();
  }

  // =====================
  // INVITE ENDPOINTS
  // =====================

  /**
   * Validate invite code (public)
   */
  async validateInvite(code, email, username) {
    const response = await fetch(`${API_URL}/api/v1/invites/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, email, username })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
    }

    return { ok: response.ok, ...data };
  }

  /**
   * Create invite code (admin)
   */
  async createInvite(data) {
    const response = await this.request('/api/v1/invites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Create bulk invite codes (admin)
   */
  async createBulkInvites(data) {
    const response = await this.request('/api/v1/invites/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * List invite codes (admin)
   */
  async listInvites(filters = {}) {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.active !== undefined) params.append('active', filters.active);

    const response = await this.request(`/api/v1/invites?${params}`);
    return response.json();
  }

  /**
   * Update invite code (admin)
   */
  async updateInvite(id, updates) {
    const response = await this.request(`/api/v1/invites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  /**
   * Delete invite code (admin)
   */
  async deleteInvite(id) {
    const response = await this.request(`/api/v1/invites/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // =====================
  // TELEMETRY ENDPOINTS (renamed to avoid ad blockers)
  // =====================

  /**
   * Get telemetry summary (admin)
   */
  async getAnalyticsSummary(days = 7) {
    const response = await this.request(`/api/v1/t/insights?days=${days}`);
    return response.json();
  }

  /**
   * Get recent telemetry events (admin)
   */
  async getAnalyticsEvents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page_path) params.append('page_path', filters.page_path);
    if (filters.event_type) params.append('event_type', filters.event_type);

    const response = await this.request(`/api/v1/t/stream?${params}`);
    return response.json();
  }
}

export const api = new ApiService();
export default api;

