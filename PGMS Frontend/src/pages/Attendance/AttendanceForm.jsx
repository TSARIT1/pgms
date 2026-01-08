import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'

export default function AttendanceForm({ students, onSubmit, selectedDate }) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0])
  const [presentStudents, setPresentStudents] = useState([])

  const toggleStudent = (studentName) => {
    if (presentStudents.includes(studentName)) {
      // Remove from present list
      setPresentStudents(presentStudents.filter(name => name !== studentName))
    } else {
      // Add to present list
      setPresentStudents([...presentStudents, studentName])
    }
  }

  const markAllPresent = () => {
    setPresentStudents(students.map(s => s.name))
  }

  const markAllAbsent = () => {
    setPresentStudents([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create attendance list for all students
    const attendanceList = students.map(student => ({
      studentName: student.name,
      roomNumber: student.roomNumber || '',
      date,
      status: presentStudents.includes(student.name) ? 'Present' : 'Absent',
      notes: ''
    }))

    onSubmit(attendanceList)
  }

  const presentCount = presentStudents.length
  const absentCount = students.length - presentStudents.length

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Date Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#111827' }}>
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
          }}
        />
      </div>

      {/* Summary */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        background: '#f9fafb', 
        borderRadius: '0.5rem',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{presentCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Present</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{absentCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Absent</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{students.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total</div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <motion.button
          type="button"
          onClick={markAllPresent}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Mark All Present
        </motion.button>
        <motion.button
          type="button"
          onClick={markAllAbsent}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Clear All
        </motion.button>
      </div>

      {/* Student Checklist */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>
          Mark Present Students (Click to select)
        </label>
      </div>

      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem'
      }}>
        {students.map((student, index) => {
          const isPresent = presentStudents.includes(student.name)
          
          return (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleStudent(student.name)}
              style={{
                padding: '1rem',
                borderBottom: index < students.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                background: isPresent ? '#f0fdf4' : 'white',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ 
                background: isPresent ? '#dcfce7' : '#f9fafb',
                scale: 1.01
              }}
            >
              {/* Checkbox */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '0.375rem',
                  border: isPresent ? 'none' : '2px solid #d1d5db',
                  background: isPresent 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'white',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0
                }}
              >
                {isPresent && <FiCheck strokeWidth={3} />}
              </motion.div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '0.95rem'
                }}>
                  {student.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Room: {student.roomNumber || 'N/A'}
                </div>
              </div>

              {isPresent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    borderRadius: '0.375rem',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  PRESENT
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Submit Attendance ({presentCount} Present, {absentCount} Absent)
      </motion.button>
    </motion.form>
  )
}
