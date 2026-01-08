import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import StatCard from '../../components/common/StatCard'
import {
  FiUsers,
  FiTrendingUp,
  FiGrid,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiSearch,
} from 'react-icons/fi'
import { getAllStudents } from '../../services/studentService'
import { getAllStaff } from '../../services/staffService'
import { getAllRooms } from '../../services/roomService'
import paymentService from '../../services/paymentService'
import attendanceService from '../../services/attendanceService'
import SubscriptionModal from '../../components/subscription/SubscriptionModal'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { admin, refreshAdminData } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    presentToday: 0,
    absentToday: 0,
    fullRooms: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ candidates: [], rooms: [], staff: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [allData, setAllData] = useState({ candidates: [], rooms: [], staff: [] })
  const [viewingCandidate, setViewingCandidate] = useState(null)
  const [viewingRoom, setViewingRoom] = useState(null)
  const [viewingStaff, setViewingStaff] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const modalHasBeenShownRef = React.useRef(false)

  // Check if user needs to pay for their selected plan
  useEffect(() => {
    if (admin) {
      // If user already has a subscription end date, they have an active subscription
      // Don't show the modal
      if (admin.subscriptionEndDate) {
        console.log('[Dashboard] User has active subscription, skipping payment modal')
        return
      }
      
      // Only show modal once per session
      if (modalHasBeenShownRef.current) {
        console.log('[Dashboard] Modal already shown this session, skipping')
        return
      }
      
      // Three scenarios where we need to show the modal:
      // 1. User selected a PAID plan -> has planName but NO endDate -> Show payment modal
      // 2. User didn't select a plan -> NO planName -> Show payment modal to select a plan
      
      const hasPaidPlanNotPaid = admin.subscriptionPlan && !admin.subscriptionEndDate
      const hasNoPlan = !admin.subscriptionPlan
      const needsPaymentModal = hasPaidPlanNotPaid || hasNoPlan
      
      console.log('[Dashboard] Payment Check:', {
        planName: admin.subscriptionPlan,
        endDate: admin.subscriptionEndDate,
        hasPaidPlanNotPaid,
        hasNoPlan,
        needsPaymentModal,
        modalAlreadyShown: modalHasBeenShownRef.current
      })
      
      if (needsPaymentModal) {
        // Auto-open payment modal after a short delay
        setTimeout(() => {
          console.log('[Dashboard] Opening payment modal')
          setShowPaymentModal(true)
          modalHasBeenShownRef.current = true
        }, 1000)
      }
    }
  }, [admin])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel - attendance is optional
      const [studentsResp, staffResp, roomsResp, paymentsResp, attendanceResp] = await Promise.all([
        getAllStudents(),
        getAllStaff(),
        getAllRooms(),
        paymentService.getAllPayments(),
        attendanceService.getAllAttendance().catch(() => ({ data: [] })) // Make attendance optional
      ])

      const students = studentsResp.data || studentsResp || []
      const staff = staffResp.data || staffResp || []
      const rooms = roomsResp.data || roomsResp || []
      const payments = paymentsResp.data || paymentsResp || []
      const attendance = attendanceResp.data || attendanceResp || []

      // Calculate occupied and available rooms
      const occupiedRooms = rooms.filter(room => 
        room.status && (room.status.toUpperCase() === 'OCCUPIED' || room.occupiedBeds > 0)
      ).length
      
      const availableRooms = rooms.filter(room => 
        !room.status || room.status.toUpperCase() === 'AVAILABLE' || room.occupiedBeds === 0
      ).length

      // Calculate full rooms (occupiedBeds >= capacity)
      const fullRooms = rooms.filter(room => 
        room.occupiedBeds >= room.capacity
      ).length

      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, payment) => {
        const amount = payment.amount || 0
        return sum + Number(amount)
      }, 0)

      // Calculate this month's revenue
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const thisMonthRevenue = payments.reduce((sum, payment) => {
        const paymentDate = new Date(payment.paymentDate)
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          const amount = payment.amount || 0
          return sum + Number(amount)
        }
        return sum
      }, 0)

      // Calculate today's attendance
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendance.filter(record => {
        const recordDate = record.date
        return recordDate === today
      })

      const presentToday = todayAttendance.filter(record => 
        record.status && record.status.toUpperCase() === 'PRESENT'
      ).length

      const absentToday = todayAttendance.filter(record => 
        record.status && record.status.toUpperCase() === 'ABSENT'
      ).length

      setStats({
        totalStudents: students.length,
        totalStaff: staff.length,
        totalRooms: rooms.length,
        occupiedRooms: occupiedRooms,
        availableRooms: availableRooms,
        totalRevenue: totalRevenue,
        thisMonthRevenue: thisMonthRevenue,
        presentToday: presentToday,
        absentToday: absentToday,
        fullRooms: fullRooms,
      })

      // Store all data for search
      setAllData({
        candidates: students,
        rooms: rooms,
        staff: staff,
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setShowSearchResults(false)
      return
    }

    const lowerQuery = query.toLowerCase()
    
    const candidateResults = allData.candidates.filter(c => 
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query) ||
      c.roomNumber?.toLowerCase().includes(lowerQuery)
    )

    const roomResults = allData.rooms.filter(r =>
      r.roomNumber?.toLowerCase().includes(lowerQuery) ||
      r.type?.toLowerCase().includes(lowerQuery)
    )

    const staffResults = allData.staff.filter(s =>
      s.username?.toLowerCase().includes(lowerQuery) ||
      s.email?.toLowerCase().includes(lowerQuery) ||
      s.phone?.includes(query) ||
      s.role?.toLowerCase().includes(lowerQuery)
    )

    setSearchResults({
      candidates: candidateResults,
      rooms: roomResults,
      staff: staffResults,
    })
    setShowSearchResults(true)
  }

  const statsRow1 = [
    { icon: FiUsers, value: loading ? '...' : stats.totalStudents.toString(), label: t('dashboard.totalStudents'), color: 'blue' },
    { icon: FiTrendingUp, value: loading ? '...' : stats.totalStaff.toString(), label: t('dashboard.totalStaff'), color: 'green' },
    { icon: FiGrid, value: loading ? '...' : stats.totalRooms.toString(), label: t('dashboard.totalRooms'), color: 'teal' },
    { icon: FiCheckCircle, value: loading ? '...' : stats.occupiedRooms.toString(), label: t('dashboard.occupiedRooms'), color: 'orange' },
  ]

  const statsRow2 = [
    { icon: FiAlertCircle, value: loading ? '...' : stats.availableRooms.toString(), label: t('dashboard.availableRooms'), color: 'green' },
    { icon: FiDollarSign, value: loading ? '...' : `₹${stats.thisMonthRevenue.toLocaleString()}`, label: 'Monthly Revenue', color: 'blue' },
    { icon: FiClock, value: loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`, label: t('dashboard.totalRevenue'), color: 'blue' },
    { icon: FiGrid, value: loading ? '...' : stats.availableRooms.toString(), label: 'Available Rooms', color: 'orange' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated Header */}
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
        <h1 className="page-title" style={{ color: 'white' }}>{t('dashboard.title')}</h1>
        <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('dashboard.welcomeMessage')}</p>
      </motion.div>

      {/* Global Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '1.25rem' }} />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Search Results - Inline Display */}
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '2px solid #e5e7eb',
            }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                🔍 Search Results for "{searchQuery}"
              </h3>
              <motion.button
                onClick={() => {
                  setSearchQuery('')
                  setShowSearchResults(false)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
              >
                Clear
              </motion.button>
            </div>

            {/* Candidates Results */}
            {searchResults.candidates.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                  👥 Candidates ({searchResults.candidates.length})
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {searchResults.candidates.map((candidate, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setViewingCandidate(candidate)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '0.75rem',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#111827', marginBottom: '0.25rem' }}>{candidate.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                        📧 {candidate.email} • 📞 {candidate.phone} • 🏠 Room {candidate.roomNumber}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms Results */}
            {searchResults.rooms.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                  🏠 Rooms ({searchResults.rooms.length})
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {searchResults.rooms.map((room, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setViewingRoom(room)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '0.75rem',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#111827', marginBottom: '0.25rem' }}>Room {room.roomNumber}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          Type: {room.type} • Capacity: {room.capacity} • Occupied: {room.occupiedBeds} • Rent: ₹{room.rent}
                        </div>
                      </div>
                      <div style={{ padding: '0.25rem 0.75rem', background: room.status === 'AVAILABLE' ? '#d1fae5' : '#fee2e2', color: room.status === 'AVAILABLE' ? '#065f46' : '#991b1b', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {room.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Results */}
            {searchResults.staff.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                  👨‍💼 Staff ({searchResults.staff.length})
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {searchResults.staff.map((staff, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setViewingStaff(staff)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '0.75rem',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#111827', marginBottom: '0.25rem' }}>{staff.username}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          📧 {staff.email} • 📞 {staff.phone}
                        </div>
                      </div>
                      <div style={{ padding: '0.25rem 0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {staff.role}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.candidates.length === 0 && searchResults.rooms.length === 0 && searchResults.staff.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>No results found</div>
                <div style={{ fontSize: '0.875rem' }}>Try searching with a different keyword</div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Candidate View Modal */}
      {viewingCandidate && (
        <motion.div
          className="modal-overlay"
          onClick={() => setViewingCandidate(null)}
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
            style={{ maxWidth: '600px' }}
          >
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem 1rem 0 0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                👤 Candidate Information
              </h2>
              <motion.button onClick={() => setViewingCandidate(null)} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '0.5rem', width: '2rem', height: '2rem' }}>
                ✕
              </motion.button>
            </div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Name</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.name}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Age</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.age || '-'}</div></div>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Gender</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.gender || '-'}</div></div>
                </div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Email</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.email}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Phone</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.phone}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Room Number</label><div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontWeight: '600', color: '#1e40af' }}>{viewingCandidate.roomNumber}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Address</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingCandidate.address || '-'}</div></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Room View Modal */}
      {viewingRoom && (
        <motion.div
          className="modal-overlay"
          onClick={() => setViewingRoom(null)}
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
            style={{ maxWidth: '600px' }}
          >
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem 1rem 0 0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                🏠 Room Information
              </h2>
              <motion.button onClick={() => setViewingRoom(null)} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '0.5rem', width: '2rem', height: '2rem' }}>
                ✕
              </motion.button>
            </div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Room Number</label><div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontWeight: '600', color: '#1e40af' }}>{viewingRoom.roomNumber}</div></div>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Type</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingRoom.type}</div></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Capacity</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingRoom.capacity}</div></div>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Occupied</label><div style={{ padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', fontWeight: '600', color: '#92400e' }}>{viewingRoom.occupiedBeds}</div></div>
                  <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Rent</label><div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontWeight: '600', color: '#166534' }}>₹{viewingRoom.rent}</div></div>
                </div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Status</label><div style={{ padding: '0.75rem 1rem', background: viewingRoom.status === 'AVAILABLE' ? '#d1fae5' : '#fee2e2', border: viewingRoom.status === 'AVAILABLE' ? '1px solid #a7f3d0' : '1px solid #fecaca', borderRadius: '0.5rem', fontWeight: '600', color: viewingRoom.status === 'AVAILABLE' ? '#065f46' : '#991b1b' }}>{viewingRoom.status}</div></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Staff View Modal */}
      {viewingStaff && (
        <motion.div
          className="modal-overlay"
          onClick={() => setViewingStaff(null)}
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
            style={{ maxWidth: '600px' }}
          >
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem 1rem 0 0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                👨‍💼 Staff Information
              </h2>
              <motion.button onClick={() => setViewingStaff(null)} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '0.5rem', width: '2rem', height: '2rem' }}>
                ✕
              </motion.button>
            </div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Username</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingStaff.username}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Email</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingStaff.email}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Phone</label><div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>{viewingStaff.phone || '-'}</div></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Role</label><div style={{ padding: '0.75rem 1rem', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontWeight: '600', color: '#1e40af' }}>{viewingStaff.role}</div></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Row 1 */}
      <motion.div
        className="grid-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '2rem' }}
      >
        {statsRow1.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <StatCard
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Row 2 */}
      <motion.div
        className="grid-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statsRow2.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <StatCard
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Subscription Payment Modal */}
      <SubscriptionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentPlan={admin?.subscriptionPlan || ''}
        onSelectPlan={async (planName) => {
          console.log('[Dashboard] Payment completed for plan:', planName)
          // Refresh admin data to get updated subscription info
          await refreshAdminData()
          setShowPaymentModal(false)
        }}
        adminData={admin}
      />
    </motion.div>
  )
}
