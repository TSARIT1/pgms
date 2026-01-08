import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiEdit2, FiSave, FiX, FiCamera, FiLogOut, FiMail, FiPhone, FiCalendar, FiShield, FiLock, FiKey, FiMapPin } from 'react-icons/fi'
import { getAdminProfile, updateAdminProfile, uploadAdminPhoto, deleteAdminPhoto, sendOtp, verifyOtp, resetPassword } from '../../services/adminService'
import '../../styles/adminProfile.css'

export default function AdminProfileDropdown({ onLogout, placement = 'navbar' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hostelName: '',
    hostelAddress: ''
  })

  useEffect(() => {
    if (isOpen && !adminData) {
      fetchAdminProfile()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsEditMode(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setLoading(true)
      const response = await getAdminProfile()
      if (response.status === 'success') {
        setAdminData(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          hostelName: response.data.hostelName || '',
          hostelAddress: response.data.hostelAddress || ''
        })
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      try {
        setLoading(true)
        const response = await uploadAdminPhoto(file)
        if (response.status === 'success') {
          // Update admin data with new photo URL
          setAdminData({ ...adminData, photoUrl: response.photoUrl })
          setPhotoPreview(null)
        }
      } catch (err) {
        setError('Failed to upload photo')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        hostelName: formData.hostelName,
        hostelAddress: formData.hostelAddress
      }

      // Only include email if it has changed
      if (formData.email !== adminData.email) {
        updateData.email = formData.email
      }

      const response = await updateAdminProfile(updateData)
      if (response.status === 'success') {
        setAdminData(response.data)
        setIsEditMode(false)
      }
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setFormData({
      name: adminData.name || '',
      email: adminData.email || '',
      phone: adminData.phone || '',
      hostelName: adminData.hostelName || '',
      hostelAddress: adminData.hostelAddress || ''
    })
    setError(null)
  }

  const handleResetPassword = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sendOtp(adminData.email)
      if (response.status === 'success') {
        setOtpSent(true)
        setShowOtpModal(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await verifyOtp(adminData.email, otp)
      if (response.status === 'success' && response.verified) {
        setOtpVerified(true)
        setShowOtpModal(false)
        setShowNewPasswordModal(true)
      } else {
        setError('Invalid or expired OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await resetPassword(adminData.email, newPassword, otp)
      if (response.status === 'success') {
        setShowNewPasswordModal(false)
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setOtpSent(false)
        setOtpVerified(false)
        alert('Password reset successfully!')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const getPhotoUrl = () => {
    if (photoPreview) return photoPreview
    if (adminData?.photoUrl) {
      return `http://localhost:8080${adminData.photoUrl}`
    }
    return '/images/default-avatar.png'
  }

  return (
    <div className={`admin-profile-container ${placement === 'sidebar' ? 'sidebar-container-mode' : ''}`} ref={dropdownRef}>
      <motion.div
        className={`admin-profile-trigger ${placement === 'sidebar' ? 'sidebar-mode' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="admin-avatar">
          <img src={getPhotoUrl()} alt="Admin" />
        </div>
        <span className="admin-name">{adminData?.name || 'Admin'}</span>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`admin-profile-dropdown ${placement === 'sidebar' ? 'sidebar-pos' : ''}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {loading && <div className="profile-loading">Loading...</div>}
            
            {error && (
              <div className="profile-error">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {adminData && (
              <>
                <div className="profile-header">
                  <div className="profile-photo-wrapper">
                    <img 
                      src={getPhotoUrl()} 
                      alt="Admin" 
                      className="profile-photo" 
                      onClick={() => setIsPhotoModalOpen(true)}
                      style={{ cursor: 'pointer' }}
                    />
                    {isEditMode && (
                      <button
                        className="photo-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FiCamera />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div className="profile-header-info">
                    {isEditMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="profile-input"
                        placeholder="Name"
                      />
                    ) : (
                      <h3>{adminData.name}</h3>
                    )}
                    <p className="profile-email">{adminData.email}</p>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="profile-detail-item">
                    <FiMail className="detail-icon" />
                    <div className="detail-content">
                      <label>Email</label>
                      {isEditMode ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Email"
                        />
                      ) : (
                        <span>{adminData.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <FiPhone className="detail-icon" />
                    <div className="detail-content">
                      <label>Phone</label>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Phone"
                        />
                      ) : (
                        <span>{adminData.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <FiMapPin className="detail-icon" />
                    <div className="detail-content">
                      <label>PG/Hostel Name</label>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="hostelName"
                          value={formData.hostelName}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Enter PG/Hostel name"
                        />
                      ) : (
                        <span>{adminData.hostelName || 'Not specified'}</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <FiMapPin className="detail-icon" />
                    <div className="detail-content">
                      <label>Address of PG/Hostel</label>
                      {isEditMode ? (
                        <textarea
                          name="hostelAddress"
                          value={formData.hostelAddress}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Enter PG/Hostel address"
                          rows={3}
                          style={{
                            width: '100%',
                            resize: 'vertical',
                            minHeight: '60px',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <span>{adminData.hostelAddress || 'Not specified'}</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <FiShield className="detail-icon" />
                    <div className="detail-content">
                      <label>Type</label>
                      <span>Admin</span>
                    </div>
                  </div>

                  {!isEditMode && (
                    <div className="profile-detail-item">
                      <FiLock className="detail-icon" />
                      <div className="detail-content">
                        <label>Password</label>
                        <button
                          className="reset-password-btn"
                          onClick={handleResetPassword}
                          disabled={loading}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <FiKey /> Reset Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-actions">
                  {isEditMode ? (
                    <>
                      <button
                        className="profile-btn save-btn"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <FiSave /> Save Changes
                      </button>
                      <button
                        className="profile-btn cancel-btn"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <FiX /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="profile-btn edit-btn"
                        onClick={() => setIsEditMode(true)}
                      >
                        <FiEdit2 /> Edit Profile
                      </button>
                      <button
                        className="profile-btn logout-btn"
                        onClick={onLogout}
                      >
                        <FiLogOut /> Logout
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Enlarge Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <motion.div
            className="photo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPhotoModalOpen(false)}
          >
            <motion.div
              className="photo-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="photo-modal-close"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                <FiX />
              </button>
              <img src={getPhotoUrl()} alt="Admin Profile" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            className="photo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowOtpModal(false)
              setOtp('')
            }}
          >
            <motion.div
              className="photo-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px', padding: '2rem' }}
            >
              <button 
                className="photo-modal-close"
                onClick={() => {
                  setShowOtpModal(false)
                  setOtp('')
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiMail style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Verify OTP</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  We've sent a 6-digit code to {adminData?.email}
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    marginBottom: '1rem'
                  }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: otp.length === 6 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  OTP expires in 10 minutes
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Password Modal */}
      <AnimatePresence>
        {showNewPasswordModal && (
          <motion.div
            className="photo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowNewPasswordModal(false)
              setNewPassword('')
              setConfirmPassword('')
            }}
          >
            <motion.div
              className="photo-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px', padding: '2rem' }}
            >
              <button 
                className="photo-modal-close"
                onClick={() => {
                  setShowNewPasswordModal(false)
                  setNewPassword('')
                  setConfirmPassword('')
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiLock style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Set New Password</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Enter your new password
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                <button
                  onClick={handleSubmitNewPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: newPassword && confirmPassword ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: newPassword && confirmPassword ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
