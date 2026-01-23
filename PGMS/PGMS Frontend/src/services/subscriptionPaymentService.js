import { apiGet, apiPost } from './apiHelper';

const API_URL = '/subscription-payment';

/**
 * Create a payment order for subscription
 */
export const createPaymentOrder = async (planData) => {
    const url = planData.isRegistration
        ? `${API_URL}/create-registration-order`
        : `${API_URL}/create-order`;
    return await apiPost(url, planData);
};

/**
 * Verify payment after successful transaction
 */
export const verifyPayment = async (paymentData) => {
    return await apiPost(`${API_URL}/verify`, paymentData);
};

/**
 * Get payment history for logged-in admin
 */
export const getPaymentHistory = async () => {
    return await apiGet(`${API_URL}/orders`);
};

/**
 * Activate a free subscription plan (price = 0) without payment
 */
export const activateFreePlan = async (planName) => {
    return await apiPost(`${API_URL}/activate-free-plan`, { planName });
};
