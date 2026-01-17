// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Admin Endpoints
  ADMIN_REGISTER: '/admin/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_GET: '/admin/:id',
  ADMIN_UPDATE: '/admin/:id',
  ADMIN_DELETE: '/admin/:id',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_PROFILE_UPDATE: '/admin/profile',
  ADMIN_PHOTO_UPLOAD: '/admin/profile/photo',
  ADMIN_PHOTO_DELETE: '/admin/profile/photo',
  ADMIN_SEND_OTP: '/admin/send-otp',
  ADMIN_VERIFY_OTP: '/admin/verify-otp',
  ADMIN_RESET_PASSWORD: '/admin/reset-password',

  // Tenant Endpoints
  TENANTS_GET_ALL: '/tenants',
  TENANTS_GET: '/tenants/:id',
  TENANTS_CREATE: '/tenants',
  TENANTS_UPDATE: '/tenants/:id',
  TENANTS_DELETE: '/tenants/:id',
  TENANTS_BY_STATUS: '/tenants/status/:status',

  // Room Endpoints
  ROOMS_GET_ALL: '/rooms',
  ROOMS_GET: '/rooms/:id',
  ROOMS_CREATE: '/rooms',
  ROOMS_UPDATE: '/rooms/:id',
  ROOMS_DELETE: '/rooms/:id',
  ROOMS_BY_STATUS: '/rooms/status/{status}',
  ROOMS_BY_TYPE: '/rooms/type/:type',

  // Staff Endpoints
  STAFF_GET_ALL: '/staff',
  STAFF_GET: '/staff/:id',
  STAFF_CREATE: '/staff',
  STAFF_UPDATE: '/staff/:id',
  STAFF_DELETE: '/staff/:id',
  // Payment Endpoints
  PAYMENTS_GET_ALL: '/payments',
  PAYMENTS_GET: '/payments/:id',
  PAYMENTS_CREATE: '/payments',
  PAYMENTS_UPDATE: '/payments/:id',
  PAYMENTS_DELETE: '/payments/:id',
  PAYMENTS_BY_TENANT: '/payments/tenant/:tenantId',
  PAYMENTS_BY_STATUS: '/payments/status/:status',
  PAYMENTS_BY_DATE_RANGE: '/payments/date-range',
};

export default apiConfig;
