import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
}

export default function StaffForm({ staff, onSubmit }) {
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Phone: '',
    Role: '',
  })
  const [customRole, setCustomRole] = useState('')
  const [showCustomRole, setShowCustomRole] = useState(false)

  useEffect(() => {
    if (staff) {
      const predefinedRoles = ['Warden', 'Assistant Warden', 'Hostel Manager', 'Caretaker', 'Security Guard', 'Receptionist', 'Cleaning Staff', 'Mess Manager', 'Cook']
      const isCustomRole = !predefinedRoles.includes(staff.Role)
      
      setFormData({
        Username: staff.Username,
        Email: staff.Email,
        Phone: staff.Phone || '',
        Role: isCustomRole ? 'Other' : staff.Role,
      })
      
      if (isCustomRole) {
        setShowCustomRole(true)
        setCustomRole(staff.Role)
      }
    }
  }, [staff])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'Role') {
      if (value === 'Other') {
        setShowCustomRole(true)
        setFormData((prev) => ({ ...prev, [name]: value }))
      } else {
        setShowCustomRole(false)
        setCustomRole('')
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      Role: formData.Role === 'Other' ? customRole : formData.Role
    }
    onSubmit(submitData)
  }

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Username */}
      <motion.div
        className="form-group"
        custom={0}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Username
        </label>
        <motion.input
          type="text"
          name="Username"
          className="form-input"
          value={formData.Username}
          onChange={handleChange}
          required
          disabled={staff ? true : false}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            background: staff ? '#f9fafb' : 'white',
          }}
          whileFocus={{
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
      </motion.div>

      {/* Email */}
      <motion.div
        className="form-group"
        custom={1}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Email
        </label>
        <motion.input
          type="email"
          name="Email"
          className="form-input"
          value={formData.Email}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
          }}
          whileFocus={{
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
      </motion.div>

      {/* Phone */}
      <motion.div
        className="form-group"
        custom={2}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Phone
        </label>
        <motion.input
          type="tel"
          name="Phone"
          className="form-input"
          value={formData.Phone}
          onChange={handleChange}
          placeholder="Enter 10-digit phone number"
          pattern="[0-9]{10}"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
          }}
          whileFocus={{
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
      </motion.div>

      {/* Role */}
      <motion.div
        className="form-group"
        custom={3}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Role
        </label>
        <motion.select
          name="Role"
          className="form-select"
          value={formData.Role}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            background: 'white',
          }}
          whileFocus={{
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        >
          <option value="">Select Role</option>
          <option value="Warden">Warden</option>
          <option value="Assistant Warden">Assistant Warden</option>
          <option value="Hostel Manager">Hostel Manager / Supervisor</option>
          <option value="Caretaker">Caretaker</option>
          <option value="Security Guard">Security Guard</option>
          <option value="Receptionist">Receptionist / Front Desk Staff</option>
          <option value="Cleaning Staff">Cleaning Staff</option>
          <option value="Mess Manager">Mess Manager</option>
          <option value="Cook">Cook / Kitchen Staff</option>
          <option value="Other">Other</option>
        </motion.select>
      </motion.div>

      {/* Custom Role Input - Shows when 'Other' is selected */}
      {showCustomRole && (
        <motion.div
          className="form-group"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Custom Role
          </label>
          <motion.input
            type="text"
            name="customRole"
            className="form-input"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="Enter custom role"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            whileFocus={{
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        custom={4}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
      >
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {staff ? '✏️ Update Staff' : '➕ Add Staff'}
        </motion.button>
      </motion.div>
    </motion.form>
  )
}
