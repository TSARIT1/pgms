import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLogOut, FiClock } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../common/LanguageSelector'


export default function AdminNavbar() {
  const navigate = useNavigate()
  const { logout, admin } = useAuth()
  const { t } = useTranslation()
  const [daysRemaining, setDaysRemaining] = React.useState(null)

  React.useEffect(() => {
    // Calculate days remaining from admin context data
    if (!admin || !admin.subscriptionEndDate) {
      setDaysRemaining(null)
      return
    }

    // Parse the date from backend (LocalDateTime format: "2026-01-15T10:30:00")
    let endDate
    if (typeof admin.subscriptionEndDate === 'string') {
      endDate = new Date(admin.subscriptionEndDate)
    } else {
      endDate = new Date(admin.subscriptionEndDate)
    }

    // Validate the date
    if (isNaN(endDate.getTime())) {
      console.error('Invalid subscription end date:', admin.subscriptionEndDate)
      setDaysRemaining(null)
      return
    }

    const today = new Date()
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Set days remaining (can be negative if expired)
    setDaysRemaining(diffDays)
  }, [admin]) // Re-calculate when admin data changes

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.nav 
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(90deg, #1f2937 0%, #111827 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 1010,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
      }}
    >
      <motion.div 
        className="navbar-brand"
        whileHover={{ scale: 1.05 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1.25rem',
          fontWeight: '700',
        }}
      >
        <img 
          src="/images/pg-hostel-logo.jpg" 
          alt="PG/Hostel Logo" 
          style={{
            height: '40px',
            width: '40px',
            borderRadius: '8px',
            objectFit: 'cover',
          }}
        />
        <span
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('common.appName')}
        </span>
      </motion.div>

      <div className="navbar-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Subscription Countdown */}
        {daysRemaining !== null && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: daysRemaining <= 0
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : daysRemaining <= 3 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '0.5rem',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: daysRemaining <= 0
                ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                : daysRemaining <= 3
                ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                : '0 4px 12px rgba(16, 185, 129, 0.3)',
              animation: daysRemaining <= 3 ? 'pulse 2s infinite' : 'none',
            }}
          >
            <FiClock style={{ fontSize: '1rem' }} />
            <span>
              {daysRemaining <= 0
                ? 'Expired' 
                : daysRemaining === 1 
                ? '1 day left' 
                : `${daysRemaining} days left`}
            </span>
          </motion.div>
        )}
        <LanguageSelector />
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <FiLogOut />
          {t('common.logout')}
        </motion.button>
      </div>
    </motion.nav>
  )
}
