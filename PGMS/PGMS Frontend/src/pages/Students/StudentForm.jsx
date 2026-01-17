import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllRooms } from '../../services/roomService'
import BedSelectionModal from '../../components/BedSelectionModal'
import { MdEventSeat } from 'react-icons/md'

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
}

const rowVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: { duration: 0.4, delay: i * 0.15 },
  }),
}

export default function StudentForm({ student, onSubmit }) {
  const [formData, setFormData] = useState({
    Name: '',
    Age: '',
    Gender: '',
    Room: '',
    BedNumber: null,
    Admission: '',
    Contact: '',
    Email: '',
    Address: '',
    IdentityProofType: ''
  })

  const [identityProofFile, setIdentityProofFile] = useState(null)
  const [identityProofPreview, setIdentityProofPreview] = useState(null)
  const [showBedModal, setShowBedModal] = useState(false)

  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState(null)

  useEffect(() => {
    if (student) {
      setFormData({
        Name: student.Name,
        Age: student.Age,
        Gender: student.Gender,
        Room: student.Room,
        BedNumber: student.BedNumber || null,
        Admission: student.Admission,
        Contact: student.Contact,
        Email: student.Email,
        Address: student.Address || '',
        IdentityProofType: student.IdentityProofType || '',
      })
    }
  }, [student])

  // load rooms for the Room select
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setRoomsLoading(true)
      setRoomsError(null)
      try {
        const resp = await getAllRooms()
        // roomService returns the full response; prefer resp.data if present
        const list = resp && resp.data ? resp.data : resp
        if (mounted) setRooms(list || [])
      } catch (err) {
        if (mounted) setRoomsError(err.message || 'Failed to load rooms')
      } finally {
        if (mounted) setRoomsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setFormError('Please upload a valid file (JPG, PNG, or PDF)')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size must be less than 5MB')
        return
      }
      setIdentityProofFile(file)
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setIdentityProofPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setIdentityProofPreview(null)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Map UI keys to backend Tenant model keys
    const payload = {
      name: formData.Name,
      age: formData.Age ? Number(formData.Age) : null,
      phone: formData.Contact,
      email: formData.Email,
      roomNumber: formData.Room,
      address: formData.Address,
      joiningDate: formData.Admission,
    }
    onSubmit(payload)
  }

  const [formError, setFormError] = useState(null)

  // enhanced submit with client-side validation
  const handleValidatedSubmit = (e) => {
    e.preventDefault()
    setFormError(null)
    // basic client-side checks to reduce backend validation failures
    if (!formData.Name || formData.Name.trim().length === 0) {
      setFormError('Name is required')
      return
    }
    if (!formData.Contact || !/^\d{10}$/.test(formData.Contact)) {
      setFormError('Contact must be 10 digits')
      return
    }
    if (!formData.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      setFormError('Enter a valid email')
      return
    }
    if (!formData.Room || formData.Room === '') {
      setFormError('Please select a room')
      return
    }
    if (!formData.Admission || formData.Admission === '') {
      setFormError('Please enter admission date')
      return
    }
    if (formData.Age && Number(formData.Age) < 18) {
      setFormError('Age must be at least 18')
      return
    }
    if (!formData.Address || formData.Address.trim().length === 0) {
      setFormError('Address is required')
      return
    }

    // Create FormData for multipart upload
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.Name)
    formDataToSend.append('age', formData.Age ? Number(formData.Age) : '')
    formDataToSend.append('gender', formData.Gender)
    formDataToSend.append('phone', formData.Contact)
    formDataToSend.append('email', formData.Email)
    formDataToSend.append('roomNumber', formData.Room)
    if (formData.BedNumber) {
      formDataToSend.append('bedNumber', formData.BedNumber)
    }
    formDataToSend.append('address', formData.Address)
    formDataToSend.append('joiningDate', formData.Admission)
    
    if (formData.IdentityProofType) {
      formDataToSend.append('identityProofType', formData.IdentityProofType)
    }
    
    if (identityProofFile) {
      formDataToSend.append('identityProof', identityProofFile)
    }
    
    onSubmit(formDataToSend)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  }

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#3b82f6'
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
  }

  return (
    <motion.form onSubmit={handleValidatedSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {formError && (
        <div style={{ color: 'red', marginBottom: '0.75rem' }}>{formError}</div>
      )}
      {/* Name */}
      <motion.div
        className="form-group"
        custom={0}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Name
        </label>
        <motion.input
          type="text"
          name="Name"
          className="form-input"
          value={formData.Name}
          onChange={handleChange}
          required
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </motion.div>

      {/* Row 1: Age & Gender */}
      <motion.div 
        className="form-row"
        custom={1}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <motion.div
          className="form-group"
          custom={1}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Age
          </label>
          <motion.input
            type="number"
            name="Age"
            className="form-input"
            value={formData.Age}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </motion.div>

        <motion.div
          className="form-group"
          custom={2}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Gender
          </label>
          <motion.select
            name="Gender"
            className="form-select"
            value={formData.Gender}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </motion.select>
        </motion.div>
      </motion.div>

      {/* Row 2: Room & Admission */}
      <motion.div 
        className="form-row"
        custom={2}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <motion.div
          className="form-group"
          custom={3}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Room
          </label>
          <motion.select
            name="Room"
            className="form-select"
            value={formData.Room}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="">Select Room</option>
            {roomsLoading && <option value="">Loading rooms...</option>}
            {roomsError && <option value="">Error loading rooms</option>}
            {rooms && rooms.map((r) => {
              const hasBedTracking = r.capacity && r.capacity > 0
              const availableBeds = (r.capacity || 0) - (r.occupiedBeds || 0)
              const bedInfo = r.capacity > 1 ? ` (${availableBeds} available bed${availableBeds !== 1 ? 's' : ''})` : ''
              // Only disable if bed tracking is enabled AND no beds available
              const isDisabled = hasBedTracking && availableBeds <= 0
              return (
                <option 
                  key={r.id || r.roomNumber} 
                  value={r.roomNumber}
                  disabled={isDisabled}
                >
                  {r.roomNumber} {r.type ? `- ${r.type}` : ''}{bedInfo}
                </option>
              )
            })}
          </motion.select>
          
          {/* Bed Availability Indicator */}
          {formData.Room && rooms && (() => {
            const selectedRoom = rooms.find(r => r.roomNumber === formData.Room)
            if (!selectedRoom) return null
            
            const availableBeds = (selectedRoom.capacity || 0) - (selectedRoom.occupiedBeds || 0)
            const occupancyPercentage = selectedRoom.capacity > 0 
              ? ((selectedRoom.occupiedBeds || 0) / selectedRoom.capacity) * 100 
              : 0
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: availableBeds > 0 ? '#f0fdf4' : '#fef2f2',
                  border: `2px solid ${availableBeds > 0 ? '#86efac' : '#fca5a5'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>
                    {availableBeds > 0 ? '✅' : '❌'}
                  </span>
                  <span style={{ fontWeight: '600', color: availableBeds > 0 ? '#166534' : '#991b1b' }}>
                    {availableBeds > 0 
                      ? `${availableBeds} Bed${availableBeds !== 1 ? 's' : ''} Available` 
                      : 'Room Full'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <span>📊 Capacity: {selectedRoom.capacity}</span>
                  <span>🛏️ Occupied: {selectedRoom.occupiedBeds || 0}</span>
                  <span>✨ Available: {availableBeds}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${occupancyPercentage}%`, 
                      height: '100%', 
                      backgroundColor: occupancyPercentage >= 100 ? '#ef4444' : occupancyPercentage >= 75 ? '#f59e0b' : '#10b981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </motion.div>
            )
          })()}
          
          {/* Bed Selection Button */}
          {formData.Room && (() => {
            const selectedRoom = rooms.find(r => r.roomNumber === formData.Room)
            if (!selectedRoom || selectedRoom.capacity <= 1) return null
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: '1rem' }}
              >
                <button
                  type="button"
                  onClick={() => setShowBedModal(true)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: formData.BedNumber 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <MdEventSeat style={{ fontSize: '1.25rem' }} />
                  {formData.BedNumber 
                    ? `✅ Bed ${formData.BedNumber} Selected` 
                    : '🛏️ Select Your Bed'}
                </button>
              </motion.div>
            )
          })()}
        </motion.div>

        <motion.div
          className="form-group"
          custom={4}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Admission Date
          </label>
          <motion.input
            type="date"
            name="Admission"
            className="form-input"
            value={formData.Admission}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </motion.div>
      </motion.div>

      {/* Row 3: Contact & Email */}
      <motion.div 
        className="form-row"
        custom={3}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <motion.div
          className="form-group"
          custom={5}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Contact
          </label>
          <motion.input
            type="tel"
            name="Contact"
            className="form-input"
            value={formData.Contact}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </motion.div>

        <motion.div
          className="form-group"
          custom={6}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Email
          </label>
          <motion.input
            type="email"
            name="Email"
            className="form-input"
            value={formData.Email}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </motion.div>

        {/* Address */}
        <motion.div
          className="form-group"
          custom={7}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: '1.5rem' }}
        >
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
            Address
          </label>
          <motion.textarea
            name="Address"
            className="form-input"
            value={formData.Address}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem', transition: 'all 0.3s ease', minHeight: '80px' }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </motion.div>
      </motion.div>

      {/* Select Identity Proof Type */}
      <motion.div
        className="form-group"
        custom={8}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Select Identity Proof Type
        </label>
        <motion.select
          name="IdentityProofType"
          className="form-select"
          value={formData.IdentityProofType}
          onChange={handleChange}
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        >
          <option value="">Select Identity Proof</option>
          <option value="Aadhar Card">Aadhar Card</option>
          <option value="PAN Card">PAN Card</option>
          <option value="Voter ID">Voter ID</option>
          <option value="Other">Other</option>
        </motion.select>
      </motion.div>

      {/* Identity Proof Upload */}
      <motion.div
        className="form-group"
        custom={9}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '1.5rem' }}
      >
        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
          Identity Proof 📄
        </label>
        <motion.input
          type="file"
          name="identityProof"
          className="form-input"
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px dashed #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Accepted formats: JPG, PNG, PDF (Max size: 5MB)
        </p>
        
        {/* File Preview */}
        {identityProofFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>
                {identityProofFile.type === 'application/pdf' ? '📄' : '🖼️'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#166534', marginBottom: '0.25rem' }}>
                  ✅ File Selected
                </p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {identityProofFile.name} ({(identityProofFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIdentityProofFile(null)
                  setIdentityProofPreview(null)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Remove
              </button>
            </div>
            
            {/* Image Preview */}
            {identityProofPreview && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={identityProofPreview}
                  alt="Identity Proof Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '0.5rem',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        custom={5}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
      >
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {student ? '✏️ Update Student' : '➕ Add Student'}
        </motion.button>
      </motion.div>
      
      {/* Bed Selection Modal */}
      <BedSelectionModal
        isOpen={showBedModal}
        onClose={() => setShowBedModal(false)}
        room={rooms.find(r => r.roomNumber === formData.Room)}
        onSelectBed={(bedNumber) => {
          setFormData(prev => ({ ...prev, BedNumber: bedNumber }))
        }}
        currentBedNumber={formData.BedNumber}
      />
    </motion.form>
  )
}
