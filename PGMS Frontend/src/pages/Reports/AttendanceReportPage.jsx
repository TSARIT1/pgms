import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiArrowLeft, FiCalendar } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getAllStudents } from '../../services/studentService'
import attendanceService from '../../services/attendanceService'
import { useTranslation } from 'react-i18next'

export default function AttendanceReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsResp, attendanceResp] = await Promise.all([
        getAllStudents(),
        attendanceService.getAllAttendance()
      ])

      setStudents(studentsResp.data || studentsResp || [])
      setAttendance(attendanceResp.data || attendanceResp || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique dates from attendance
  const dates = [...new Set(attendance.map(a => a.date))].sort().reverse()

  const getStudentAttendance = (student) => {
    const studentRecords = attendance.filter(a => a.studentName === student.name)
    
    const presentCount = studentRecords.filter(a => a.status?.toUpperCase() === 'PRESENT').length
    const absentCount = studentRecords.filter(a => a.status?.toUpperCase() === 'ABSENT').length
    const totalDays = studentRecords.length
    const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0

    // Get recent attendance (last 7 days)
    const recentRecords = studentRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)

    return {
      ...student,
      presentCount,
      absentCount,
      totalDays,
      percentage: Number(percentage),
      recentRecords,
      lastAttendance: studentRecords.length > 0 
        ? studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null
    }
  }

  const studentsWithAttendance = students
    .map(getStudentAttendance)
    .filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filterDate === 'All') return matchesSearch
      
      // Filter by specific date
      const hasRecordOnDate = student.recentRecords.some(r => r.date === filterDate)
      return matchesSearch && hasRecordOnDate
    })

  const totalPresent = studentsWithAttendance.reduce((sum, s) => sum + s.presentCount, 0)
  const totalAbsent = studentsWithAttendance.reduce((sum, s) => sum + s.absentCount, 0)
  const avgAttendance = studentsWithAttendance.length > 0
    ? (studentsWithAttendance.reduce((sum, s) => sum + s.percentage, 0) / studentsWithAttendance.length).toFixed(1)
    : 0

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
          <h1 className="page-title" style={{ color: 'white', margin: 0 }}>{t('attendanceReport.title')}</h1>
        </div>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {t('attendanceReport.subtitle')}
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
            placeholder={t('attendanceReport.searchPlaceholder')}
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
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            minWidth: '150px',
          }}
        >
          <option value="All">{t('attendanceReport.allDates')}</option>
          {dates.slice(0, 30).map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </option>
          ))}
        </select>
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
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{avgAttendance}%</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('attendanceReport.averageAttendance')}</div>
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
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{totalPresent}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('attendanceReport.totalPresent')}</div>
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
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{totalAbsent}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('attendanceReport.totalAbsent')}</div>
        </motion.div>
      </div>

      {/* Attendance Table */}
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
          <h3 style={{ margin: 0, color: '#111827' }}>{t('attendanceReport.studentAttendanceDetails')}</h3>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>{t('attendanceReport.loading')}</div>
        ) : studentsWithAttendance.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{t('attendanceReport.noStudentsFound')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.student')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.room')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.totalDays')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.present')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.absent')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.percentage')}</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{t('attendanceReport.lastRecord')}</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithAttendance
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((student, index) => (
                    <motion.tr
                      key={student.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                      whileHover={{ background: '#f9fafb' }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{student.email}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{student.roomNumber || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#374151', fontWeight: '600' }}>{student.totalDays}</td>
                      <td style={{ padding: '1rem', color: '#10b981', fontWeight: '600' }}>{student.presentCount}</td>
                      <td style={{ padding: '1rem', color: '#ef4444', fontWeight: '600' }}>{student.absentCount}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            flex: 1,
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            maxWidth: '100px'
                          }}>
                            <div style={{
                              width: `${student.percentage}%`,
                              height: '100%',
                              background: student.percentage >= 75 ? '#10b981' : student.percentage >= 50 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ 
                            fontWeight: '700',
                            color: student.percentage >= 75 ? '#10b981' : student.percentage >= 50 ? '#f59e0b' : '#ef4444',
                            minWidth: '50px'
                          }}>
                            {student.percentage}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {student.lastAttendance ? (
                          <div>
                            <div style={{ 
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: student.lastAttendance.status?.toUpperCase() === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                              color: student.lastAttendance.status?.toUpperCase() === 'PRESENT' ? '#059669' : '#dc2626',
                              marginBottom: '0.25rem'
                            }}>
                              {student.lastAttendance.status}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FiCalendar size={12} />
                              {new Date(student.lastAttendance.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('attendanceReport.noRecords')}</span>
                        )}
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
