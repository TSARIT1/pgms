import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiUser, FiPhone, FiMail, FiMapPin, FiMessageSquare, FiCheck } from 'react-icons/fi'
import { getAllHostelLocations } from '../../services/locationService'
import { createAppointment } from '../../services/appointmentService'

export default function AppointmentForm({ selectedHostelId }) {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    adminId: '',
    candidateName: '',
    candidatePhone: '',
    candidateEmail: '',
    appointmentDate: '',
    message: ''
  })

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/all')
      const data = await response.json()
      if (data.status === 'success') {
        setHostels(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err)
    }
  }

  // Auto-select hostel when selectedHostelId prop changes
  useEffect(() => {
    if (selectedHostelId) {
      setFormData(prev => ({
        ...prev,
        adminId: String(selectedHostelId)
      }))
    }
  }, [selectedHostelId])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.adminId || !formData.candidateName || !formData.candidatePhone || 
        !formData.candidateEmail || !formData.appointmentDate) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await createAppointment(formData)
      
      if (response.status === 'success') {
        setSuccess(true)
        setFormData({
          adminId: '',
          candidateName: '',
          candidatePhone: '',
          candidateEmail: '',
          appointmentDate: '',
          message: ''
        })
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '1rem',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
      }}>
        <h3 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#111827',
          textAlign: 'center',
        }}>
          📅 Book an Appointment
        </h3>
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>
          Schedule a visit to your preferred PG/Hostel
        </p>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1rem',
              background: '#d1fae5',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#065f46',
            }}
          >
            <FiCheck style={{ fontSize: '1.25rem' }} />
            <span>Appointment booked successfully! We'll contact you soon.</span>
          </motion.div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PG/Hostel Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiMapPin /> Select PG/Hostel *
            </label>
            <select
              name="adminId"
              value={formData.adminId}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Choose a PG/Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.hostelName}
                </option>
              ))}
            </select>
          </div>

          {/* Candidate Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiUser /> Your Name *
            </label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiPhone /> Phone Number *
            </label>
            <input
              type="tel"
              name="candidatePhone"
              value={formData.candidatePhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiMail /> Email Address *
            </label>
            <input
              type="email"
              name="candidateEmail"
              value={formData.candidateEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Appointment Date & Time */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiCalendar /> Preferred Date & Time *
            </label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Message (Optional) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#374151',
            }}>
              <FiMessageSquare /> Additional Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific requirements or questions?"
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}
