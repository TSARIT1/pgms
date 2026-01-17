import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error: authError, setError } = useAuth()
  const [searchParams] = useSearchParams()
  
  // Get selected plan from URL parameters
  const selectedPlan = searchParams.get('plan')
  const selectedPlanId = searchParams.get('planId')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hostelType: '',
    hostelName: '',
    hostelAddress: '',
    password: '',
    confirmPassword: '',
    referredBy: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')

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
    
    if (!formData.name || !formData.email || !formData.phone || !formData.hostelType || !formData.hostelName || !formData.hostelAddress || !formData.password || !formData.confirmPassword) {
      setLocalError('All fields are required!')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters!')
      return
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setLocalError('Phone must be 10 digits!')
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        hostelType: formData.hostelType,
        hostelName: formData.hostelName,
        hostelAddress: formData.hostelAddress,
        password: formData.password,
        referredBy: formData.referredBy || null,
        planId: selectedPlanId ? parseInt(selectedPlanId) : null,
      })
      // Redirect to login page after successful registration
      navigate('/login')
    } catch (err) {
      setLocalError(err.message || 'Registration failed!')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  const imageVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.1 } },
  }

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.2 } },
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
      className="register-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Left Side - Image with Overlay */}
      <motion.div
        variants={imageVariants}
        style={{
          flex: '0.55',
          backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.75) 0%, rgba(99, 102, 241, 0.75) 100%), url(/images/rawkkim-4GZYgKafsxA-unsplash.jpg)',
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
        {/* Animated Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-30%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            animation: 'float 20s ease-in-out infinite reverse',
          }}
        />

        <motion.div
          style={{
            position: 'relative',
            zIndex: '10',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div
            style={{
              fontSize: '3.5rem',
              marginBottom: '2rem',
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            🏫
          </div>

          <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
            Join Us Today
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: '0.95', marginBottom: '1rem' }}>
            Create your account and unlock amazing features
          </p>
          <p style={{ opacity: '0.8', fontSize: '0.875rem', lineHeight: '1.6' }}>
            Manage your hostel life with ease, connect with fellow residents, and stay organized
          </p>

          <motion.div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '2.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '1rem 1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>500+</div>
              <div style={{ fontSize: '0.75rem', opacity: '0.9', marginTop: '0.25rem' }}>Active Users</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '1rem 1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>50+</div>
              <div style={{ fontSize: '0.75rem', opacity: '0.9', marginTop: '0.25rem' }}>Hostels</div>
            </div>
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
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Selected Plan Badge */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiCheck size={20} color="white" strokeWidth={3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                  Selected Plan
                </div>
                <div style={{ fontSize: '1rem', color: 'white', fontWeight: '700' }}>
                  {selectedPlan}
                </div>
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 style={{ marginBottom: '0.5rem', color: '#111827', fontSize: '1.875rem', fontWeight: '700' }}>
              Create Account
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Get started with your registration in just a few steps
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
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

            {/* Full Name */}
            <motion.div
              className="form-group"
              custom={0}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
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

            {/* Phone */}
            <motion.div
              className="form-group"
              custom={1}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter 10 digit phone number"
                value={formData.phone}
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

            {/* Email */}
            <motion.div
              className="form-group"
              custom={2}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
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

            {/* PG/Hostel Type */}
            <motion.div
              className="form-group"
              custom={3}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                PG/Hostel Type
              </label>
              <select
                name="hostelType"
                className="form-input"
                value={formData.hostelType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  cursor: 'pointer',
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
                <option value="">Select Type</option>
                <option value="Normal">Normal PG/Hostel</option>
                <option value="Co-living">Co-living PG/Hostel</option>
                <option value="Boys">Boys PG/Hostel</option>
                <option value="Girls">Girls PG/Hostel</option>
                <option value="Homestay">Homestay</option>
                <option value="Others">Others</option>
              </select>
            </motion.div>

            {/* PG/Hostel Name */}
            <motion.div
              className="form-group"
              custom={4}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                {formData.hostelType ? `${formData.hostelType} PG/Hostel Name` : 'PG/Hostel Name'}
              </label>
              <input
                type="text"
                name="hostelName"
                className="form-input"
                placeholder={formData.hostelType ? `Enter your ${formData.hostelType} name` : 'Enter your PG/Hostel name'}
                value={formData.hostelName}
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

            {/* Address of PG/Hostel */}
            <motion.div
              className="form-group"
              custom={5}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Address of PG/Hostel
              </label>
              <textarea
                name="hostelAddress"
                className="form-input"
                placeholder="Enter your PG/Hostel address"
                value={formData.hostelAddress}
                onChange={handleChange}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  resize: 'vertical',
                  minHeight: '80px',
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

            {/* Password */}
            <motion.div
              className="form-group"
              custom={6}
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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <motion.div
              className="form-group"
              custom={7}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>

            {/* Referred By (Optional) */}
            <motion.div
              className="form-group"
              custom={8}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: '1.5rem' }}
            >
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                Referred By (Optional)
              </label>
              <input
                type="text"
                name="referredBy"
                className="form-input"
                placeholder="Enter referrer name or code"
                value={formData.referredBy}
                onChange={handleChange}
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

            {/* Register Button */}
            <motion.button
              type="submit"
              disabled={loading}
              custom={9}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: !loading ? 1.02 : 1 }}
              whileTap={{ scale: !loading ? 0.98 : 1 }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '1.5rem',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </motion.form>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginTop: '1.5rem' }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
              Login here
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Responsive Mobile */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }

        @media (max-width: 768px) {
          .register-page {
            flex-direction: column;
          }
          .register-page > div {
            flex: auto !important;
            min-height: auto;
          }
        }
      `}</style>
    </motion.div>
  )
}
