import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiHome, FiUsers, FiCreditCard, FiTrendingUp, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { getDashboardStats, getAllPGHostels } from '../../services/superAdminService'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pgHostels, setPgHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, pgHostelsResponse] = await Promise.all([
        getDashboardStats(),
        getAllPGHostels()
      ])

      if (statsResponse.status === 'success') {
        setStats(statsResponse.data)
      }

      if (pgHostelsResponse.status === 'success') {
        setPgHostels(pgHostelsResponse.data)
      }
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
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
        Loading dashboard...
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
            Super Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem' }}>
            Complete overview of all PG/Hostels and system statistics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Total PG/Hostels */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div style={{
                backgroundColor: '#dbeafe',
                padding: '0.75rem',
                borderRadius: '0.75rem',
              }}>
                <FiHome style={{ fontSize: '1.5rem', color: '#3b82f6' }} />
              </div>
            </div>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.25rem',
            }}>
              {stats?.totalPGHostels || 0}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total PG/Hostels
            </p>
          </motion.div>

          {/* Total Candidates */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div style={{
                backgroundColor: '#dcfce7',
                padding: '0.75rem',
                borderRadius: '0.75rem',
              }}>
                <FiUsers style={{ fontSize: '1.5rem', color: '#10b981' }} />
              </div>
            </div>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.25rem',
            }}>
              {stats?.totalStudents || 0}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total Candidates
            </p>
          </motion.div>

          {/* Recent Registrations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '0.75rem',
                borderRadius: '0.75rem',
              }}>
                <FiTrendingUp style={{ fontSize: '1.5rem', color: '#f59e0b' }} />
              </div>
            </div>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.25rem',
            }}>
              {stats?.recentRegistrations || 0}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              New This Month
            </p>
          </motion.div>
        </div>

        {/* Subscription Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <FiCreditCard /> Subscription Distribution
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {stats?.subscriptionStats && stats.subscriptionStats.length > 0 ? (
              stats.subscriptionStats.map((plan, index) => {
                // Dynamic colors for different plans
                const colors = [
                  { bg: '#f9fafb', border: '#6b7280', text: '#6b7280' },
                  { bg: '#eff6ff', border: '#3b82f6', text: '#3b82f6' },
                  { bg: '#f5f3ff', border: '#8b5cf6', text: '#8b5cf6' },
                  { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b' },
                  { bg: '#dcfce7', border: '#10b981', text: '#10b981' },
                  { bg: '#fee2e2', border: '#ef4444', text: '#ef4444' },
                ]
                const color = colors[index % colors.length]

                return (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: color.bg,
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${color.border}`,
                  }}>
                    <p style={{ color: color.text, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {plan.planName}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                      {plan.count}
                    </p>
                  </div>
                )
              })
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                No subscription plans available
              </p>
            )}
          </div>
        </motion.div>

        {/* PG/Hostels Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1.5rem',
          }}>
            All Registered PG/Hostels
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>PG/Hostel Name</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Manager</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Contact</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Candidates</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}>Plan</th>
                </tr>
              </thead>
              <tbody>
                {pgHostels.map((hostel, index) => (
                  <tr key={hostel.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                          {hostel.hostelName || 'N/A'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiMapPin size={12} /> {hostel.hostelAddress || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#374151' }}>
                      {hostel.name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <FiMail size={12} /> {hostel.email}
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiPhone size={12} /> {hostel.phone}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}>
                        {hostel.studentCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: `${getPlanColor(hostel.subscriptionPlan)}20`,
                        color: getPlanColor(hostel.subscriptionPlan),
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}>
                        {hostel.subscriptionPlan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
