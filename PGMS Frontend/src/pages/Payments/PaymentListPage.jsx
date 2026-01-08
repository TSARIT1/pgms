import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiPlus, FiMail, FiDollarSign } from 'react-icons/fi'
import DataTable from '../../components/common/DataTable'
import PaymentForm from './PaymentForm'
import paymentService from '../../services/paymentService'
import { getAllStudents } from '../../services/studentService'
import { getAllRooms } from '../../services/roomService'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from 'react-i18next'



export default function PaymentListPage() {
  const { t } = useTranslation()
  const { admin } = useAuth() // Get logged-in admin
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [filterStudent, setFilterStudent] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mapPaymentToRow = (p) => ({
    PaymentID: p.id || p.PaymentID || '',
    Candidate: p.student || p.Student || '',
    Amount: p.amount != null ? String(p.amount) : (p.Amount || ''),
    Date: p.paymentDate || p.Date || '',
    Method: p.method || p.Method || '',
    __raw: p,
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [paymentsResp, studentsResp, roomsResp] = await Promise.all([
        paymentService.getAllPayments(),
        getAllStudents(),
        getAllRooms()
      ])
      setPayments((paymentsResp.data || paymentsResp || []).map(mapPaymentToRow))
      setStudents(studentsResp.data || studentsResp || [])
      setRooms(roomsResp.data || roomsResp || [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate Dues Summary
  const calculateDues = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return students.map(student => {
      // Find assigned room to get rent
      const assignedRoom = rooms.find(r => r.roomNumber === student.roomNumber)
      const rentAmount = assignedRoom ? assignedRoom.rent : 0

      // Calculate total paid by student in current month
      const totalPaid = payments.reduce((sum, p) => {
        // Handle both raw backend field or mapped row field
        const pDateStr = p.__raw ? p.__raw.paymentDate : (p.paymentDate || p.Date)
        const pDate = new Date(pDateStr)
        const pStudent = p.__raw ? p.__raw.student : (p.student || p.Candidate)
        
        if (
          pStudent === student.name &&
          pDate.getMonth() === currentMonth &&
          pDate.getFullYear() === currentYear
        ) {
          // Get amount from raw data or mapped field
          const amount = p.__raw ? p.__raw.amount : (p.amount || Number(p.Amount) || 0)
          return sum + Number(amount)
        }
        return sum
      }, 0)

      const due = rentAmount - totalPaid

      return {
        Candidate: student.name,
        Room: student.roomNumber,
        Rent: rentAmount,
        Paid: totalPaid,
        Due: due > 0 ? due : 0, 
        Email: student.email
      }
    }).filter(record => record.Rent > 0) // Show all students with rent assigned
  }

  const duesSummary = calculateDues()

  const handleAddPayment = async (paymentData) => {
    setError(null)
    try {
      // paymentData comes from PaymentForm
      const payload = {
        student: paymentData.Candidate,
        amount: Number(paymentData.Amount),
        paymentDate: paymentData.Date,
        method: paymentData.Method,
        notes: paymentData.Notes,
        tenantId: paymentData.tenantId,
        transactionId: paymentData.transactionId || null,
        transactionDetails: paymentData.transactionDetails || null,
      }

      if (editingPayment && editingPayment.__raw && editingPayment.__raw.id) {
        const updated = await paymentService.updatePayment(editingPayment.__raw.id, payload)
        setPayments(payments.map((p) => (p.PaymentID === updated.id ? mapPaymentToRow(updated) : p)))
        setEditingPayment(null)
      } else {
        const created = await paymentService.createPayment(payload)
        setPayments([...payments, mapPaymentToRow(created)])
      }
      setShowForm(false)
      loadData() // Reload to ensure sync
    } catch (err) {
      // show error (server validation or network)
      setError(err.details || err.message || 'Failed to save payment')
      throw err
    }
  }

  const handleEdit = (payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleDelete = (payment) => {
    if (window.confirm(`Delete payment ${payment.PaymentID}?`)) {
      // call backend
      (async () => {
        try {
          if (payment.__raw && payment.__raw.id) {
            await paymentService.deletePayment(payment.__raw.id)
            setPayments(payments.filter((p) => p.PaymentID !== payment.PaymentID))
          } else {
            setPayments(payments.filter((p) => p.PaymentID !== payment.PaymentID))
          }
        } catch (err) {
          setError(err.message || 'Failed to delete')
        }
      })()
    }
  }

  const handleDownload = (payment) => {
    // Import jsPDF dynamically
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()
      
      // Set font
      doc.setFont('helvetica')
      
      // Header - Title with dynamic admin data
      doc.setFillColor(102, 126, 234) // Purple gradient color
      doc.rect(0, 0, 210, 50, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      // Use admin's hostel name or fallback to generic name
      const hostelName = admin && admin.hostelName ? admin.hostelName : 'PG/HOSTEL MANAGEMENT'
      doc.text(hostelName.toUpperCase(), 105, 15, { align: 'center' })
      
      doc.setFontSize(14)
      doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' })
      
      // Add admin contact information
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const adminEmail = admin && admin.email ? admin.email : ''
      const adminPhone = admin && admin.phone ? admin.phone : ''
      const contactInfo = [adminEmail, adminPhone].filter(Boolean).join(' | ')
      if (contactInfo) {
        doc.text(contactInfo, 105, 35, { align: 'center' })
      }
      
      // Add hostel address if available
      if (admin && admin.hostelAddress) {
        doc.setFontSize(8)
        doc.text(admin.hostelAddress, 105, 42, { align: 'center' })
      }
      
      // Reset text color
      doc.setTextColor(0, 0, 0)
      
      // Receipt Info
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(`Receipt ID: ${payment.PaymentID}`, 20, 62)
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 69)
      
      // Divider line
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 77, 190, 77)
      
      // Payment Details Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246) // Blue color
      doc.text('PAYMENT DETAILS', 20, 89)
      
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 92, 190, 92)
      
      // Payment details content
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      let yPos = 102
      doc.setFont('helvetica', 'bold')
      doc.text('Student Name:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(payment.Candidate, 75, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Date:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(payment.Date, 75, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Amount Paid:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(16, 185, 129) // Green color for amount
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      // Convert to number and display without rupee symbol to avoid spacing issues
      const amount = Number(String(payment.Amount).replace(/\s+/g, ''))
      doc.text(String(amount), 75, yPos)
      
      yPos += 10
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Method:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(payment.Method, 75, yPos)
      
      // Transaction Summary Section
      yPos += 20
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246)
      doc.text('TRANSACTION SUMMARY', 20, yPos)
      
      yPos += 3
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos, 190, yPos)
      
      yPos += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Transaction ID:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      // Use actual transaction ID from database, or generate fallback
      const txnId = payment.__raw && payment.__raw.transactionId 
        ? payment.__raw.transactionId 
        : `TXN${String(payment.PaymentID).padStart(6, '0')}`
      doc.text(txnId, 75, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Payment ID:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(String(payment.PaymentID), 75, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Status:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(16, 185, 129)
      doc.text('COMPLETED', 75, yPos)
      
      yPos += 10
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('Processed By:', 25, yPos)
      doc.setFont('helvetica', 'normal')
      // Use actual admin name from logged-in user
      const adminName = admin && admin.name ? admin.name : 'Admin'
      doc.text(adminName, 75, yPos)
      
      // Thank you message
      yPos += 25
      doc.setFontSize(12)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      doc.text('Thank you for your payment!', 105, yPos, { align: 'center' })
      
      yPos += 8
      doc.setFontSize(10)
      doc.text('For any queries, please contact the hostel administration.', 105, yPos, { align: 'center' })
      
      // Footer
      yPos = 270
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos, 190, yPos)
      
      yPos += 7
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('This is a computer-generated receipt and does not require a signature.', 105, yPos, { align: 'center' })
      
      yPos += 5
      doc.text(`Generated on: ${new Date().toString()}`, 105, yPos, { align: 'center' })
      
      // Save the PDF
      doc.save(`Payment_Receipt_${payment.PaymentID}_${payment.Candidate.replace(/\s+/g, '_')}.pdf`)
    }).catch(err => {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF receipt. Please try again.')
    })
  }

  const paymentColumns = ['PaymentID', 'Candidate', 'Amount', 'Date', 'Method']
  const dueColumns = ['Candidate', 'Room', 'Rent', 'Paid', 'Due', 'Email']



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
          <h1 className="page-title" style={{ color: 'white' }}>{t('payments.title')}</h1>
          <p className="page-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t('payments.subtitle')}</p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
          <FiDollarSign />
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
          <motion.button
            className="btn btn-secondary btn-sm"
            onClick={loadData}
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
            <FiRefreshCw /> {t('payments.refresh')}
          </motion.button>
        </div>
        <div className="toolbar-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn btn-primary"
            onClick={() => {
              setEditingPayment(null)
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
            <FiPlus /> {t('payments.addPayment')}
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
              <h2 className="modal-title" style={{ color: 'white' }}>{editingPayment ? `✏️ ${t('payments.editPayment')}` : `➕ ${t('payments.addNewPayment')}`}</h2>
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
              <PaymentForm
                payment={editingPayment}
                onSubmit={(data) => {
                  handleAddPayment(data)
                  setShowForm(false)
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 style={{ marginBottom: '1rem', marginTop: '2rem', color: '#111827', fontSize: '1.25rem', fontWeight: '600' }}>{t('payments.recentPayments')}</h3>
        {loading && <div>{t('payments.loadingPayments')}</div>}
        {error && <div style={{ color: 'red' }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        <DataTable
          columns={paymentColumns}
          data={payments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </motion.div>

      {/* Due Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 style={{
          marginBottom: '1rem',
          marginTop: '2rem',
          textAlign: 'center',
          color: '#ef4444',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          {t('payments.currentMonthDue')}
        </h3>
        <DataTable
          columns={dueColumns}
          data={duesSummary}
        />
      </motion.div>
    </motion.div>
  )
}
