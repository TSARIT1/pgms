import { apiGet, apiPost, apiPut, apiDelete } from './apiHelper'

const attendanceService = {
    // Mark single attendance
    markAttendance: async (attendanceData) => {
        return await apiPost('/attendance', attendanceData)
    },

    // Mark bulk attendance
    markBulkAttendance: async (attendanceList) => {
        return await apiPost('/attendance/bulk', attendanceList)
    },

    // Get all attendance records
    getAllAttendance: async () => {
        return await apiGet('/attendance')
    },

    // Get attendance by date
    getAttendanceByDate: async (date) => {
        return await apiGet(`/attendance/date/${date}`)
    },

    // Get attendance by student
    getAttendanceByStudent: async (studentName) => {
        return await apiGet(`/attendance/student/${encodeURIComponent(studentName)}`)
    },

    // Update attendance
    updateAttendance: async (id, attendanceData) => {
        return await apiPut(`/attendance/${id}`, attendanceData)
    },

    // Delete attendance
    deleteAttendance: async (id) => {
        return await apiDelete(`/attendance/${id}`)
    },
}

export default attendanceService
