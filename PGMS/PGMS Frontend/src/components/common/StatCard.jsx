import React from 'react'
import { motion } from 'framer-motion'

const colorStyles = {
  blue: { bg: '#3b82f6', light: '#eff6ff', dark: '#1e40af' },
  green: { bg: '#10b981', light: '#f0fdf4', dark: '#065f46' },
  red: { bg: '#ef4444', light: '#fef2f2', dark: '#7f1d1d' },
  orange: { bg: '#f59e0b', light: '#fffbeb', dark: '#92400e' },
  teal: { bg: '#14b8a6', light: '#f0fdfa', dark: '#134e4a' },
}

export default function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const colors = colorStyles[color] || colorStyles.blue

  return (
    <motion.div
      className={`stat-card ${color}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
      style={{
        background: `linear-gradient(135deg, #ffffff 0%, ${colors.light} 100%)`,
        borderRadius: '1rem',
        padding: '1.5rem',
        border: `2px solid ${colors.light}`,
        boxShadow: `0 4px 12px ${colors.bg}20`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      
      <motion.div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '300px',
          height: '300px',
          background: `${colors.bg}10`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          className="stat-card-icon"
          style={{
            background: colors.light,
            color: colors.bg,
            width: '3rem',
            height: '3rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <Icon />
        </motion.div>
        <motion.div
          className="stat-card-value"
          style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {value}
        </motion.div>
        <motion.div
          className="stat-card-label"
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.div>
      </div>
    </motion.div>
  )
}
