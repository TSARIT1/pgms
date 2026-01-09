const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/api'

export const createTicket = async (ticketData) => {
    try {
        const formData = new FormData()
        formData.append('title', ticketData.title)
        formData.append('priority', ticketData.priority)
        formData.append('description', ticketData.description)

        if (ticketData.attachment) {
            formData.append('attachment', ticketData.attachment)
        }

        const token = localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to create ticket')
        }

        return response.json()
    } catch (error) {
        console.error('Error creating ticket:', error)
        throw error
    }
}

export const getMyTickets = async () => {
    try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to fetch tickets')
        }

        return response.json()
    } catch (error) {
        console.error('Error fetching tickets:', error)
        throw error
    }
}

export const getTicketById = async (id) => {
    try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to fetch ticket')
        }

        return response.json()
    } catch (error) {
        console.error('Error fetching ticket:', error)
        throw error
    }
}

export const uploadAttachment = async (file) => {
    try {
        const formData = new FormData()
        formData.append('file', file)

        const token = localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/tickets/upload-attachment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to upload attachment')
        }

        return response.json()
    } catch (error) {
        console.error('Error uploading attachment:', error)
        throw error
    }
}

// SuperAdmin methods

export const getAllTicketsForSuperAdmin = async () => {
    try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/tickets/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to fetch all tickets')
        }

        return response.json()
    } catch (error) {
        console.error('Error fetching all tickets:', error)
        throw error
    }
}

export const respondToTicket = async (id, ticketResponse, status) => {
    try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        formData.append('response', ticketResponse)
        formData.append('status', status)

        const response = await fetch(`${API_BASE_URL}/tickets/${id}/respond`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Failed to respond to ticket')
        }

        return response.json()
    } catch (error) {
        console.error('Error responding to ticket:', error)
        throw error
    }
}
