import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  FiHome, 
  FiUsers, 
  FiGrid, 
  FiUser, 
  FiDollarSign, 
  FiCheckSquare, 
  FiBarChart2,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi'


const containerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}


export default function AdminSidebar() {
  const location = useLocation()
  const { t } = useTranslation()

  const menuItems = [
    { label: t('sidebar.dashboard'), path: '/dashboard', icon: FiHome },
    { label: t('sidebar.staffManagement'), path: '/staff', icon: FiTrendingUp },
    { label: t('sidebar.rooms'), path: '/rooms', icon: FiGrid },
    { label: t('sidebar.candidates'), path: '/students', icon: FiUsers },
    { label: t('sidebar.payments'), path: '/payments', icon: FiDollarSign },
    { label: t('sidebar.appointments'), path: '/appointments', icon: FiCalendar },
    { label: t('sidebar.reports'), path: '/reports', icon: FiBarChart2 },
    { label: t('sidebar.profile'), path: '/profile', icon: FiUser },
  ]

  return (
    <motion.div 
      className="sidebar-container"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="sidebar" style={{ flex: 1, overflowY: 'auto' }}>
        <motion.div 
          className="sidebar-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          }}
        >
          PG/HMS
        </motion.div>

        <motion.ul 
          className="sidebar-menu"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <motion.li 
                key={item.path} 
                className="sidebar-menu-item"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Link
                  to={item.path}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    whileHover={{ 
                      x: 8,
                      backgroundColor: isActive ? 'rgba(102, 126, 234, 1)' : 'rgba(255, 255, 255, 0.15)',
                    }}
                    animate={{
                      backgroundColor: isActive ? 'rgba(102, 126, 234, 0.9)' : 'transparent',
                      paddingLeft: isActive ? '1.5rem' : '1rem',
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                  
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <motion.div
                      animate={{ rotate: isActive ? 20 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      <Icon />
                    </motion.div>

                    <span style={{ marginLeft: '0.25rem' }}>{item.label}</span>

                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          marginLeft: 'auto',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#fff',
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </motion.div>
  )
}
