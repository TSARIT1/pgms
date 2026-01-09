const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/api';

// Login Admin
export const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

// Register Admin
export const registerAdmin = async (adminData) => {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

// Get Admin Profile
export const getAdminProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/admin/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin profile');
  }

  return response.json();
};

// Update Admin Profile
export const updateAdminProfile = async (profileData) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/admin/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update admin profile');
  }

  return response.json();
};

// Upload Admin Photo
export const uploadAdminPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // Get JWT token from localStorage
  const token = localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/api'}/admin/profile/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload photo');
  }

  return response.json();
};

// Delete Admin Photo
export const deleteAdminPhoto = async () => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/api'}/admin/profile/photo`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete photo');
  }

  return response.json();
};

// Send OTP
export const sendOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/admin/send-otp?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send OTP');
  }

  return response.json();
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/admin/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to verify OTP');
  }

  return response.json();
};

// Reset Password
export const resetPassword = async (email, newPassword, otp) => {
  const response = await fetch(`${API_BASE_URL}/admin/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reset password');
  }

  return response.json();
};

// Send Login OTP
export const sendLoginOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/admin/send-login-otp?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send login OTP');
  }

  return response.json();
};

// Verify Login OTP
export const verifyLoginOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/admin/verify-login-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to verify login OTP');
  }

  return response.json();
};


// Upload Hostel Photo
export const uploadHostelPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // Get JWT token from localStorage
  const token = localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/api'}/admin/profile/hostel-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload hostel photo');
  }

  return response.json();
};

// Get all PG/Hostels for landing page (public endpoint)
export const getAllPGHostels = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch PG/Hostels');
  }

  return response.json();
};

// Freeze Admin Account (SuperAdmin only)
export const freezeAdminAccount = async (adminId) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/admin/freeze/${adminId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to freeze account');
  }

  return response.json();
};

// Unfreeze Admin Account (SuperAdmin only)
export const unfreezeAdminAccount = async (adminId) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/admin/unfreeze/${adminId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to unfreeze account');
  }

  return response.json();
};
