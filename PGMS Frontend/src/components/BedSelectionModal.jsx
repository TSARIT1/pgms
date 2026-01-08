import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { MdEventSeat } from 'react-icons/md'

export default function BedSelectionModal({ isOpen, onClose, room, onSelectBed, currentBedNumber }) {
  const [selectedBed, setSelectedBed] = useState(currentBedNumber || null)
  const [occupiedBeds, setOccupiedBeds] = useState([])

  useEffect(() => {
    if (room && room.occupiedBedNumbers) {
      try {
        const occupied = JSON.parse(room.occupiedBedNumbers || '[]')
        setOccupiedBeds(occupied)
      } catch (e) {
        setOccupiedBeds([])
      }
    }
  }, [room])

  useEffect(() => {
    setSelectedBed(currentBedNumber || null)
  }, [currentBedNumber])

  if (!isOpen || !room) return null

  const totalBeds = room.capacity || 0
  const beds = Array.from({ length: totalBeds }, (_, i) => i + 1)

  const handleBedClick = (bedNumber) => {
    // Don't allow selecting occupied beds (unless it's the current bed)
    if (occupiedBeds.includes(bedNumber) && bedNumber !== currentBedNumber) {
      return
    }
    setSelectedBed(bedNumber)
  }

  const handleConfirm = () => {
    if (selectedBed) {
      onSelectBed(selectedBed)
      onClose()
    }
  }

  const getBedStatus = (bedNumber) => {
    if (bedNumber === selectedBed) return 'selected'
    if (occupiedBeds.includes(bedNumber) && bedNumber !== currentBedNumber) return 'occupied'
    return 'available'
  }

  const getBedColor = (status) => {
    switch (status) {
      case 'selected':
        return '#667eea' // Blue
      case 'occupied':
        return '#ef4444' // Red
      case 'available':
        return '#10b981' // Green
      default:
        return '#d1d5db'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}
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
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6'
              e.target.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none'
              e.target.style.color = '#6b7280'
            }}
          >
            <FiX />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', color: '#111827', fontSize: '1.5rem' }}>
              Select Your Bed
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              Room {room.roomNumber} - {room.capacity} Beds Available
            </p>
          </div>

          {/* Bed Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {beds.map((bedNumber) => {
              const status = getBedStatus(bedNumber)
              const color = getBedColor(status)
              const isDisabled = status === 'occupied'

              return (
                <motion.div
                  key={bedNumber}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  onClick={() => handleBedClick(bedNumber)}
                  style={{
                    padding: '1.5rem 1rem',
                    border: `2px solid ${color}`,
                    borderRadius: '0.75rem',
                    background: status === 'selected' ? color : status === 'occupied' ? '#fee2e2' : '#f0fdf4',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  <MdEventSeat
                    style={{
                      fontSize: '2rem',
                      color: status === 'selected' ? 'white' : color,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: status === 'selected' ? 'white' : '#111827',
                    }}
                  >
                    Bed {bedNumber}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: status === 'selected' ? 'white' : '#6b7280',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.25rem',
                  background: '#10b981',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.25rem',
                  background: '#ef4444',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.25rem',
                  background: '#667eea',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Selected</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb'
                e.target.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white'
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedBed}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedBed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db',
                color: 'white',
                fontWeight: '600',
                cursor: selectedBed ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedBed) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Confirm Selection
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
