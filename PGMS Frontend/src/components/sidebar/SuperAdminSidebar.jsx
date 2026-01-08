import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiUsers, FiCreditCard, FiLogOut, FiMessageSquare } from 'react-icons/fi'

export default function SuperAdminSidebar() {
  const menuItems = [
    { path: '/superadmin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/superadmin/pg-hostels', icon: FiUsers, label: 'PG/Hostels' },
    { path: '/superadmin/subscriptions/manage', icon: FiCreditCard, label: 'Subscriptions' },
    { path: '/superadmin/tickets', icon: FiMessageSquare, label: 'Tickets' },
  ]

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      {/* Logo/Title */}
      <div style={{
        marginBottom: '3rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
        }}>
          Super Admin
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.875rem',
        }}>
          System Management
        </p>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              marginBottom: '0.75rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: isActive ? '#667eea' : 'rgba(255, 255, 255, 0.9)',
              backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.1)',
              fontWeight: isActive ? '600' : '500',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '0.75rem',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
        }}
      >
        <FiLogOut size={20} />
        <span>Logout</span>
      </motion.button>
    </motion.div>
  )
}
