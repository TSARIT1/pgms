import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiLock, FiUnlock, FiEye, FiTrash2, FiX } from 'react-icons/fi'
import { getAllPGHostels } from '../../services/superAdminService'
import { freezeAdminAccount, unfreezeAdminAccount } from '../../services/adminService'

export default function PGHostelsPage() {
  const [pgHostels, setPgHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, hostel: null })
  const [viewModal, setViewModal] = useState({ show: false, hostel: null })
  const [deleteModal, setDeleteModal] = useState({ show: false, hostel: null })

  useEffect(() => {
    fetchPGHostels()
  }, [])

  const fetchPGHostels = async () => {
    try {
      setLoading(true)
      const response = await getAllPGHostels()
      if (response.status === 'success') {
        setPgHostels(response.data)
      }
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFreezeAccount = async (hostelId) => {
    try {
      console.log('Attempting to freeze account:', hostelId)
      const response = await freezeAdminAccount(hostelId)
      console.log('Freeze response:', response)
      
      // Show success message
      alert('Account frozen successfully!')
      
      // Refresh the list
      await fetchPGHostels()
      setConfirmModal({ show: false, action: null, hostel: null })
    } catch (err) {
      console.error('Freeze error:', err)
      alert('Failed to freeze account: ' + err.message)
    }
  }

  const handleUnfreezeAccount = async (hostelId) => {
    try {
      console.log('Attempting to unfreeze account:', hostelId)
      const response = await unfreezeAdminAccount(hostelId)
      console.log('Unfreeze response:', response)
      
      // Show success message
      alert('Account unfrozen successfully!')
      
      // Refresh the list
      await fetchPGHostels()
      setConfirmModal({ show: false, action: null, hostel: null })
    } catch (err) {
      console.error('Unfreeze error:', err)
      alert('Failed to unfreeze account: ' + err.message)
    }
  }

  const handleDeleteAccount = async (hostelId) => {
    try {
      const { deleteAdmin } = await import('../../services/superAdminService')
      await deleteAdmin(hostelId)
      alert('Account deleted successfully!')
      await fetchPGHostels()
      setDeleteModal({ show: false, hostel: null })
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete account: ' + err.message)
    }
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'ENTERPRISE':
        return '#8b5cf6'
      case 'PREMIUM':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.25rem',
        color: '#6b7280',
      }}>
        Loading PG/Hostels...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.25rem',
        color: '#ef4444',
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '0.5rem',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}>
            Registered PG/Hostels
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem' }}>
            Total: {pgHostels.length} PG/Hostels
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                  <th style={tableHeaderStyle}>PG/Hostel Name</th>
                  <th style={tableHeaderStyle}>Manager</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Phone</th>
                  <th style={tableHeaderStyle}>Address</th>
                  <th style={tableHeaderStyle}>Referred By</th>
                  <th style={tableHeaderStyle}>Plan</th>
                  <th style={tableHeaderStyle}>Students</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgHostels.map((hostel, index) => (
                  <motion.tr
                    key={hostel.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: hostel.isFrozen ? '#fef2f2' : index % 2 === 0 ? '#f9fafb' : 'white',
                    }}
                  >
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {hostel.hostelName || 'N/A'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>{hostel.name}</td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMail size={14} style={{ color: '#667eea' }} />
                        {hostel.email}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiPhone size={14} style={{ color: '#667eea' }} />
                        {hostel.phone}
                      </div>
                    </td>
                    <td style={{...tableCellStyle, maxWidth: '200px'}}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {hostel.hostelAddress || 'N/A'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ color: '#6b7280', fontStyle: hostel.referredBy ? 'normal' : 'italic' }}>
                        {hostel.referredBy || 'Direct'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: `${getPlanColor(hostel.subscriptionPlan)}20`,
                        color: getPlanColor(hostel.subscriptionPlan),
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}>
                        {hostel.subscriptionPlan}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        fontWeight: '700',
                        color: '#166534',
                        fontSize: '1.125rem',
                      }}>
                        {hostel.studentCount}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      {hostel.isFrozen ? (
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}>
                          <FiLock size={12} /> FROZEN
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* View Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewModal({ show: true, hostel })}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FiEye size={14} />
                          View
                        </motion.button>

                        {/* Freeze/Unfreeze Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmModal({ 
                            show: true, 
                            action: hostel.isFrozen ? 'unfreeze' : 'freeze', 
                            hostel 
                          })}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: hostel.isFrozen ? '#10b981' : '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {hostel.isFrozen ? (
                            <>
                              <FiUnlock size={14} />
                              Unfreeze
                            </>
                          ) : (
                            <>
                              <FiLock size={14} />
                              Freeze
                            </>
                          )}
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteModal({ show: true, hostel })}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FiTrash2 size={14} />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {pgHostels.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
            }}>
              No PG/Hostels registered yet
            </div>
          )}
        </motion.div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            onClick={() => setViewModal({ show: false, hostel: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  PG/Hostel Details
                </h3>
                <button
                  onClick={() => setViewModal({ show: false, hostel: null })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '1.5rem',
                  }}
                >
                  <FiX />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <DetailRow label="PG/Hostel Name" value={viewModal.hostel?.hostelName || 'N/A'} />
                <DetailRow label="Manager Name" value={viewModal.hostel?.name} />
                <DetailRow label="Email" value={viewModal.hostel?.email} icon={<FiMail />} />
                <DetailRow label="Phone" value={viewModal.hostel?.phone} icon={<FiPhone />} />
                <DetailRow label="Address" value={viewModal.hostel?.hostelAddress || 'N/A'} icon={<FiMapPin />} />
                <DetailRow label="Referred By" value={viewModal.hostel?.referredBy || 'Direct Registration'} />
                
                {/* Subscription Details Section */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '2px solid #e5e7eb',
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '1rem',
                  }}>
                    Subscription Details
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <DetailRow 
                      label="Subscription Plan" 
                      value={
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: `${getPlanColor(viewModal.hostel?.subscriptionPlan)}20`,
                          color: getPlanColor(viewModal.hostel?.subscriptionPlan),
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                        }}>
                          {viewModal.hostel?.subscriptionPlan || 'BASIC'}
                        </span>
                      } 
                    />
                    <DetailRow 
                      label="Subscription Start Date" 
                      value={viewModal.hostel?.subscriptionStartDate 
                        ? new Date(viewModal.hostel.subscriptionStartDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      } 
                    />
                    <DetailRow 
                      label="Subscription End Date" 
                      value={viewModal.hostel?.subscriptionEndDate 
                        ? new Date(viewModal.hostel.subscriptionEndDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      } 
                    />
                    <DetailRow 
                      label="Payment Amount" 
                      value={
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#10b981',
                        }}>
                          {viewModal.hostel?.subscriptionPlan === 'ENTERPRISE' 
                            ? '₹5,000' 
                            : viewModal.hostel?.subscriptionPlan === 'PREMIUM' 
                            ? '₹3,000' 
                            : '₹0 (Free)'}
                        </span>
                      } 
                    />
                  </div>
                </div>

                <DetailRow label="Total Candidates" value={viewModal.hostel?.studentCount} />
                <DetailRow 
                  label="Account Status" 
                  value={
                    viewModal.hostel?.isFrozen ? (
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <FiLock size={14} /> FROZEN
                      </span>
                    ) : (
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}>
                        ACTIVE
                      </span>
                    )
                  } 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Freeze/Unfreeze Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            }}
            onClick={() => setConfirmModal({ show: false, action: null, hostel: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>
                {confirmModal.action === 'freeze' ? 'Freeze Account?' : 'Unfreeze Account?'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {confirmModal.action === 'freeze' 
                  ? `Are you sure you want to freeze "${confirmModal.hostel?.hostelName}"? The admin will not be able to login.`
                  : `Are you sure you want to unfreeze "${confirmModal.hostel?.hostelName}"? The admin will be able to login again.`
                }
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, hostel: null })}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.action === 'freeze') {
                      handleFreezeAccount(confirmModal.hostel.id)
                    } else {
                      handleUnfreezeAccount(confirmModal.hostel.id)
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: confirmModal.action === 'freeze' ? '#ef4444' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {confirmModal.action === 'freeze' ? 'Freeze' : 'Unfreeze'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            }}
            onClick={() => setDeleteModal({ show: false, hostel: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ef4444' }}>
                Delete Account?
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Are you sure you want to permanently delete "{deleteModal.hostel?.hostelName}"? This action cannot be undone and all associated data will be lost.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setDeleteModal({ show: false, hostel: null })}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAccount(deleteModal.hostel.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper component for detail rows in view modal
function DetailRow({ label, value, icon }) {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.95rem',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {icon && <span style={{ color: '#667eea' }}>{icon}</span>}
        {value}
      </div>
    </div>
  )
}

// Table styles
const tableHeaderStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.875rem',
  fontWeight: '700',
  color: 'white',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tableCellStyle = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: '#374151',
}
