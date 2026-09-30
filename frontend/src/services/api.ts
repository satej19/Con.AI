import type { ApiResponse } from '../types';

const API_BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({
        success: response.ok,
        message: response.statusText,
      }));

      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
      }

      // Normalize response: if it has a 'data' field, use that as the main data
      // This handles both direct responses and ApiResponse wrapped responses
      if (data.data !== undefined) {
        return data;
      }

      return data;
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
