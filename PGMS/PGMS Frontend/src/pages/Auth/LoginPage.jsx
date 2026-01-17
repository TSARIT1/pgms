import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiEye, FiEyeOff, FiMail, FiX, FiLock } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { sendOtp, verifyOtp, resetPassword, sendLoginOtp, verifyLoginOtp } from '../../services/adminService'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error: authError, setError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  
  // Forgot Password States
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  
  // Admin Login States
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)
  
  // Admin Login OTP States
  const [showAdminOtpModal, setShowAdminOtpModal] = useState(false)
  const [adminLoginOtp, setAdminLoginOtp] = useState('')
  const [adminOtpError, setAdminOtpError] = useState('')
  const [adminOtpLoading, setAdminOtpLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    
    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required!')
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      // Redirect based on role
      if (result.role === 'SUPER_ADMIN') {
        navigate('/superadmin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed!')
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true)
    setResetError('')
  }

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      setResetError('Please enter your email')
      return
    }
    
    try {
      setResetLoading(true)
      setResetError('')
      const response = await sendOtp(forgotEmail)
      if (response.status === 'success') {
        setShowForgotPasswordModal(false)
        setShowOtpModal(true)
      }
    } catch (err) {
      setResetError(err.message || 'Failed to send OTP')
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    try {
      setResetLoading(true)
      setResetError('')
      const response = await verifyOtp(forgotEmail, otp)
      if (response.status === 'success' && response.verified) {
        setShowOtpModal(false)
        setShowNewPasswordModal(true)
      } else {
        setResetError('Invalid or expired OTP')
      }
    } catch (err) {
      setResetError(err.message || 'Failed to verify OTP')
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmitNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters')
      return
    }

    try {
      setResetLoading(true)
      setResetError('')
      const response = await resetPassword(forgotEmail, newPassword, otp)
      if (response.status === 'success') {
        setShowNewPasswordModal(false)
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setForgotEmail('')
        alert('Password reset successfully! Please login with your new password.')
      }
    } catch (err) {
      setResetError(err.message || 'Failed to reset password')
    } finally {
      setResetLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    setAdminLoginError('')
    
    // Validate email field
    if (!adminEmail) {
      setAdminLoginError('Email is required')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(adminEmail)) {
      setAdminLoginError('Please enter a valid email address')
      return
    }
    
    try {
      setAdminLoginLoading(true)
      // Send OTP directly to the email
      const otpResponse = await sendLoginOtp(adminEmail)
      if (otpResponse.status === 'success') {
        setShowAdminLoginModal(false)
        setShowAdminOtpModal(true)
      }
    } catch (err) {
      setAdminLoginError(err.message || 'Failed to send OTP. Please check your email.')
    } finally {
      setAdminLoginLoading(false)
    }
  }

  const handleVerifyAdminOtp = async () => {
    if (!adminLoginOtp || adminLoginOtp.length !== 6) {
      setAdminOtpError('Please enter a valid 6-digit OTP')
      return
    }

    try {
      setAdminOtpLoading(true)
      setAdminOtpError('')
      
      const response = await verifyLoginOtp(adminEmail, adminLoginOtp)
      
      
      if (response.status === 'success' && response.verified) {
        // Store token and user data
        localStorage.setItem('token', response.token)
        localStorage.setItem('admin', JSON.stringify(response.data))
        localStorage.setItem('role', response.role)
        
        // Close modal first
        setShowAdminOtpModal(false)
        setAdminLoginOtp('')
        
        // Use window.location.href instead of navigate() to force page reload
        // This ensures AuthContext re-reads from localStorage
        if (response.role === 'SUPER_ADMIN') {
          window.location.href = '/superadmin'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setAdminOtpError('Invalid or expired OTP')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setAdminOtpError(err.message || 'Failed to verify OTP')
    } finally {
      setAdminOtpLoading(false)
    }
  }


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, delay: 0.2 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, delay: 0.2 },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.3 + i * 0.1 },
    }),
  }

  return (
    <motion.div
      className="login-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f9fafb',
        position: 'relative',
      }}
    >

      <motion.div
        variants={imageVariants}
        style={{
          flex: '0.55',
          backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(99, 102, 241, 0.7) 100%), url(/images/luis-desiro-qeMalFWKobM-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
            zIndex: 1,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
            Welcome Back!
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.95, maxWidth: '400px', lineHeight: 1.6 }}>
            Log in to your account to access your PG/Hostel management dashboard, track payments, and stay connected with the community.
          </p>

          <motion.div
            style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {[
              { label: 'Students', value: '500+' },
              { label: 'Rooms', value: '150+' },
              { label: 'Staff', value: '50+' },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        variants={formVariants}
        style={{
          flex: '0.45',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'white',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginBottom: '2rem' }}
          >
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
              Login
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Access your Hostel account
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Error Message */}
            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                {localError || authError}
              </motion.div>
            )}

            {/* Email Input */}
            <motion.div
              className="form-group"
              custom={0}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Email Address/Phone Number
              </label>
              <input
                type="text"
                name="email"
                className="form-input"
                placeholder="Enter your email address or phone number"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
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

            {/* Password Input */}
            <motion.div
              className="form-group"
              custom={1}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '1.125rem',
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              custom={2}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
                <span style={{ color: '#6b7280' }}>Remember me</span>
              </label>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  handleForgotPassword()
                }}
                style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
              >
                Forgot password?
              </a>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              custom={3}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: !loading ? 1.02 : 1 }}
              whileTap={{ scale: !loading ? 0.98 : 1 }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2563eb'
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = loading ? '#9ca3af' : '#3b82f6'
                e.target.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Logging in...' : <>Login <FiArrowRight style={{ fontSize: '1.125rem' }} /></>}
            </motion.button>
          </motion.form>

          
          {/* Sign Up Link */}
          <motion.p
            custom={6}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.9rem',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#3b82f6',
                fontWeight: '600',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none'
              }}
            >
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Forgot Password Modals */}
      <AnimatePresence>
        {/* Email Input Modal */}
        {showForgotPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowForgotPasswordModal(false)
              setForgotEmail('')
              setResetError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false)
                  setForgotEmail('')
                  setResetError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiMail style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Forgot Password?</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Enter your email address and we'll send you an OTP to reset your password
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                />
                {resetError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{resetError}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={resetLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: resetLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowOtpModal(false)
              setOtp('')
              setResetError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowOtpModal(false)
                  setOtp('')
                  setResetError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiMail style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Verify OTP</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  We've sent a 6-digit code to {forgotEmail}
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    margin: '1rem 0',
                  }}
                />
                {resetError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{resetError}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={resetLoading || otp.length !== 6}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: (resetLoading || otp.length !== 6) ? 'rgba(102, 126, 234, 0.3)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: (resetLoading || otp.length !== 6) ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (resetLoading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  {resetLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  OTP expires in 10 minutes
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* New Password Modal */}
        {showNewPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowNewPasswordModal(false)
              setNewPassword('')
              setConfirmPassword('')
              setResetError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowNewPasswordModal(false)
                  setNewPassword('')
                  setConfirmPassword('')
                  setResetError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiLock style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Set New Password</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Enter your new password below
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                />
                {resetError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{resetError}</p>}
                <button
                  onClick={handleSubmitNewPassword}
                  disabled={resetLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: resetLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Admin Login Modal */}
        {showAdminLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAdminLoginModal(false)
              setAdminEmail('')
              setAdminLoginError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowAdminLoginModal(false)
                  setAdminEmail('')
                  setAdminLoginError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>SuperAdmin Login</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Enter your SuperAdmin credentials to access the system
                </p>
                
                {/* Email Field */}
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email Address"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                />
                
                {adminLoginError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{adminLoginError}</p>}
                
                <button
                  onClick={handleAdminLogin}
                  disabled={adminLoginLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: adminLoginLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adminLoginLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {adminLoginLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login OTP Verification Modal */}
      <AnimatePresence>
        {showAdminOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAdminOtpModal(false)
              setAdminLoginOtp('')
              setAdminOtpError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowAdminOtpModal(false)
                  setAdminLoginOtp('')
                  setAdminOtpError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiLock style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Verify OTP</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  We've sent a 6-digit code to {adminEmail}
                </p>
                <input
                  type="text"
                  value={adminLoginOtp}
                  onChange={(e) => setAdminLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    margin: '1rem 0',
                  }}
                />
                {adminOtpError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{adminOtpError}</p>}
                <button
                  onClick={handleVerifyAdminOtp}
                  disabled={adminOtpLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: adminOtpLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adminOtpLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '0.75rem',
                  }}
                >
                  {adminOtpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await sendLoginOtp(adminEmail)
                      setAdminOtpError('')
                      alert('OTP resent successfully!')
                    } catch (err) {
                      setAdminOtpError(err.message || 'Failed to resend OTP')
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .login-page {
            flex-direction: column;
          }
          .login-page > div {
            flex: 1 !important;
            min-height: 50vh;
          }
        }
      `}</style>
    </motion.div>
  )
}
