// Student API Service
import { apiGet, apiPost, apiPut, apiDelete, replacePathParams } from './apiHelper';
import { API_ENDPOINTS } from './apiConfig';

// Get all students
export const getAllStudents = async () => {
    return apiGet(API_ENDPOINTS.TENANTS_GET_ALL);
};

// Get student by ID
export const getStudentById = async (id) => {
    const endpoint = replacePathParams(API_ENDPOINTS.TENANTS_GET, { id });
    return apiGet(endpoint);
};

// Create student
export const createStudent = async (studentData) => {
    return apiPost(API_ENDPOINTS.TENANTS_CREATE, studentData);
};

// Update student
export const updateStudent = async (id, studentData) => {
    const endpoint = replacePathParams(API_ENDPOINTS.TENANTS_UPDATE, { id });
    return apiPut(endpoint, studentData);
};

// Delete student
export const deleteStudent = async (id) => {
    const endpoint = replacePathParams(API_ENDPOINTS.TENANTS_DELETE, { id });
    return apiDelete(endpoint);
};

// Get students by status
export const getStudentsByStatus = async (status) => {
    const endpoint = replacePathParams(API_ENDPOINTS.TENANTS_BY_STATUS, { status });
    return apiGet(endpoint);
};
