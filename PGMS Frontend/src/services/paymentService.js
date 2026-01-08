import { API_ENDPOINTS } from './apiConfig'
import { apiGet, apiPost, apiPut, apiDelete, replacePathParams } from './apiHelper'

const paymentService = {
  getAllPayments: async () => {
    const resp = await apiGet(API_ENDPOINTS.PAYMENTS_GET_ALL)
    return resp.data || []
  },

  getPaymentById: async (id) => {
    const endpoint = replacePathParams(API_ENDPOINTS.PAYMENTS_GET, { id })
    const resp = await apiGet(endpoint)
    return resp.data
  },

  createPayment: async (payload) => {
    const resp = await apiPost(API_ENDPOINTS.PAYMENTS_CREATE, payload)
    return resp && resp.data ? resp.data : resp
  },

  updatePayment: async (id, payload) => {
    const endpoint = replacePathParams(API_ENDPOINTS.PAYMENTS_UPDATE, { id })
    const resp = await apiPut(endpoint, payload)
    return resp.data
  },

  deletePayment: async (id) => {
    const endpoint = replacePathParams(API_ENDPOINTS.PAYMENTS_DELETE, { id })
    return apiDelete(endpoint)
  },

  getPaymentsByTenant: async (tenantId) => {
    const endpoint = replacePathParams(API_ENDPOINTS.PAYMENTS_BY_TENANT, { tenantId })
    const resp = await apiGet(endpoint)
    return resp.data || []
  },

  getPaymentsByStatus: async (status) => {
    const endpoint = replacePathParams(API_ENDPOINTS.PAYMENTS_BY_STATUS, { status })
    const resp = await apiGet(endpoint)
    return resp.data || []
  },

  getPaymentsByDateRange: async (startDate, endDate) => {
    const resp = await apiGet(API_ENDPOINTS.PAYMENTS_BY_DATE_RANGE, { startDate, endDate })
    return resp.data || []
  }
}

export default paymentService

