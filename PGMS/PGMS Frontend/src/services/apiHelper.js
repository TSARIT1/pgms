// Generic API Helper Functions
import apiConfig from './apiConfig';

const API_BASE_URL = apiConfig.baseURL;

// --- FIXED: Supports replacing {id}, {status}, {type}, etc. ---
export const replacePathParams = (endpoint, params) => {
  let result = endpoint;
  Object.keys(params).forEach(key => {
    // Replace both :key and {key} variants
    result = result.replace(`:${key}`, params[key]);
    result = result.replace(`{${key}}`, params[key]);
  });
  return result;
};

// Generic API caller
const apiCall = async (method, endpoint, data = null, params = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Add query params (if any)
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const options = {
      method,
      headers: {
        ...(data instanceof FormData ? {} : apiConfig.headers),
        ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
      },
    };

    // Debug logging
    const token = localStorage.getItem('token');
    console.log('API Call Debug:', {
      endpoint,
      method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
      headers: options.headers
    });

    if (data) {
      options.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      const err = new Error(errorData.message || `HTTP Error: ${response.status}`);
      // expose structured details (validation errors or full body) for callers
      err.details = errorData.errors || errorData.validationErrors || errorData;
      throw err;
    }

    // Handle empty body responses (204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// GET request
export const apiGet = (endpoint, params = {}) =>
  apiCall('GET', endpoint, null, params);

// POST request
export const apiPost = (endpoint, data, params = {}) =>
  apiCall('POST', endpoint, data, params);

// PUT request
export const apiPut = (endpoint, data, params = {}) =>
  apiCall('PUT', endpoint, data, params);

// DELETE request
export const apiDelete = (endpoint, params = {}) =>
  apiCall('DELETE', endpoint, null, params);
