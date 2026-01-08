import { apiGet, apiPost, apiPut } from './apiHelper'

const APPOINTMENTS_BASE_URL = '/appointments'

export const createAppointment = async (appointmentData) => {
    return await apiPost(APPOINTMENTS_BASE_URL, appointmentData)
}

export const getAllAppointments = async () => {
    return await apiGet(APPOINTMENTS_BASE_URL)
}

export const getAppointmentById = async (id) => {
    return await apiGet(`${APPOINTMENTS_BASE_URL}/${id}`)
}

export const updateAppointmentStatus = async (id, status) => {
    return await apiPut(`${APPOINTMENTS_BASE_URL}/${id}/status`, { status })
}
