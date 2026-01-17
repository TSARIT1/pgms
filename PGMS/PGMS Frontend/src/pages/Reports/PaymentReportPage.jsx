import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiArrowLeft, FiDollarSign, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getAllStudents } from '../../services/studentService'
import paymentService from '../../services/paymentService'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'

export default function PaymentReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('All')
  const [filterMethod, setFilterMethod] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [paymentsResp, studentsResp] = await Promise.all([
        paymentService.getAllPayments(),
        getAllStudents()
      ])

      setPayments(paymentsResp.data || paymentsResp || [])
      setStudents(studentsResp.data || studentsResp || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique months from payments
  const months = [...new Set(payments.map(p => {
    const date = new Date(p.paymentDate)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }))].sort().reverse()

  // Get unique payment methods
  const methods = [...new Set(payments.map(p => p.method || 'N/A').filter(Boolean))]

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const paymentDate = new Date(payment.paymentDate)
    const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`
    const matchesMonth = filterMonth === 'All' || paymentMonth === filterMonth
    
    const matchesMethod = filterMethod === 'All' || payment.method === filterMethod

    return matchesSearch && matchesMonth && matchesMethod
  })

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const avgPayment = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0

  // Payment method breakdown
  const methodBreakdown = filteredPayments.reduce((acc, payment) => {
    const method = payment.method || 'N/A'
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 }
    }
    acc[method].count++
    acc[method].total += Number(payment.amount || 0)
    return acc
  }, {})

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF()
      
      // Fetch admin profile from database
      const { getAdminProfile } = await import('../../services/adminService')
      const adminProfile = await getAdminProfile()
      
      const profileData = adminProfile.data || adminProfile
      const hostelName = profileData.hostelName || profileData.name || 'PG/Hostel'
      const phone = profileData.phone || profileData.phoneNumber || 'N/A'
      const email = profileData.email || 'N/A'
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Payment Report', 14, 20)
      
      // Add date
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Add summary section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 40)
      
      doc.setFontSize(10)
      doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString()}`, 14, 48)
      doc.text(`Total Transactions: ${filteredPayments.length}`, 14, 54)
      
      // Add table header
      doc.setFontSize(9)
      doc.setFillColor(102, 126, 234)
      doc.rect(14, 70, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Date', 16, 76)
      doc.text('Student', 50, 76)
      doc.text('Amount', 105, 76)
      doc.text('Method', 135, 76)
      doc.text('Description', 165, 76)
      
      // Add table rows
      let yPos = 84
      doc.setTextColor(0, 0, 0)
      
      const sortedPayments = filteredPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      
      sortedPayments.forEach((payment, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(14, yPos - 6, 182, 8, 'F')
        }
        
        // Add payment data
        const date = new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        doc.text(date, 16, yPos)
        doc.text((payment.student || payment.studentName || '').substring(0, 15), 50, yPos)
        doc.text(`Rs.${Number(payment.amount).toLocaleString()}`, 105, yPos)
        doc.text((payment.method || 'N/A').substring(0, 10), 135, yPos)
        doc.text((payment.description || '-').substring(0, 10), 165, yPos)
        
        yPos += 8
        
        // Add new page if needed
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
      })
      
      // Add footer with PG/Hostel information (centered)
      const pageHeight = doc.internal.pageSize.height
      const pageWidth = doc.internal.pageSize.width
      const footerY = pageHeight - 20
      
      doc.setFontSize(10)
      doc.setTextColor(102, 126, 234)
      doc.text('PG/Hostel Information', pageWidth / 2, footerY - 10, { align: 'center' })
      
      doc.setFontSize(9)
      doc.setTextColor(0)
      doc.text(`${hostelName}`, pageWidth / 2, footerY - 3, { align: 'center' })
      doc.text(`Phone: ${phone} | Email: ${email}`, pageWidth / 2, footerY + 3, { align: 'center' })
      
      // Save the PDF
      doc.save(`Payment_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <motion.button
            onClick={() => navigate('/reports')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <h1 className="page-title" style={{ color: 'white', margin: 0 }}>{t('paymentReport.title')}</h1>
        </div>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {t('paymentReport.subtitle')}
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder={t('paymentReport.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
            }}
          />
        </div>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('paymentReport.allMonths')}</option>
          {months.map(month => (
            <option key={month} value={month}>
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('paymentReport.allMethods')}</option>
          {methods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>

        <motion.button
          onClick={downloadPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={filteredPayments.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: filteredPayments.length === 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: filteredPayments.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FiDownload /> Download Report
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('paymentReport.totalRevenue')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredPayments.length}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('paymentReport.totalTransactions')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{avgPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('paymentReport.averagePayment')}</div>
        </motion.div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(methodBreakdown).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>{t('paymentReport.paymentMethodBreakdown')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {Object.entries(methodBreakdown).map(([method, data], index) => (
              <div
                key={method}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{method}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                  ₹{data.total.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {data.count} {data.count === 1 ? t('paymentReport.transaction') : t('paymentReport.transactions')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#111827' }}>{t('paymentReport.paymentTransactions')}</h3>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>{t('paymentReport.loading')}</div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{t('paymentReport.noPaymentsFound')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('paymentReport.date')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('paymentReport.student')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('paymentReport.amount')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('paymentReport.method')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('paymentReport.description')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments
                  .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                  .map((payment, index) => (
                    <motion.tr
                      key={payment.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                      whileHover={{ background: '#f9fafb' }}
                    >
                      <td style={{ padding: '1rem', color: '#374151' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiCalendar size={14} style={{ color: '#6b7280' }} />
                          {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {payment.student || payment.studentName}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: '#10b981',
                          fontSize: '1.125rem'
                        }}>
                          ₹{Number(payment.amount).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          background: '#f0f9ff',
                          color: '#0369a1',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {payment.method || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {payment.description || '-'}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
