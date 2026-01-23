import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiArrowLeft, FiDownload, FiClock, FiUser, FiUsers, FiCalendar } from 'react-icons/fi'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { getAllStudentsIncludingDeleted } from '../../services/studentService'
import paymentService from '../../services/paymentService'
import { getAllStaff } from '../../services/staffService'
import { getAllAppointments } from '../../services/appointmentService'
import { getAllRooms } from '../../services/roomService'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import { MdOutlineBedroomParent } from 'react-icons/md'

export default function TotalLogReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsResp, paymentsResp, staffResp, appointmentsResp, roomsResp] = await Promise.all([
        getAllStudentsIncludingDeleted(),
        paymentService.getAllPayments(),
        getAllStaff().catch(() => ({ data: [] })),
        getAllAppointments().catch(() => ({ data: [] })),
        getAllRooms().catch(() => ({ data: [] }))
      ])

      const students = studentsResp.data || studentsResp || []
      const payments = paymentsResp.data || paymentsResp || []
      const staff = staffResp.data || staffResp || []
      const appointments = appointmentsResp.data || appointmentsResp || []
      const roomsList = roomsResp.data || roomsResp || []

      const combinedLogs = [
        ...students.map(s => ({
          date: s.createdAt || s.joiningDate || new Date().toISOString(),
          type: 'Candidate',
          name: s.name,
          roomNumber: s.roomNumber,
          icon: FiUser,
          color: '#3b82f6'
        })),
        ...payments.map(p => ({
          date: p.paymentDate || p.createdAt || new Date().toISOString(),
          type: 'Payment',
          amount: p.amount,
          student: p.student,
          icon: FaIndianRupeeSign,
          color: '#10b981'
        })),
        ...staff.map(s => ({
          date: s.createdAt || s.joiningDate || new Date().toISOString(),
          type: 'Staff',
          name: s.username || s.name,
          role: s.role,
          icon: FiUsers,
          color: '#f59e0b'
        })),
        ...appointments.map(app => ({
          date: app.appointmentDate || app.createdAt || new Date().toISOString(),
          type: 'Appointment',
          purpose: app.purpose,
          candidateName: app.candidateName,
          icon: FiCalendar,
          color: '#8b5cf6'
        })),
        ...roomsList.map(r => ({
          date: r.createdAt || new Date().toISOString(),
          type: 'Room',
          number: r.roomNumber,
          roomType: r.type,
          icon: MdOutlineBedroomParent,
          color: '#ec4899'
        }))
      ]

      // Sort by date descending
      combinedLogs.sort((a, b) => new Date(b.date) - new Date(a.date))
      setLogs(combinedLogs)
    } catch (error) {
      console.error('Error loading log data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    let searchableText = ''
    switch(log.type) {
      case 'Candidate':
        searchableText = t('totalLogReport.candidateRegistered', { name: log.name }) + ' ' + t('students.roomNumber') + ' ' + (log.roomNumber || 'N/A')
        break
      case 'Payment':
        searchableText = t('totalLogReport.paymentReceived', { amount: log.amount }) + ' ' + (log.student || t('totalLogReport.unknownStudent'))
        break
      case 'Staff':
        searchableText = t('totalLogReport.staffMember', { name: log.name }) + ' ' + (log.role || t('totalLogReport.member'))
        break
      case 'Appointment':
        searchableText = t('totalLogReport.appointmentPurpose', { purpose: log.purpose || t('totalLogReport.visit') }) + ' ' + (log.candidateName || t('totalLogReport.unknownCandidate'))
        break
      case 'Room':
        searchableText = t('totalLogReport.roomRegistered', { number: log.number }) + ' ' + (log.roomType || '')
        break
      default:
        searchableText = ''
    }

    const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'All' || log.type === filterType
    return matchesSearch && matchesType
  })

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF()
      
      const { getAdminProfile } = await import('../../services/adminService')
      const adminProfile = await getAdminProfile()
      const profileData = adminProfile.data || adminProfile
      const hostelName = profileData.hostelName || profileData.name || 'PG/Hostel'
      
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Total Activity Log Report', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)
      doc.text(`Hostel: ${hostelName}`, 14, 34)
      
      doc.setFontSize(9)
      doc.setFillColor(102, 126, 234)
      doc.rect(14, 45, 182, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Date', 16, 51)
      doc.text('Type', 50, 51)
      doc.text('Details', 80, 51)
      doc.text('Reference', 150, 51)
      
      let yPos = 59
      doc.setTextColor(0, 0, 0)
      
      filteredLogs.slice(0, 100).forEach((log, index) => { // Limit to 100 for PDF
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(14, yPos - 6, 182, 8, 'F')
        }
        
        let detailsText = ''
        let referenceText = ''

        switch(log.type) {
          case 'Candidate':
            detailsText = t('totalLogReport.candidateRegistered', { name: log.name })
            referenceText = `${t('students.roomNumber')} ${log.roomNumber || 'N/A'}`
            break
          case 'Payment':
            detailsText = t('totalLogReport.paymentReceived', { amount: log.amount })
            referenceText = log.student || t('totalLogReport.unknownStudent')
            break
          case 'Staff':
            detailsText = t('totalLogReport.staffMember', { name: log.name })
            referenceText = log.role || t('totalLogReport.member')
            break
          case 'Appointment':
            detailsText = t('totalLogReport.appointmentPurpose', { purpose: log.purpose || t('totalLogReport.visit') })
            referenceText = log.candidateName || t('totalLogReport.unknownCandidate')
            break
          case 'Room':
            detailsText = t('totalLogReport.roomRegistered', { number: log.number })
            referenceText = log.roomType || 'Standard'
            break
          default:
            detailsText = ''
            referenceText = ''
        }

        const dateStr = new Date(log.date).toLocaleDateString()
        doc.text(dateStr, 16, yPos)
        doc.text(t(`totalLogReport.${log.type.toLowerCase()}`), 50, yPos)
        
        // Replace Rupee symbol with Rs. for PDF compatibility
        const details = detailsText.replace('₹', 'Rs. ')
        doc.text(details.substring(0, 40), 80, yPos)
        doc.text(referenceText.substring(0, 30), 150, yPos)
        
        yPos += 8
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      })
      
      doc.save(`Total_Log_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <button
            onClick={() => navigate('/reports')}
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
          </button>
          <h1 className="page-title" style={{ color: 'white', margin: 0 }}>{t('totalLogReport.title')}</h1>
        </div>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {t('totalLogReport.subtitle')}
        </p>
      </motion.div>

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder={t('totalLogReport.searchPlaceholder')}
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('totalLogReport.allTypes')}</option>
          <option value="Candidate">{t('totalLogReport.candidate')}</option>
          <option value="Payment">{t('totalLogReport.payment')}</option>
          <option value="Staff">{t('totalLogReport.staff')}</option>
          <option value="Appointment">{t('totalLogReport.appointment')}</option>
          <option value="Room">{t('totalLogReport.room')}</option>
        </select>

        <button
          onClick={downloadPDF}
          disabled={filteredLogs.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: filteredLogs.length === 0 ? '#d1d5db' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FiDownload /> {t('totalLogReport.downloadLog')}
        </button>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <FiClock size={40} className="spin" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>{t('totalLogReport.loading')}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <p>{t('totalLogReport.noLogsFound')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('totalLogReport.date')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('totalLogReport.type')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('totalLogReport.details')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('totalLogReport.reference')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const Icon = log.icon
                  let detailsText = ''
                  let referenceText = log.reference

                  switch(log.type) {
                    case 'Candidate':
                      detailsText = t('totalLogReport.candidateRegistered', { name: log.name })
                      referenceText = `${t('students.roomNumber')} ${log.roomNumber || 'N/A'}`
                      break
                    case 'Payment':
                      detailsText = t('totalLogReport.paymentReceived', { amount: log.amount })
                      referenceText = log.student || t('totalLogReport.unknownStudent')
                      break
                    case 'Staff':
                      detailsText = t('totalLogReport.staffMember', { name: log.name })
                      referenceText = log.role || t('totalLogReport.member')
                      break
                    case 'Appointment':
                      detailsText = t('totalLogReport.appointmentPurpose', { purpose: log.purpose || t('totalLogReport.visit') })
                      referenceText = log.candidateName || t('totalLogReport.unknownCandidate')
                      break
                    case 'Room':
                      detailsText = t('totalLogReport.roomRegistered', { number: log.number })
                      referenceText = log.roomType || 'Standard'
                      break
                    default:
                      detailsText = log.details
                      referenceText = log.reference
                  }

                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                    >
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {new Date(log.date).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: log.color,
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          <Icon />
                          {t(`totalLogReport.${log.type.toLowerCase()}`)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>
                        {detailsText}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {referenceText}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
