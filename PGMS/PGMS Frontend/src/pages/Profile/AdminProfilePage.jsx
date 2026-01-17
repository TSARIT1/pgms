import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiEdit2, FiSave, FiX, FiCamera, FiLogOut, FiMail, FiPhone, FiCalendar, FiShield, FiLock, FiKey, FiMapPin, FiImage, FiTrash2, FiLink, FiHome } from 'react-icons/fi'
import { getAdminProfile, updateAdminProfile, uploadAdminPhoto, uploadHostelPhoto, deleteAdminPhoto, sendOtp, verifyOtp, resetPassword } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import SubscriptionModal from '../../components/subscription/SubscriptionModal'
import SupportTicketModal from '../../components/ticket/SupportTicketModal'
import '../../styles/adminProfile.css'
import '../../styles/uploadFields.css'


export default function AdminProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { role } = useAuth()
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
  const [hostelPhotos, setHostelPhotos] = useState([])
  const fileInputRef = useRef(null)
  const hostelPhotoInputRef = useRef(null)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hostelName: '',
    hostelAddress: '',
    locationLink: '',
    hostelType: ''
  })

  // Redirect SuperAdmin to their dashboard
  useEffect(() => {
    if (role === 'SUPERADMIN') {
      navigate('/superadmin/dashboard')
    }
  }, [role, navigate])

  useEffect(() => {
    // Only fetch profile if not SuperAdmin
    if (role && role !== 'SUPERADMIN') {
      fetchAdminProfile()
    }
  }, [role])

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
          hostelAddress: response.data.hostelAddress || '',
          locationLink: response.data.locationLink || '',
          hostelType: response.data.hostelType || ''
        })
        // Parse hostel photos if they exist
        if (response.data.hostelPhotos) {
          try {
            const photos = JSON.parse(response.data.hostelPhotos)
            setHostelPhotos(Array.isArray(photos) ? photos : [])
          } catch (e) {
            setHostelPhotos([])
          }
        }
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
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      try {
        setLoading(true)
        const response = await uploadAdminPhoto(file)
        if (response.status === 'success') {
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

  const handleHostelPhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    if (hostelPhotos.length >= 4) {
      setError('Maximum 4 photos allowed')
      return
    }

    try {
      setLoading(true)
      const response = await uploadHostelPhoto(file)
      if (response.status === 'success' && response.photoUrl) {
        const newPhotos = [...hostelPhotos, response.photoUrl]
        setHostelPhotos(newPhotos)
        // Update admin data
        setAdminData({ ...adminData, hostelPhotos: JSON.stringify(newPhotos) })
      }
    } catch (err) {
      setError('Failed to upload hostel photo')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHostelPhoto = (index) => {
    const newPhotos = hostelPhotos.filter((_, i) => i !== index)
    setHostelPhotos(newPhotos)
    setAdminData({ ...adminData, hostelPhotos: JSON.stringify(newPhotos) })
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        hostelName: formData.hostelName,
        hostelAddress: formData.hostelAddress,
        locationLink: formData.locationLink,
        hostelType: formData.hostelType,
        hostelPhotos: JSON.stringify(hostelPhotos)
      }

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
      hostelAddress: adminData.hostelAddress || '',
      locationLink: adminData.locationLink || '',
      hostelType: adminData.hostelType || ''
    })
    // Reset hostel photos
    if (adminData.hostelPhotos) {
      try {
        const photos = JSON.parse(adminData.hostelPhotos)
        setHostelPhotos(Array.isArray(photos) ? photos : [])
      } catch (e) {
        setHostelPhotos([])
      }
    }
    setError(null)
  }

  const handleSelectPlan = async (plan) => {
    try {
      setLoading(true)
      setError(null)
      const now = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const updateData = {
        subscriptionPlan: plan,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
      }

      const response = await updateAdminProfile(updateData)
      if (response.status === 'success') {
        setAdminData(response.data)
        setIsSubscriptionModalOpen(false)
        
        // Show success message
        const successMsg = document.createElement('div')
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          z-index: 10000;
          font-weight: 600;
          animation: slideIn 0.3s ease-out;
        `
        successMsg.textContent = `✓ Subscription plan changed to ${plan} successfully!`
        document.body.appendChild(successMsg)
        
        setTimeout(() => {
          successMsg.style.animation = 'slideOut 0.3s ease-in'
          setTimeout(() => successMsg.remove(), 300)
        }, 3000)
      }
    } catch (err) {
      setError('Failed to update subscription plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
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

  if (loading && !adminData) {
    return <div className="page-container flex-center">Loading...</div>
  }

  return (
    <motion.div 
      className="page-container admin-profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Modern Header with Gradient */}
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 className="page-title" style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: '700' }}>{t('profile.adminProfile')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0 0 0' }}>{t('profile.profileSubtitle')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiUser />
        </div>
      </motion.div>

      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {error && (
          <div className="profile-error">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {adminData && (
          <>
            <div className="profile-header">
              <div className="profile-photo-wrapper" style={{ position: 'relative' }}>
                <img 
                  src={getPhotoUrl()} 
                  alt="Admin" 
                  className="profile-photo" 
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Camera button overlay for uploading profile photo */}
                <button
                  className="profile-photo-upload-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="Upload Profile Photo"
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <FiCamera />
                </button>
                {/* Hidden file input for profile photo */}
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
                    placeholder={t('profile.name')}
                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                  />
                ) : (
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{adminData.name}</span>
                    <span className="admin-id-badge">
                      ID: {adminData.id}
                    </span>
                  </h3>
                )}
                <p className="profile-email">{adminData.email}</p>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <FiMail className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.email')}</label>
                  {isEditMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder={t('profile.email')}
                    />
                  ) : (
                    <span>{adminData.email}</span>
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <FiPhone className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.phone')}</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder={t('profile.phone')}
                    />
                  ) : (
                    <span>{adminData.phone}</span>
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <FiMapPin className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.pgHostelName')}</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="hostelName"
                      value={formData.hostelName}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder={t('profile.enterPGHostelName')}
                    />
                  ) : (
                    <span>{adminData.hostelName || t('profile.notSpecified')}</span>
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <FiHome className="detail-icon" />
                <div className="detail-content">
                  <label>PG/Hostel Type</label>
                  {isEditMode ? (
                    <select
                      name="hostelType"
                      value={formData.hostelType}
                      onChange={handleInputChange}
                      className="profile-input"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select Type</option>
                      <option value="Normal">Normal PG/Hostel</option>
                      <option value="Co-living">Co-living PG/Hostel</option>
                      <option value="Boys">Boys PG/Hostel</option>
                      <option value="Girls">Girls PG/Hostel</option>
                      <option value="Homestay">Homestay</option>
                      <option value="Others">Others</option>
                    </select>
                  ) : (
                    <span>{adminData.hostelType || 'Not Specified'}</span>
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <FiShield className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.type')}</label>
                  <span>User</span>
                </div>
              </div>

              <div className="profile-detail-item full-width">
                <FiMapPin className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.addressOfPGHostel')}</label>
                  {isEditMode ? (
                    <textarea
                      name="hostelAddress"
                      value={formData.hostelAddress}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder={t('profile.enterPGHostelAddress')}
                      rows={3}
                    />
                  ) : (
                    <span>{adminData.hostelAddress || t('profile.notSpecified')}</span>
                  )}
                </div>
              </div>

              <div className="profile-detail-item full-width">
                <FiLink className="detail-icon" />
                <div className="detail-content">
                  <label>{t('profile.locationLink')}</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="locationLink"
                      value={formData.locationLink}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder={t('profile.enterLocationLink')}
                    />
                  ) : (
                    adminData.locationLink ? (
                      <a 
                        href={adminData.locationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'underline' }}
                      >
                        {t('profile.viewOnMap')}
                      </a>
                    ) : (
                      <span>{t('profile.notSpecified')}</span>
                    )
                  )}
                </div>
              </div>

              {/* Subscription Plan Section */}
              {!isEditMode && (
                <div className="profile-detail-item full-width">
                  <FiShield className="detail-icon" />
                  <div className="detail-content">
                    <label>{t('profile.subscriptionPlan')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: adminData.subscriptionPlan === 'ENTERPRISE' ? '#8b5cf6' : 
                                       adminData.subscriptionPlan === 'PREMIUM' ? '#3b82f6' : '#6b7280',
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                      }}>
                        {adminData.subscriptionPlan || 'BASIC'}
                      </span>
                      <button
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        {t('profile.subscriptionPlan')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Ticket Section */}
              {!isEditMode && (
                <div className="profile-detail-item full-width">
                  <FiMail className="detail-icon" />
                  <div className="detail-content">
                    <label>{t('profile.supportAndHelp')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {t('profile.raiseTicketHelp')}
                      </span>
                      <button
                        onClick={() => setIsTicketModalOpen(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FiMail /> {t('profile.raiseTicket')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isEditMode && (
                <div className="profile-detail-item">
                  <FiLock className="detail-icon" />
                  <div className="detail-content">
                    <label>{t('auth.password')}</label>
                    <button
                      className="reset-password-btn"
                      onClick={handleResetPassword}
                      disabled={loading}
                      style={{ maxWidth: '200px', width: 'fit-content' }}
                    >
                      <FiKey /> {t('profile.resetPassword')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hostel Photos Gallery - Show uploaded photos */}
            {(hostelPhotos.length > 0 || isEditMode) && (
              <div className="hostel-photos-section">
                <div className="section-header">
                  <FiImage className="section-icon" />
                  <h3>{t('profile.pgHostelPhotos')}</h3>
                  <span className="photo-count">{hostelPhotos.length}/4</span>
                </div>
                
                <div className="hostel-photos-grid">
                  {hostelPhotos.map((photo, index) => (
                    <div key={index} className="hostel-photo-item">
                      <img src={`http://localhost:8080${photo}`} alt={`Hostel ${index + 1}`} />
                      {isEditMode && (
                        <button
                          className="delete-photo-btn"
                          onClick={() => handleDeleteHostelPhoto(index)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Photo Button in Edit Mode */}
                  {isEditMode && hostelPhotos.length < 4 && (
                    <div 
                      className="hostel-photo-item add-photo-placeholder"
                      onClick={() => hostelPhotoInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#667eea',
                        gap: '0.5rem'
                      }}>
                        <FiCamera style={{ fontSize: '2rem' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{t('profile.addPhoto')}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Hidden file input for hostel photos */}
                <input
                  ref={hostelPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHostelPhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            <div className="profile-actions-footer">
              {isEditMode ? (
                <>
                  <button
                    className="profile-btn save-btn"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    <FiSave /> {t('profile.saveChanges')}
                  </button>
                  <button
                    className="profile-btn cancel-btn"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    <FiX /> {t('common.cancel')}
                  </button>
                </>
              ) : (
                <button
                  className="profile-btn edit-btn"
                  onClick={() => setIsEditMode(true)}
                >
                  <FiEdit2 /> {t('profile.editProfile')}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>

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
              className="photo-modal-content otp-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
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
                <h3 style={{ marginBottom: '0.5rem' }}>{t('profile.verifyOTP')}</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  {t('profile.weSentCode', { email: adminData?.email })}
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('profile.enterOTP')}
                  maxLength="6"
                  className="otp-input"
                />
                {error && <p className="error-text">{error}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className={`submit-btn ${otp.length === 6 ? 'active' : ''}`}
                >
                  {loading ? t('profile.verifying') : t('profile.verifyOTP')}
                </button>
                <p className="otp-expiry">
                  OTP expires in 10 minutes
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Password Modal */}
      {showNewPasswordModal && (
        <AnimatePresence>
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
              className="photo-modal-content password-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
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
                  className="password-input"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="password-input"
                />
                {error && <p className="error-text">{error}</p>}
                <button
                  onClick={handleSubmitNewPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className={`submit-btn ${newPassword && confirmPassword ? 'active' : ''}`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={adminData?.subscriptionPlan || 'BASIC'}
        onSelectPlan={handleSelectPlan}
        adminData={adminData}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </motion.div>
  )
}
