import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiEye, FiArrowLeft, FiDownload } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getAllStudents } from '../../services/studentService'
import { getAllRooms } from '../../services/roomService'
import paymentService from '../../services/paymentService'
import attendanceService from '../../services/attendanceService'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'

export default function StudentReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoom, setFilterRoom] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsResp, roomsResp, paymentsResp, attendanceResp] = await Promise.all([
        getAllStudents(),
        getAllRooms(),
        paymentService.getAllPayments(),
        attendanceService.getAllAttendance().catch(() => ({ data: [] }))
      ])

      console.log('Students Response:', studentsResp)
      console.log('Rooms Response:', roomsResp)
      console.log('Payments Response:', paymentsResp)
      console.log('Attendance Response:', attendanceResp)

      const studentsData = studentsResp.data || studentsResp || []
      const roomsData = roomsResp.data || roomsResp || []
      const paymentsData = paymentsResp.data || paymentsResp || []
      const attendanceData = attendanceResp.data || attendanceResp || []

      console.log('Processed Students:', studentsData)
      console.log('Processed Rooms:', roomsData)

      setStudents(studentsData)
      setRooms(roomsData)
      setPayments(paymentsData)
      setAttendance(attendanceData)
    } catch (error) {
      console.error('Error loading data:', error)
      console.error('Error details:', error.message, error.stack)
    } finally {
      setLoading(false)
    }
  }

  const getStudentReport = (student) => {
    // Get room details
    const room = rooms.find(r => r.roomNumber === student.roomNumber)
    const rent = room ? room.rent : 0

    // Get payment summary
    const studentPayments = payments.filter(p => p.student === student.name || p.studentName === student.name)
    const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const totalDue = rent - totalPaid
    const lastPayment = studentPayments.length > 0 
      ? studentPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0]
      : null

    // Get attendance summary
    const studentAttendance = attendance.filter(a => a.studentName === student.name)
    const presentDays = studentAttendance.filter(a => a.status?.toUpperCase() === 'PRESENT').length
    const absentDays = studentAttendance.filter(a => a.status?.toUpperCase() === 'ABSENT').length
    const totalDays = studentAttendance.length
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0

    return {
      ...student,
      roomNumber: student.roomNumber || 'Not Assigned',
      rent,
      totalPaid,
      totalDue: totalDue > 0 ? totalDue : 0,
      lastPaymentDate: lastPayment ? lastPayment.paymentDate : 'N/A',
      lastPaymentAmount: lastPayment ? lastPayment.amount : 0,
      presentDays,
      absentDays,
      totalDays,
      attendancePercentage,
      recentPayments: studentPayments.slice(0, 5)
    }
  }

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm)
      const matchesRoom = filterRoom === 'All' || student.roomNumber === filterRoom
      return matchesSearch && matchesRoom
    })
    .map(getStudentReport)

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF()
      
      // Fetch admin profile from database
      const { getAdminProfile } = await import('../../services/adminService')
      const adminProfile = await getAdminProfile()
      
      console.log('Admin Profile Data:', adminProfile)
      
      // Handle different response structures
      const profileData = adminProfile.data || adminProfile
      
      const hostelName = profileData.hostelName || profileData.name || 'PG/Hostel'
      const phone = profileData.phone || profileData.phoneNumber || 'N/A'
      const email = profileData.email || 'N/A'
      
      console.log('Extracted Data:', { hostelName, phone, email })
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Candidate Report', 14, 20)
      
      // Add date
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Add summary section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, 40)
      
      doc.setFontSize(10)
      doc.text(`Total Students: ${filteredStudents.length}`, 14, 48)
      doc.text(`Total Collected: Rs.${filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}`, 14, 54)
      doc.text(`Total Due: Rs.${filteredStudents.reduce((sum, s) => sum + s.totalDue, 0).toLocaleString()}`, 14, 60)
      
      // Add table header (without Attendance column)
      doc.setFontSize(9)
      doc.setFillColor(102, 126, 234)
      doc.rect(14, 70, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Name', 16, 76)
      doc.text('Room', 70, 76)
      doc.text('Rent', 105, 76)
      doc.text('Paid', 135, 76)
      doc.text('Due', 165, 76)
      
      // Add table rows
      let yPos = 84
      doc.setTextColor(0, 0, 0)
      
      filteredStudents.forEach((student, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(14, yPos - 6, 182, 8, 'F')
        }
        
        // Add student data (without attendance)
        doc.text(student.name.substring(0, 25), 16, yPos)
        doc.text(student.roomNumber, 70, yPos)
        doc.text(`Rs.${student.rent.toLocaleString()}`, 105, yPos)
        doc.text(`Rs.${student.totalPaid.toLocaleString()}`, 135, yPos)
        doc.text(`Rs.${student.totalDue.toLocaleString()}`, 165, yPos)
        
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
      doc.save(`Candidate_Report_${new Date().toISOString().split('T')[0]}.pdf`)
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
          <h1 className="page-title" style={{ color: 'white', margin: 0 }}>{t('studentReport.title')}</h1>
        </div>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {t('studentReport.subtitle')}
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
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder={t('studentReport.searchPlaceholder')}
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
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('studentReport.allRooms')}</option>
          {[...new Set(students.map(s => s.roomNumber))].filter(Boolean).map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>

        <motion.button
          onClick={downloadPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={filteredStudents.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: filteredStudents.length === 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: filteredStudents.length === 0 ? 'not-allowed' : 'pointer',
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredStudents.length}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('studentReport.totalStudents')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            ₹{filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('studentReport.totalCollected')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            ₹{filteredStudents.reduce((sum, s) => sum + s.totalDue, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('studentReport.totalDue')}</div>
        </motion.div>
      </div>

      {/* Students Table */}
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
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>{t('studentReport.loading')}</div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{t('studentReport.noStudentsFound')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('studentReport.name')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('studentReport.room')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('studentReport.rent')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('studentReport.paid')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('studentReport.due')}</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>{t('studentReport.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                    whileHover={{ background: '#f9fafb' }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{student.roomNumber}</td>
                    <td style={{ padding: '1rem', color: '#374151' }}>₹{student.rent.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#10b981', fontWeight: '600' }}>₹{student.totalPaid.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: student.totalDue > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                      ₹{student.totalDue.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <motion.button
                        onClick={() => setSelectedStudent(student)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <FiEye /> {t('studentReport.view')}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Detailed View Modal */}
      {selectedStudent && (
        <motion.div
          className="modal-overlay"
          onClick={() => setSelectedStudent(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={{
              background: 'white',
              borderRadius: '1rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.5rem',
              borderRadius: '1rem 1rem 0 0',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ margin: 0 }}>{t('studentReport.studentDetails')}</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Personal Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#111827' }}>{t('studentReport.personalInformation')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('studentReport.name')}</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{selectedStudent.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('studentReport.email')}</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{selectedStudent.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('studentReport.phone')}</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{selectedStudent.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('studentReport.roomNumber')}</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{selectedStudent.roomNumber}</div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#111827' }}>{t('studentReport.paymentSummary')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.25rem' }}>{t('studentReport.monthlyRent')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0c4a6e' }}>₹{selectedStudent.rent.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#15803d', marginBottom: '0.25rem' }}>{t('studentReport.totalPaid')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>₹{selectedStudent.totalPaid.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.25rem' }}>{t('studentReport.totalDue')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#991b1b' }}>₹{selectedStudent.totalDue.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#111827' }}>{t('studentReport.attendanceSummary')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{selectedStudent.totalDays}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('studentReport.totalDays')}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{selectedStudent.attendancePercentage}%</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('studentReport.percentage')}</div>
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              {selectedStudent.recentPayments && selectedStudent.recentPayments.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#111827' }}>{t('studentReport.recentPayments')}</h3>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{t('studentReport.date')}</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{t('studentReport.amount')}</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{t('studentReport.method')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.recentPayments.map((payment, index) => (
                          <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>{payment.paymentDate}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>₹{Number(payment.amount).toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>{payment.method || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
