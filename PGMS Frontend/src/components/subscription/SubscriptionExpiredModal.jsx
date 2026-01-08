import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiClock } from 'react-icons/fi'
import SubscriptionModal from './SubscriptionModal'

export default function SubscriptionExpiredModal({ isOpen, adminData, onSubscriptionPurchased }) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true)
  }

  const handleSubscriptionModalClose = () => {
    // Allow closing only if subscription is no longer expired
    // This will be handled by the parent component
    setShowSubscriptionModal(false)
  }

  const handlePlanSelected = async (planName) => {
    // After successful payment, refresh admin data
    if (onSubscriptionPurchased) {
      await onSubscriptionPurchased()
    }
    // Close the subscription modal
    setShowSubscriptionModal(false)
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
          // NO onClick handler - cannot close by clicking backdrop
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '2rem',
              padding: '3rem',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              position: 'relative',
            }}
            // NO onClick stopPropagation - modal cannot be closed
          >
            {/* Warning Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 2rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.5)',
              }}
            >
              <FiAlertTriangle size={60} color="white" strokeWidth={2.5} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              Subscription Expired
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: '1.125rem',
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              Your subscription plan has expired. To continue using the PG Management System, please upgrade to a new plan.
            </motion.p>

            {/* Expiry Info */}
            {adminData?.subscriptionEndDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  backgroundColor: '#fef3c7',
                  border: '2px solid #fbbf24',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }}
              >
                <FiClock size={24} color="#f59e0b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>
                    Expired On
                  </div>
                  <div style={{ fontSize: '1rem', color: '#78350f', fontWeight: '700' }}>
                    {new Date(adminData.subscriptionEndDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Upgrade Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgradeClick}
              style={{
                width: '100%',
                padding: '1.25rem 2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontSize: '1.25rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                transition: 'all 0.3s ease',
              }}
            >
              Upgrade Plan Now
            </motion.button>

            {/* Info Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                marginTop: '1.5rem',
                fontStyle: 'italic',
              }}
            >
              You can still access your profile and logout from the application
            </motion.p>

            {/* Pulsing Border Animation */}
            <style>{`
              @keyframes pulse-border {
                0%, 100% {
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                50% {
                  box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.6);
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={handleSubscriptionModalClose}
        currentPlan={adminData?.subscriptionPlan}
        onSelectPlan={handlePlanSelected}
        adminData={adminData}
      />
    </>
  )
}
