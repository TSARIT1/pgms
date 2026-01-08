import React, { useState, useEffect } from 'react'

import { getAllStudents } from '../../services/studentService'

export default function PaymentForm({ payment, onSubmit }) {
  const [formData, setFormData] = useState({
    Candidate: '',
    Amount: '',
    Date: '',
    Method: '',
    Notes: '',
    transactionId: '',
    transactionDetails: '',
    // store tenantId hidden or derivation
    tenantId: null
  })

  // Students list from backend
  const [studentsList, setStudentsList] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    // Load students
    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const resp = await getAllStudents()
        // resp.data is array
        setStudentsList(resp.data || [])
      } catch (err) {
        console.error('Failed to load students', err)
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    if (payment) {
      setFormData({
        Candidate: payment.Candidate,
        Amount: payment.Amount,
        Date: payment.Date,
        Method: payment.Method,
        Notes: payment.Notes || '',
        transactionId: payment.transactionId || '',
        transactionDetails: payment.transactionDetails || '',
        tenantId: payment.tenantId || null
      })
    }
  }, [payment])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // If student selected, find and set tenantId
    if (name === 'Candidate') {
        const selected = studentsList.find(s => s.name === value)
        if (selected) {
            setFormData(prev => ({ ...prev, tenantId: selected.id }))
        }
    }

    // Clear transaction fields when method changes
    if (name === 'Method') {
      setFormData(prev => ({
        ...prev,
        transactionId: '',
        transactionDetails: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Determine which additional field to show based on payment method
  const showTransactionId = ['UPI', 'Net Banking', 'Account'].includes(formData.Method)
  const showTransactionDetails = formData.Method === 'Other'

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Candidate</label>
        <select 
            name="Candidate" 
            className="form-select" 
            value={formData.Candidate} 
            onChange={handleChange} 
            required
        >
          <option value="">Select Candidate</option>
          {loadingStudents ? <option>Loading...</option> : null}
          {studentsList.map(s => (
              <option key={s.id} value={s.name}>{s.name} (Room: {s.roomNumber})</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            name="Amount"
            className="form-input"
            value={formData.Amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="Date"
            className="form-input"
            value={formData.Date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
            <label className="form-label">Method</label>
            <select name="Method" className="form-select" value={formData.Method} onChange={handleChange} required>
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Account">Account</option>
            <option value="Other">Other</option>
            </select>
        </div>
      </div>

      {/* Conditional Transaction ID field for UPI, Net Banking, Account */}
      {showTransactionId && (
        <div className="form-group">
          <label className="form-label">Transaction ID</label>
          <input
            type="text"
            name="transactionId"
            className="form-input"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="Enter transaction ID"
            required
          />
        </div>
      )}

      {/* Conditional Transaction Details field for Other */}
      {showTransactionDetails && (
        <div className="form-group">
          <label className="form-label">Transaction Details</label>
          <textarea
            name="transactionDetails"
            className="form-input"
            value={formData.transactionDetails}
            onChange={handleChange}
            rows="3"
            placeholder="Enter transaction details"
            style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}
            required
          />
        </div>
      )}

      <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea 
            name="Notes" 
            className="form-input" 
            value={formData.Notes} 
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}
          />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary btn-block">
          {payment ? 'Update Payment' : 'Add Payment'}
        </button>
      </div>
    </form>
  )
}
