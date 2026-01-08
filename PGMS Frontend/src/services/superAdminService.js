import { API_BASE_URL } from './apiConfig'

// Get dashboard statistics
export const getDashboardStats = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/superadmin/dashboard/stats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
    }

    return response.json()
}

// Get all PG/Hostels
export const getAllPGHostels = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/superadmin/pg-hostels`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch PG/Hostels')
    }

    return response.json()
}

// Get total students
export const getTotalStudents = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/superadmin/students/total`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch total students')
    }

    return response.json()
}

// Get subscription statistics
export const getSubscriptionStats = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/superadmin/subscriptions/stats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch subscription stats')
    }

    return response.json()
}

// Delete Admin/PG Hostel Account
export const deleteAdmin = async (adminId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/superadmin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to delete admin account')
    }

    return response.json()
}
