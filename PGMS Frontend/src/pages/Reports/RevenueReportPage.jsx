import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiDollarSign, FiCalendar, FiTrendingUp, FiDownload } from 'react-icons/fi'
import paymentService from '../../services/paymentService'
import { jsPDF } from 'jspdf'

export default function RevenueReportPage() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Monthly section state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear())
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [monthlyPayments, setMonthlyPayments] = useState([])
  
  // Yearly section state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [yearlyRevenue, setYearlyRevenue] = useState(0)
  const [yearlyPayments, setYearlyPayments] = useState([])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    calculateMonthlyRevenue()
  }, [selectedMonth, selectedMonthYear, payments])

  useEffect(() => {
    calculateYearlyRevenue()
  }, [selectedYear, payments])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentService.getAllPayments()
      setPayments(response.data || response || [])
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyRevenue = () => {
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate)
      return paymentDate.getMonth() === selectedMonth && 
             paymentDate.getFullYear() === selectedMonthYear
    })
    
    const total = filtered.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    setMonthlyRevenue(total)
    setMonthlyPayments(filtered)
  }

  const calculateYearlyRevenue = () => {
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate)
      return paymentDate.getFullYear() === selectedYear
    })
    
    const total = filtered.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    setYearlyRevenue(total)
    setYearlyPayments(filtered)
  }

  const downloadMonthlyPDF = async () => {
    try {
      const doc = new jsPDF()
      
      // Fetch admin profile
      const { getAdminProfile } = await import('../../services/adminService')
      const adminProfile = await getAdminProfile()
      const profileData = adminProfile.data || adminProfile
      const hostelName = profileData.hostelName || profileData.name || 'PG/Hostel'
      const phone = profileData.phone || profileData.phoneNumber || 'N/A'
      const email = profileData.email || 'N/A'
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Monthly Revenue Report', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Add summary
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 40)
      
      doc.setFontSize(10)
      doc.text(`Month: ${months[selectedMonth]} ${selectedMonthYear}`, 14, 48)
      doc.text(`Total Revenue: Rs.${monthlyRevenue.toLocaleString()}`, 14, 54)
      doc.text(`Total Payments: ${monthlyPayments.length}`, 14, 60)
      
      // Add footer
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
      
      doc.save(`Monthly_Revenue_${months[selectedMonth]}_${selectedMonthYear}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const downloadYearlyPDF = async () => {
    try {
      const doc = new jsPDF()
      
      // Fetch admin profile
      const { getAdminProfile } = await import('../../services/adminService')
      const adminProfile = await getAdminProfile()
      const profileData = adminProfile.data || adminProfile
      const hostelName = profileData.hostelName || profileData.name || 'PG/Hostel'
      const phone = profileData.phone || profileData.phoneNumber || 'N/A'
      const email = profileData.email || 'N/A'
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Yearly Revenue Report', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Add summary
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 40)
      
      doc.setFontSize(10)
      doc.text(`Year: ${selectedYear}`, 14, 48)
      doc.text(`Total Revenue: Rs.${yearlyRevenue.toLocaleString()}`, 14, 54)
      doc.text(`Total Payments: ${yearlyPayments.length}`, 14, 60)
      
      // Add footer
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
      
      doc.save(`Yearly_Revenue_${selectedYear}.pdf`)
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 className="page-title" style={{ color: 'white' }}>Revenue Report</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            View monthly and yearly revenue analytics
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiDollarSign />
        </div>
      </motion.div>

      {/* Monthly Revenue Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiCalendar style={{ fontSize: '1.5rem' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            Monthly Revenue Report
          </h2>
        </div>

        {/* Month and Year Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Select Year
            </label>
            <select
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Revenue Display */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '2rem',
          borderRadius: '0.75rem',
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            Total Revenue for {months[selectedMonth]} {selectedMonthYear}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700' }}>
            {loading ? 'Loading...' : `₹${monthlyRevenue.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {monthlyPayments.length} payment(s)
          </div>
        </div>

        {/* Download Button */}
        <motion.button
          onClick={downloadMonthlyPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <FiDownload /> Download Monthly Report
        </motion.button>
      </motion.div>

      {/* Yearly Revenue Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiTrendingUp style={{ fontSize: '1.5rem' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            Yearly Revenue Report
          </h2>
        </div>

        {/* Year Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Yearly Revenue Display */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '2rem',
          borderRadius: '0.75rem',
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            Total Revenue for {selectedYear}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700' }}>
            {loading ? 'Loading...' : `₹${yearlyRevenue.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {yearlyPayments.length} payment(s)
          </div>
        </div>

        {/* Download Button */}
        <motion.button
          onClick={downloadYearlyPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <FiDownload /> Download Yearly Report
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
