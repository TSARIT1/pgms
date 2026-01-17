import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiSearch, FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiEye, FiUsers } from 'react-icons/fi'
import DataTable from '../../components/common/DataTable'
import StudentForm from './StudentForm'
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService'
import paymentService from '../../services/paymentService'
import { getAllRooms } from '../../services/roomService'

// We'll load students (tenants) from backend

export default function StudentListPage() {
  const { t } = useTranslation()
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentPayments, setStudentPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [roomDetails, setRoomDetails] = useState(null)
  const [allRooms, setAllRooms] = useState([])

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  useEffect(() => {
    loadStudents()
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const resp = await getAllRooms()
      if (resp && resp.data) {
        setAllRooms(resp.data)
      }
    } catch (err) {
      console.error('Error loading rooms:', err)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await getAllStudents()
      if (resp && resp.data) {
        const mapped = resp.data.map(t => ({
          ID: t.id,
          Name: t.name,
          Age: t.age,
          Gender: t.gender || '-',
          Room: t.roomNumber,
          Admission: t.joiningDate,
          Contact: t.phone,
          Email: t.email,
          Address: t.address,
          'Identity Proof': t.identityProofType || 'Not Specified',
          IdentityProofType: t.identityProofType,
          __raw: t, // Contains all fields including identityProof and identityProofType
        }))
        setStudents(mapped)
      }
    } catch (err) {
      console.error('Error loading tenants:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentData) => {
    try {
      // studentData already mapped to backend tenant shape by StudentForm
      if (editingStudent) {
        const id = (editingStudent.__raw && editingStudent.__raw.id) || editingStudent.ID
        await updateStudent(id, studentData)
        setEditingStudent(null)
      } else {
        await createStudent(studentData)
      }
      await loadStudents()
      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error saving tenant:', err)
      // If backend returned structured validation errors, apiHelper sets err.details
      if (err && err.details) {
        // err.details may be an object map of field->message
        if (typeof err.details === 'object') {
          console.log('Validation Details:', err.details)
          const parts = Object.keys(err.details).map(k => `${k}: ${err.details[k]}`)
          setError(parts.join(' | '))
        } else {
          console.log('Validation Error:', err.details)
          setError(String(err.details))
        }
      } else {
        setError(err.message || 'Failed to save student')
      }
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleView = async (student) => {
    setViewingStudent(student)
    // Fetch payment history for this student
    if (student.__raw && student.__raw.id) {
      setLoadingPayments(true)
      try {
        const payments = await paymentService.getPaymentsByTenant(student.__raw.id)
        setStudentPayments(payments || [])
      } catch (err) {
        console.error('Error loading student payments:', err)
        setStudentPayments([])
      } finally {
        setLoadingPayments(false)
      }
    }
    // Find room details
    if (student.Room && allRooms.length > 0) {
      const room = allRooms.find(r => r.roomNumber === student.Room)
      setRoomDetails(room || null)
    } else {
      setRoomDetails(null)
    }
  }

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student ${student.Name}?`)) return
    try {
      const id = (student.__raw && student.__raw.id) || student.ID
      await deleteStudent(id)
      await loadStudents()
      setError(null)
    } catch (err) {
      console.error('Error deleting tenant:', err)
      setError(err.message || 'Failed to delete student')
    }
  }

  const handleRefresh = () => {
    setSearchTerm('')
  }

  const handleEditSelected = () => {
    if (selectedStudents.length === 1) {
      setEditingStudent(selectedStudents[0])
      setShowForm(true)
    } else if (selectedStudents.length === 0) {
      alert('Please select a student to edit')
    } else {
      alert('Please select only one student to edit')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to delete')
      return
    }
    if (window.confirm(`Delete ${selectedStudents.length} selected student(s)?`)) {
      try {
        // Delete each selected student from backend
        const deletePromises = selectedStudents.map(async (student) => {
          const id = (student.__raw && student.__raw.id) || student.ID
          return deleteStudent(id)
        })
        
        await Promise.all(deletePromises)
        
        // Reload students after deletion
        await loadStudents()
        setSelectedStudents([])
        setError(null)
      } catch (err) {
        console.error('Error deleting students:', err)
        setError(err.message || 'Failed to delete selected students')
      }
    }
  }

  const columns = ['ID', 'Name', 'Age', 'Gender', 'Room', 'Admission', 'Contact', 'Email', 'Identity Proof']

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
          <h1 className="page-title" style={{ color: 'white' }}>{t('students.title')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('students.title')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiUsers />
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
          <motion.div
            style={{ position: 'relative', flex: 1, minWidth: '200px' }}
            whileFocus={{ scale: 1.02 }}
          >
            <motion.input
              type="text"
              className="search-input"
              placeholder={t('students.searchStudent')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                paddingLeft: '2.5rem',
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
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.125rem' }} />
          </motion.div>

          <motion.button 
            className="btn btn-primary btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.625rem 1rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
            <FiSearch /> {t('common.search')}
          </motion.button>

          <motion.button 
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
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
            <FiRefreshCw /> {t('common.filter')}
          </motion.button>

        </div>

        <div className="toolbar-right">
          <motion.button
            className="btn btn-primary"
            onClick={() => {
              setEditingStudent(null)
              setShowForm(true)
            }}
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
            <FiPlus /> {t('students.addStudent')}
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
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem 1rem 0 0',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white' }}>
                {editingStudent ? `✏️ ${t('students.editStudent')}` : `➕ ${t('students.addStudent')}`}
              </h2>
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
              <StudentForm
                student={editingStudent && (editingStudent.__raw ? {
                  Name: editingStudent.__raw.name,
                  Age: editingStudent.__raw.age,
                  Gender: editingStudent.__raw.gender,
                  Room: editingStudent.__raw.roomNumber,
                  Admission: editingStudent.__raw.joiningDate,
                  Contact: editingStudent.__raw.phone,
                  Email: editingStudent.__raw.email,
                  Address: editingStudent.__raw.address,
                  IdentityProofType: editingStudent.__raw.identityProofType,
                } : editingStudent)}
                onSubmit={(data) => {
                  handleAddStudent(data)
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* View Modal */}
      {viewingStudent && (
        <motion.div 
          className="modal-overlay" 
          onClick={() => setViewingStudent(null)}
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
            style={{ maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '1rem 1rem 0 0',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                👤 Candidate Information
              </h2>
              <motion.button 
                className="modal-close-btn" 
                onClick={() => setViewingStudent(null)}
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
            <div className="modal-body" style={{ padding: '2rem' }}>
              {/* Personal Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  📋 Personal Information
                </h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>ID</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.ID}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Name</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Name}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Age</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Age}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Gender</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Gender || '-'}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Admission Date</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Admission}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Contact</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Contact}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Email</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingStudent.Email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Address</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                      {viewingStudent.Address || 'N/A'}
                    </div>
                  </div>

                  {/* Identity Proof Type */}
                  {viewingStudent.__raw && viewingStudent.__raw.identityProofType && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Identity Proof Type 🆔</label>
                      <div style={{ 
                        padding: '0.75rem 1rem', 
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                        border: '2px solid #3b82f6', 
                        borderRadius: '0.5rem', 
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {viewingStudent.__raw.identityProofType === 'Aadhar Card' ? '🪪' : 
                           viewingStudent.__raw.identityProofType === 'PAN Card' ? '💳' :
                           viewingStudent.__raw.identityProofType === 'Voter ID' ? '🗳️' : '📋'}
                        </span>
                        {viewingStudent.__raw.identityProofType}
                      </div>
                    </div>
                  )}

                  {/* Identity Proof Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Identity Proof 📄</label>
                    {viewingStudent.__raw && viewingStudent.__raw.identityProof ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Open identity proof in new window
                          const identityProof = viewingStudent.__raw.identityProof
                          // Detect if it's a PDF or image
                          const isPDF = identityProof.startsWith('JVBER') // PDF base64 starts with 'JVBER'
                          const mimeType = isPDF ? 'application/pdf' : 'image/jpeg'
                          
                          // Create blob and open in new window
                          const byteCharacters = atob(identityProof)
                          const byteNumbers = new Array(byteCharacters.length)
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i)
                          }
                          const byteArray = new Uint8Array(byteNumbers)
                          const blob = new Blob([byteArray], { type: mimeType })
                          const url = URL.createObjectURL(blob)
                          window.open(url, '_blank')
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FiEye /> View Identity Proof
                      </motion.button>
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#991b1b' }}>
                        ⚠️ No identity proof uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  🏠 Room Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Room Number</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#1e40af' }}>
                      {viewingStudent.Room || 'Not Assigned'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Room Rent</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#166534' }}>
                      {roomDetails && roomDetails.rent ? `₹${roomDetails.rent}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Due Payment</label>
                    <div style={{ padding: '0.75rem 1rem', background: roomDetails && roomDetails.rent && studentPayments.length > 0 && studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) < roomDetails.rent ? '#fef2f2' : '#f0fdf4', border: roomDetails && roomDetails.rent && studentPayments.length > 0 && studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) < roomDetails.rent ? '1px solid #fecaca' : '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: roomDetails && roomDetails.rent && studentPayments.length > 0 && studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) < roomDetails.rent ? '#991b1b' : '#166534' }}>
                      {(() => {
                        if (!roomDetails || !roomDetails.rent) return 'N/A'
                        const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
                        const due = roomDetails.rent - totalPaid
                        return due > 0 ? `₹${due}` : '₹0'
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History Section */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  💳 Payment History
                </h3>
                {loadingPayments ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Loading payment history...
                  </div>
                ) : studentPayments.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Amount</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments.map((payment, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem' }}>{payment.paymentDate || payment.Date || '-'}</td>
                            <td style={{ padding: '0.75rem', fontWeight: '600', color: '#059669' }}>₹{payment.amount || payment.Amount || 0}</td>
                            <td style={{ padding: '0.75rem' }}>{payment.method || payment.Method || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '0.5rem', color: '#6b7280' }}>
                    No payment records found
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => {
                    setViewingStudent(null)
                    handleEdit(viewingStudent)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  Edit Candidate
                </motion.button>
                <motion.button
                  onClick={() => setViewingStudent(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={filteredStudents}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>


    </motion.div>
  )
}
