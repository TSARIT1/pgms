import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi'
import DataTable from '../../components/common/DataTable'
import StaffForm from './StaffForm'
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../services/staffService'


export default function StaffListPage() {
  const { t } = useTranslation()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState([])

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const resp = await getAllStaff()
      if (resp && resp.data) {
        // Map backend fields (lowercase) to UI table keys (capitalized) expected by DataTable
        const mapped = resp.data.map(s => ({
          UserID: s.id ?? s.UserID,
          Username: s.username ?? s.Username,
          Email: s.email ?? s.Email,
          Phone: s.phone ?? s.Phone ?? '-',
          Role: s.role ?? s.Role,
          'Created Date': s.createdAt ? new Date(s.createdAt).toLocaleString() : (s.createdDate || '-'),
          // keep original object for edit/delete reference
          __raw: s,
        }))
        setStaff(mapped)
      }
      setError(null)
    } catch (err) {
      console.error('Error loading staff:', err)
      setError(err.message || 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async (staffData) => {
    try {
      // Map UI form fields (maybe capitalized) to backend expected keys
      const payload = {
        username: staffData.Username ?? staffData.username,
        email: staffData.Email ?? staffData.email,
        phone: staffData.Phone ?? staffData.phone,
        role: staffData.Role ?? staffData.role,
      }

      if (editingStaff) {
        const id = (editingStaff.__raw && editingStaff.__raw.id) || editingStaff.id || editingStaff.UserID
        await updateStaff(id, payload)
      } else {
        await createStaff(payload)
      }
      setEditingStaff(null)
      await loadStaff()
      setError(null)
    } catch (err) {
      console.error('Error saving staff:', err)
      setError(err.message || 'Failed to save staff')
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setShowForm(true)
  }

  const handleDelete = async (staffMember) => {
    if (!window.confirm(`Delete staff member ${staffMember.Username}?`)) return
    try {
      const id = staffMember.id ?? staffMember.UserID
      await deleteStaff(id)
      await loadStaff()
      setError(null)
    } catch (err) {
      console.error('Error deleting staff:', err)
      setError(err.message || 'Failed to delete staff')
    }
  }

  const handleResetPassword = () => {
    if (selectedStaff.length === 0) {
      alert('Please select staff member(s) to reset password')
      return
    }
    if (window.confirm(`Reset password for ${selectedStaff.length} staff member(s)?`)) {
      alert('Password reset emails sent successfully!')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedStaff.length === 0) {
      alert('Please select staff member(s) to delete')
      return
    }
    if (!window.confirm(`Delete ${selectedStaff.length} selected staff member(s)?`)) return
    try {
      for (const s of selectedStaff) {
        const id = s.id ?? s.UserID
        await deleteStaff(id)
      }
      setSelectedStaff([])
      await loadStaff()
      setError(null)
    } catch (err) {
      console.error('Error deleting selected staff:', err)
      setError(err.message || 'Failed to delete selected staff')
    }
  }

  const columns = ['UserID', 'Username', 'Email', 'Phone', 'Role', 'Created Date']

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
          <h1 className="page-title" style={{ color: 'white' }}>{t('staff.title')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('staff.title')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiUsers />
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
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem 1rem 0 0',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white' }}>
                {editingStaff ? `✏️ ${t('staff.editStaff')}` : `➕ ${t('staff.addStaff')}`}
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
              <StaffForm
                staff={editingStaff}
                onSubmit={async (data) => {
                  await handleAddStaff(data)
                  setShowForm(false)
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div 
        className="toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ 
          justifyContent: 'flex-end',
          marginBottom: '2rem',
        }}
      >
        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setEditingStaff(null)
            setShowForm(true)
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '0.75rem 1.5rem',
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
          <FiPlus /> {t('staff.addStaff')}
        </motion.button>
      </motion.div>

      {/* Data Table */}
      {loading ? (
        <motion.div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{t('common.loading')}</motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={staff}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      )}


    </motion.div>
  )
}
