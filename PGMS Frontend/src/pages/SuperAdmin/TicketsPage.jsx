import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiRefreshCw, FiMessageSquare } from 'react-icons/fi'
import { getAllTicketsForSuperAdmin } from '../../services/ticketService'
import TicketResponseModal from '../../components/ticket/TicketResponseModal'
import '../../styles/supportTicket.css'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, priorityFilter, statusFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllTicketsForSuperAdmin()
      if (response.status === 'success') {
        setTickets(response.data)
      }
    } catch (err) {
      setError('Failed to load tickets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    // Filter by priority
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    // Filter by status
    if (statusFilter === 'RESOLVED') {
      filtered = filtered.filter(ticket => ticket.status === 'RESOLVED')
    } else if (statusFilter === 'PENDING') {
      filtered = filtered.filter(ticket => 
        ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS'
      )
    }

    setFilteredTickets(filtered)
  }

  const handleRespond = (ticket) => {
    setSelectedTicket(ticket)
    setIsResponseModalOpen(true)
  }

  const handleResponseSuccess = () => {
    setIsResponseModalOpen(false)
    setSelectedTicket(null)
    fetchTickets() // Refresh tickets
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ef4444'
      case 'MEDIUM': return '#f59e0b'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#3b82f6'
      case 'IN_PROGRESS': return '#f59e0b'
      case 'RESOLVED': return '#10b981'
      case 'CLOSED': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
        }}
      >
        <h1 className="page-title" style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          Support Tickets
        </h1>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0 0 0' }}>
          Manage all support tickets from PG/Hostel admins
        </p>
      </motion.div>

      {/* Filter and Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Priority Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: priorityFilter === priority ? '#667eea' : '#f3f4f6',
                  color: priorityFilter === priority ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {priority}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderLeft: '2px solid #e5e7eb', paddingLeft: '1rem' }}>
            <button
              onClick={() => setStatusFilter('PENDING')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: statusFilter === 'PENDING' ? '#f59e0b' : '#f3f4f6',
                color: statusFilter === 'PENDING' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🟡 Pending
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: statusFilter === 'RESOLVED' ? '#10b981' : '#f3f4f6',
                color: statusFilter === 'RESOLVED' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🟢 Resolved
            </button>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Tickets Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <FiAlertCircle size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.125rem' }}>No tickets found</p>
        </div>
      ) : (
        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Admin ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.adminId}</td>
                  <td className="ticket-title-cell">{ticket.title}</td>
                  <td>
                    <span
                      className="ticket-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className="ticket-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td className="ticket-response-cell">
                    {ticket.response || 'Pending'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleRespond(ticket)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FiMessageSquare /> Respond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response Modal */}
      {selectedTicket && (
        <TicketResponseModal
          isOpen={isResponseModalOpen}
          onClose={() => {
            setIsResponseModalOpen(false)
            setSelectedTicket(null)
          }}
          ticket={selectedTicket}
          onSuccess={handleResponseSuccess}
        />
      )}
    </motion.div>
  )
}
