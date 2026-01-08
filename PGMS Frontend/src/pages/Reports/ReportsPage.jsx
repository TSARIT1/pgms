import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiBarChart2, FiGrid, FiDollarSign, FiTrendingDown, FiCheckSquare, FiLayout } from 'react-icons/fi'

export default function ReportsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const reports = [
    {
      icon: FiBarChart2,
      label: t('reports.candidate.label'),
      description: t('reports.candidate.description'),
      path: '/reports/students'
    },
    {
      icon: FiGrid,
      label: t('reports.rooms.label'),
      description: t('reports.rooms.description'),
      path: '/reports/rooms'
    },
    {
      icon: FiDollarSign,
      label: t('reports.payments.label'),
      description: t('reports.payments.description'),
      path: '/reports/payments'
    },
    {
      icon: FiTrendingDown,
      label: t('reports.dues.label'),
      description: t('reports.dues.description'),
      path: '/reports/dues'
    },
    {
      icon: FiLayout,
      label: t('reports.occupancy.label'),
      description: t('reports.occupancy.description'),
      path: '/reports/occupancy'
    },
    {
      icon: FiDollarSign,
      label: 'Revenue Report',
      description: 'Monthly and yearly revenue analytics',
      path: '/reports/revenue'
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const handleReportClick = (report) => {
    if (report.path) {
      navigate(report.path)
    }
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced Header */}
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
          <h1 className="page-title" style={{ color: 'white' }}>{t('reports.title')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('reports.subtitle')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiBarChart2 />
        </div>
      </motion.div>

      <motion.div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {reports.map((report, idx) => {
          const Icon = report.icon
          return (
            <motion.button
              key={idx}
              variants={itemVariants}
              className="report-button"
              onClick={() => handleReportClick(report)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                border: '2px solid #e5e7eb',
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                cursor: report.path ? 'pointer' : 'not-allowed',
                opacity: report.path ? 1 : 0.6,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (report.path) {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.2)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Icon style={{ fontSize: '2rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#111827', marginBottom: '0.5rem' }}>
                  {report.label}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {report.description}
                </span>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
