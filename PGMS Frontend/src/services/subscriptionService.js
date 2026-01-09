import { apiGet, apiPost, apiPut, apiDelete } from './apiHelper';

const API_URL = '/subscription-plans'; // baseURL already includes /api

export const getAllPlans = async () => {
    return await apiGet(API_URL);
};

export const getActivePlans = async () => {
    return await apiGet(`${API_URL}/active`);
};

export const getPlanById = async (id) => {
    return await apiGet(`${API_URL}/${id}`);
};

export const createPlan = async (planData) => {
    return await apiPost(API_URL, planData);
};

export const updatePlan = async (id, planData) => {
    return await apiPut(`${API_URL}/${id}`, planData);
};

export const deletePlan = async (id) => {
    return await apiDelete(`${API_URL}/${id}`);
};

export const togglePlanStatus = async (id) => {
    // PATCH is not in apiHelper, so we'll use a custom fetch
    const response = await fetch(`/api/api/subscription-plans/${id}/toggle`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error('Failed to toggle plan status');
    }

    return await response.json();
};
