import { apiGet, apiPost, apiPut, apiDelete, replacePathParams } from './apiHelper'
import { API_ENDPOINTS } from './apiConfig'

export const getAllStaff = async () => {
  return apiGet(API_ENDPOINTS.STAFF_GET_ALL)
}

export const getStaffById = async (id) => {
  const endpoint = replacePathParams(API_ENDPOINTS.STAFF_GET, { id })
  return apiGet(endpoint)
}

export const createStaff = async (staffData) => {
  return apiPost(API_ENDPOINTS.STAFF_CREATE, staffData)
}

export const updateStaff = async (id, staffData) => {
  const endpoint = replacePathParams(API_ENDPOINTS.STAFF_UPDATE, { id })
  return apiPut(endpoint, staffData)
}

export const deleteStaff = async (id) => {
  const endpoint = replacePathParams(API_ENDPOINTS.STAFF_DELETE, { id })
  return apiDelete(endpoint)
}
