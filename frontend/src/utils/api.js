const BASE_URL = import.meta.env.VITE_API_URL || 'https://carbon-footprint-dl81.onrender.com/api';

/**
 * Custom request wrapper to talk to the EcoLens Express Backend
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('ecolens_token');
  
  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type header if sending FormData (Multer OCR uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
  },
  post(endpoint, body) {
    return apiRequest(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  put(endpoint, body) {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  delete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
  }
};
