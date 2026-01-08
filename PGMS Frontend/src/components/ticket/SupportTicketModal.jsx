import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPaperclip, FiRefreshCw, FiAlertCircle } from 'react-icons/fi'
import { createTicket, getMyTickets } from '../../services/ticketService'
import '../../styles/supportTicket.css'

export default function SupportTicketModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('create')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [tickets, setTickets] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    priority: 'MEDIUM',
    description: '',
    attachment: null,
  })

  useEffect(() => {
    if (isOpen && activeTab === 'myTickets') {
      fetchTickets()
    }
  }, [isOpen, activeTab])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await getMyTickets()
      if (response.status === 'success') {
        setTickets(response.data)
      }
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB')
        return
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, PDF, DOC files are allowed')
        return
      }
      setFormData({ ...formData, attachment: file })
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!formData.description.trim()) {
      setError('Please enter a description')
      return
    }

    try {
      setLoading(true)
      const response = await createTicket(formData)
      
      if (response.status === 'success') {
        setSuccess('Ticket created successfully!')
        setFormData({
          title: '',
          priority: 'MEDIUM',
          description: '',
          attachment: null,
        })
        // Clear file input
        const fileInput = document.getElementById('ticket-attachment')
        if (fileInput) fileInput.value = ''
        
        // Switch to My Tickets tab after 1.5 seconds
        setTimeout(() => {
          setActiveTab('myTickets')
          setSuccess(null)
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="ticket-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="ticket-modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="ticket-modal-close" onClick={onClose}>
            <FiX />
          </button>

          {/* Tabs */}
          <div className="ticket-tabs">
            <button
              className={`ticket-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <FiAlertCircle /> Create Ticket
            </button>
            <button
              className={`ticket-tab ${activeTab === 'myTickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('myTickets')}
            >
              <FiPaperclip /> My Tickets ({tickets.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="ticket-tab-content">
            {activeTab === 'create' ? (
              <form onSubmit={handleSubmit} className="ticket-form">
                <h2>Create Ticket</h2>

                {error && (
                  <div className="ticket-alert ticket-alert-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="ticket-alert ticket-alert-success">
                    {success}
                  </div>
                )}

                <div className="ticket-form-group">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your issue"
                    required
                  />
                </div>

                <div className="ticket-form-group">
                  <label htmlFor="priority">
                    Priority <span className="required">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="ticket-form-group">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please provide details about your issue"
                    rows={5}
                    required
                  />
                </div>

                <div className="ticket-form-group">
                  <label htmlFor="ticket-attachment">Attachment</label>
                  <div className="ticket-file-input-wrapper">
                    <input
                      type="file"
                      id="ticket-attachment"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    <label htmlFor="ticket-attachment" className="ticket-file-label">
                      <FiPaperclip /> Add File
                    </label>
                    {formData.attachment && (
                      <span className="ticket-file-name">{formData.attachment.name}</span>
                    )}
                  </div>
                  <small className="ticket-file-hint">
                    Supports: JPG, PNG, PDF, DOC (Max 5MB)
                  </small>
                </div>

                <button
                  type="submit"
                  className="ticket-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            ) : (
              <div className="my-tickets-container">
                <div className="my-tickets-header">
                  <h2>My Tickets</h2>
                  <button
                    className="ticket-refresh-btn"
                    onClick={fetchTickets}
                    disabled={loading}
                  >
                    <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="ticket-loading">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                  <div className="ticket-empty">
                    <FiAlertCircle size={48} />
                    <p>No tickets found</p>
                    <button
                      className="ticket-create-link"
                      onClick={() => setActiveTab('create')}
                    >
                      Create your first ticket
                    </button>
                  </div>
                ) : (
                  <div className="ticket-table-wrapper">
                    <table className="ticket-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>#{ticket.id}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
