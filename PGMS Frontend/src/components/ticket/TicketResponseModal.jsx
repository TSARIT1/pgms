import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiUser, FiCalendar, FiAlertCircle, FiPaperclip } from 'react-icons/fi'
import { respondToTicket } from '../../services/ticketService'
import '../../styles/supportTicket.css'

export default function TicketResponseModal({ isOpen, onClose, ticket, onSuccess }) {
  const [response, setResponse] = useState(ticket?.response || '')
  const [status, setStatus] = useState(ticket?.status || 'OPEN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!response.trim()) {
      setError('Please enter a response')
      return
    }

    try {
      setLoading(true)
      const result = await respondToTicket(ticket.id, response, status)

      if (result.status === 'success') {
        setSuccess(true)
        // Wait 2 seconds to show success message, then close
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit response')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !ticket) return null

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
      case 'MEDIUM': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }
      case 'LOW': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const priorityColors = getPriorityColor(ticket.priority)

  return (
    <AnimatePresence>
      <motion.div
        className="ticket-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header with Gradient */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              color: 'white',
              position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <FiX />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '1rem',
                  borderRadius: '1rem',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <FiAlertCircle size={32} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                  Ticket #{ticket.id}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
                  Support Request Details
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  backgroundColor: priorityColors.bg,
                  color: priorityColors.text,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: `2px solid ${priorityColors.border}`,
                }}
              >
                {ticket.priority} PRIORITY
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiUser size={16} /> Admin ID: {ticket.adminId}
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiCalendar size={16} /> {formatDate(ticket.createdAt)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
            {/* Ticket Details Card */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  margin: '0 0 1rem 0',
                  color: '#111827',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                }}
              >
                {ticket.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ticket.description}
              </p>
              {ticket.attachmentUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <a
                    href={`/api${ticket.attachmentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#667eea',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#eef2ff',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e7ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#eef2ff'}
                  >
                    <FiPaperclip /> View Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Response Form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: '1px solid #fecaca',
                  }}
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: '1px solid #6ee7b7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Response Sent Successfully!</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Email notification has been sent to the admin.</div>
                  </div>
                </motion.div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="response"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Your Response <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={6}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="status"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Update Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="OPEN">🔵 Open</option>
                  <option value="IN_PROGRESS">🟡 In Progress</option>
                  <option value="RESOLVED">🟢 Resolved</option>
                  <option value="CLOSED">⚫ Closed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
                }}
              >
                <FiSend /> {loading ? 'Submitting...' : 'Submit Response'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
