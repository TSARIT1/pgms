import React from 'react'
import { motion } from 'framer-motion'

const colorStyles = {
  blue: { 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconBg: 'rgba(102, 126, 234, 0.15)',
    textColor: '#667eea',
    shadowColor: 'rgba(102, 126, 234, 0.3)'
  },
  green: { 
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    iconBg: 'rgba(67, 233, 123, 0.15)',
    textColor: '#43e97b',
    shadowColor: 'rgba(67, 233, 123, 0.3)'
  },
  red: { 
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    iconBg: 'rgba(250, 112, 154, 0.15)',
    textColor: '#fa709a',
    shadowColor: 'rgba(250, 112, 154, 0.3)'
  },
  orange: { 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    iconBg: 'rgba(240, 147, 251, 0.15)',
    textColor: '#f093fb',
    shadowColor: 'rgba(240, 147, 251, 0.3)'
  },
  teal: { 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    iconBg: 'rgba(79, 172, 254, 0.15)',
    textColor: '#4facfe',
    shadowColor: 'rgba(79, 172, 254, 0.3)'
  },
}

export default function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const colors = colorStyles[color] || colorStyles.blue

  return (
    <motion.div
      className={`stat-card ${color}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ 
        y: -12, 
        scale: 1.03,
        boxShadow: `0 25px 50px ${colors.shadowColor}`
      }}
      style={{
        background: 'white',
        borderRadius: '1.25rem',
        padding: '2rem',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: `0 10px 40px ${colors.shadowColor}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Gradient decoration blob */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-30%',
          width: '200px',
          height: '200px',
          background: colors.gradient,
          opacity: 0.12,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Icon with gradient background */}
        <motion.div
          className="stat-card-icon"
          style={{
            background: colors.iconBg,
            width: '64px',
            height: '64px',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            fontSize: '2rem',
          }}
          whileHover={{ 
            rotate: [0, -10, 10, 0],
            scale: 1.1 
          }}
          transition={{ duration: 0.5 }}
        >
          <Icon style={{ color: colors.textColor }} />
        </motion.div>

        {/* Value with gradient text */}
        <motion.div
          className="stat-card-value"
          style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: colors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {value}
        </motion.div>

        {/* Label */}
        <motion.div
          className="stat-card-label"
          style={{
            fontSize: '0.9375rem',
            color: '#6b7280',
            fontWeight: '600',
            letterSpacing: '0.01em'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: colors.gradient,
          opacity: 0.6,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      />
    </motion.div>
  )
}
