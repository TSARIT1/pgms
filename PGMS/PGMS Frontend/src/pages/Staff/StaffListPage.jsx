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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          color: 'white',
          marginBottom: '2.5rem',
          boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Decoration Blob */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1 
            className="page-title" 
            style={{ 
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('staff.title')}
          </motion.h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
            Manage your team members and oversee staff operations efficiently.
          </p>
        </div>
        <motion.div 
          style={{ 
            fontSize: '5rem', 
            opacity: 0.15,
            position: 'relative',
            zIndex: 1,
            marginRight: '1rem',
          }}
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <FiUsers />
        </motion.div>
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
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '1rem 1rem 0 0',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                {editingStaff ? `✏️ ${t('staff.editStaff')}` : `➕ ${t('staff.addStaff')}`}
              </h2>
              <motion.button 
                className="modal-close-btn" 
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                ✕
              </motion.button>
            </motion.div>
            <div className="modal-body" style={{ padding: '2rem' }}>
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            onClick={loadStaff}
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'white',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
            >
              <FiRefreshCw />
            </motion.div>
            {loading ? t('loading') : t('refresh')}
          </motion.button>
        </div>

        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setEditingStaff(null)
            setShowForm(true)
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '0.75rem 1.5rem',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
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
