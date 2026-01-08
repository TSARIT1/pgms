import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiArrowLeft, FiAlertCircle, FiDownload } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getAllStudents } from '../../services/studentService'
import { getAllRooms } from '../../services/roomService'
import paymentService from '../../services/paymentService'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'

export default function DueSummaryReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsResp, roomsResp, paymentsResp] = await Promise.all([
        getAllStudents(),
        getAllRooms(),
        paymentService.getAllPayments()
      ])

      setStudents(studentsResp.data || studentsResp || [])
      setRooms(roomsResp.data || roomsResp || [])
      setPayments(paymentsResp.data || paymentsResp || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStudentDues = (student) => {
    // Get room rent
    const room = rooms.find(r => r.roomNumber === student.roomNumber)
    const monthlyRent = room ? room.rent : 0

    // Get total paid by student
    const studentPayments = payments.filter(p => 
      p.student === student.name || p.studentName === student.name
    )
    const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    // Calculate due
    const totalDue = monthlyRent - totalPaid
    const hasDue = totalDue > 0

    return {
      ...student,
      monthlyRent,
      totalPaid,
      totalDue: hasDue ? totalDue : 0,
      hasDue,
      paymentCount: studentPayments.length,
      lastPayment: studentPayments.length > 0 
        ? studentPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0]
        : null
    }
  }

  const studentsWithDues = students
    .map(getStudentDues)
    .filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = 
        filterStatus === 'All' ||
        (filterStatus === 'Has Dues' && student.hasDue) ||
        (filterStatus === 'Fully Paid' && !student.hasDue)

      return matchesSearch && matchesStatus
    })

  const totalDues = studentsWithDues.reduce((sum, s) => sum + s.totalDue, 0)
  const studentsWithDuesCount = studentsWithDues.filter(s => s.hasDue).length
  const fullyPaidCount = studentsWithDues.filter(s => !s.hasDue).length

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
      doc.text('Due Summary Report', 14, 20)
      
      // Add date
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Add summary section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 40)
      
      doc.setFontSize(10)
      doc.text(`Total Outstanding: Rs.${totalDues.toLocaleString()}`, 14, 48)
      doc.text(`Students with Dues: ${studentsWithDuesCount}`, 14, 54)
      doc.text(`Fully Paid: ${fullyPaidCount}`, 14, 60)
      
      // Add table header
      doc.setFontSize(9)
      doc.setFillColor(102, 126, 234)
      doc.rect(14, 70, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Student', 16, 76)
      doc.text('Room', 65, 76)
      doc.text('Rent', 90, 76)
      doc.text('Paid', 115, 76)
      doc.text('Due', 140, 76)
      doc.text('Status', 165, 76)
      
      // Add table rows
      let yPos = 84
      doc.setTextColor(0, 0, 0)
      
      const sortedStudents = studentsWithDues.sort((a, b) => b.totalDue - a.totalDue)
      
      sortedStudents.forEach((student, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(14, yPos - 6, 182, 8, 'F')
        }
        
        // Add student data
        doc.text(student.name.substring(0, 18), 16, yPos)
        doc.text(student.roomNumber || 'N/A', 65, yPos)
        doc.text(`Rs.${student.monthlyRent.toLocaleString()}`, 90, yPos)
        doc.text(`Rs.${student.totalPaid.toLocaleString()}`, 115, yPos)
        doc.text(`Rs.${student.totalDue.toLocaleString()}`, 140, yPos)
        doc.text(student.hasDue ? 'Pending' : 'Paid', 165, yPos)
        
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
      doc.save(`Due_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`)
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
          <h1 className="page-title" style={{ color: 'white', margin: 0 }}>{t('dueSummaryReport.title')}</h1>
        </div>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {t('dueSummaryReport.subtitle')}
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
            placeholder={t('dueSummaryReport.searchPlaceholder')}
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('dueSummaryReport.allStudents')}</option>
          <option value="Has Dues">{t('dueSummaryReport.hasDues')}</option>
          <option value="Fully Paid">{t('dueSummaryReport.fullyPaid')}</option>
        </select>

        <motion.button
          onClick={downloadPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={studentsWithDues.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: studentsWithDues.length === 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: studentsWithDues.length === 0 ? 'not-allowed' : 'pointer',
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
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{totalDues.toLocaleString()}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('dueSummaryReport.totalOutstanding')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{studentsWithDuesCount}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('dueSummaryReport.studentsWithDues')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{fullyPaidCount}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('dueSummaryReport.fullyPaid')}</div>
        </motion.div>
      </div>

      {/* Dues Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#111827' }}>{t('dueSummaryReport.studentDueDetails')}</h3>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>{t('dueSummaryReport.loading')}</div>
        ) : studentsWithDues.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{t('dueSummaryReport.noStudentsFound')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.student')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.room')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.rent')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.paid')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.due')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.status')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('dueSummaryReport.lastPayment')}</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithDues
                  .sort((a, b) => b.totalDue - a.totalDue)
                  .map((student, index) => (
                    <motion.tr
                      key={student.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        background: student.hasDue ? '#fef2f2' : 'white'
                      }}
                      whileHover={{ background: student.hasDue ? '#fee2e2' : '#f9fafb' }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{student.email}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{student.roomNumber || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#374151' }}>₹{student.monthlyRent.toLocaleString()}</td>
                      <td style={{ padding: '1rem', color: '#10b981', fontWeight: '600' }}>
                        ₹{student.totalPaid.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: student.hasDue ? '#ef4444' : '#10b981',
                          fontSize: '1.125rem'
                        }}>
                          ₹{student.totalDue.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {student.hasDue ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            <FiAlertCircle size={14} />
                            {t('dueSummaryReport.pending')}
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-block',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            background: '#dcfce7',
                            color: '#059669',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {t('dueSummaryReport.paidStatus')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {student.lastPayment 
                          ? new Date(student.lastPayment.paymentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : t('dueSummaryReport.noPayments')
                        }
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
