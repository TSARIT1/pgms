import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiCheckSquare, FiPlus } from 'react-icons/fi'
import DataTable from '../../components/common/DataTable'
import AttendanceForm from './AttendanceForm'
import attendanceService from '../../services/attendanceService'
import { getAllStudents } from '../../services/studentService'
import { useTranslation } from 'react-i18next'

export default function AttendancePage() {
  const { t } = useTranslation()
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [filterDate, setFilterDate] = useState('')
  const [filterRoom, setFilterRoom] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [attendanceResp, studentsResp] = await Promise.all([
        attendanceService.getAllAttendance(),
        getAllStudents()
      ])
      
      // Map attendance data
      const attendanceData = (attendanceResp.data || attendanceResp || []).map(a => ({
        Date: a.date,
        Student: a.studentName,
        Room: a.roomNumber,
        Status: a.status,
        __raw: a
      }))
      
      setAttendance(attendanceData)
      setStudents(studentsResp.data || studentsResp || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAttendance = async (attendanceList) => {
    try {
      setError(null)
      await attendanceService.markBulkAttendance(attendanceList)
      setShowForm(false)
      await loadData()
    } catch (err) {
      console.error('Error marking attendance:', err)
      setError(err.message || 'Failed to mark attendance')
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    const dateMatch = !filterDate || record.Date === filterDate
    const roomMatch = filterRoom === 'All' || record.Room === filterRoom
    const statusMatch = filterStatus === 'All' || record.Status === filterStatus
    return dateMatch && roomMatch && statusMatch
  })

  const columns = ['Date', 'Student', 'Room', 'Status']

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
          <h1 className="page-title" style={{ color: 'white' }}>{t('attendancePage.title')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('attendancePage.subtitle')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiCheckSquare />
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div className="toolbar-left" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.input
            type="date"
            className="search-input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              width: '150px',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
          <motion.select
            className="select-input"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="All">{t('attendancePage.allRooms')}</option>
            {[...new Set(students.map(s => s.roomNumber))].filter(Boolean).map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </motion.select>
          <motion.select
            className="select-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="All">{t('attendancePage.allStatus')}</option>
            <option value="Present">{t('attendancePage.present')}</option>
            <option value="Absent">{t('attendancePage.absent')}</option>
          </motion.select>
          <motion.button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilterDate('')
              setFilterRoom('All')
              setFilterStatus('All')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.625rem 1rem',
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <FiRefreshCw /> {t('attendancePage.refresh')}
          </motion.button>
        </div>

        <div className="toolbar-right">
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
            }}
          >
            <FiPlus /> {t('attendancePage.takeAttendance')}
          </motion.button>
        </div>
      </motion.div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ maxHeight: '80vh', overflowY: 'auto', maxWidth: '600px' }}
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem 1rem 0 0',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white' }}>✅ {t('attendancePage.takeAttendance')}</h2>
              <motion.button
                className="modal-close-btn"
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
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
              </motion.button>
            </motion.div>
            <div className="modal-body">
              <AttendanceForm
                students={students}
                onSubmit={handleSubmitAttendance}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading && <div>{t('attendancePage.loadingRecords')}</div>}
        <DataTable columns={columns} data={filteredAttendance} />
      </motion.div>
    </motion.div>
  )
}
