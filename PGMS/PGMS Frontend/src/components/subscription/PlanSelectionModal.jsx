import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiX, FiLoader, FiAlertCircle, FiShoppingBag } from 'react-icons/fi'
import { getActivePlans } from '../../services/subscriptionService'
import { createPaymentOrder } from '../../services/subscriptionPaymentService'

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan, selectedPlanId, userInfo }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [localSelectedPlanId, setLocalSelectedPlanId] = useState(selectedPlanId)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)

  const planColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
      setLocalSelectedPlanId(selectedPlanId)
    }
  }, [isOpen, selectedPlanId])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getActivePlans()
      
      const transformedPlans = response.map((plan, index) => {
        let features = []
        try {
          features = JSON.parse(plan.features || '[]')
        } catch (e) {
          features = []
        }

        let discountedPrice = plan.price
        let discountPercentage = 0
        
        if (plan.offer && plan.offer.trim() !== '') {
          const match = plan.offer.match(/(\d+)/)
          if (match) {
            discountPercentage = parseInt(match[1])
            discountedPrice = Math.round(plan.price - (plan.price * discountPercentage / 100))
          }
        }

        return {
          id: plan.id,
          name: plan.name,
          originalPrice: plan.price,
          price: `₹${discountedPrice.toLocaleString('en-IN')}`,
          priceNumeric: discountedPrice,
          period: `for ${plan.duration} ${plan.durationType === 'MONTH' ? `month${plan.duration > 1 ? 's' : ''}` : `day${plan.duration > 1 ? 's' : ''}`}`,
          color: planColors[index % planColors.length],
          features: features,
          offer: plan.offer,
          discountPercentage: discountPercentage,
          hasDiscount: discountPercentage > 0,
        }
      })

      setPlans(transformedPlans)
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load subscription plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    const plan = plans.find(p => p.id === localSelectedPlanId)
    if (!plan) return

    // If it's a paid plan, initiate payment
    if (plan.priceNumeric > 0) {
      try {
        setIsPaymentProcessing(true)
        setError(null)

        // Create order
        const orderResponse = await createPaymentOrder({
          planName: plan.name,
          amount: plan.priceNumeric,
          isRegistration: true
        })

        if (orderResponse.status === 'success') {
          const options = {
            key: orderResponse.keyId,
            amount: orderResponse.amount,
            currency: orderResponse.currency,
            name: 'PGMS Subscription',
            description: `Payment for ${plan.name}`,
            order_id: orderResponse.razorpayOrderId,
            handler: function (response) {
              // Payment successful
              onSelectPlan(plan, response)
              onClose()
            },
            prefill: {
              name: userInfo?.name || '',
              email: userInfo?.email || '',
              contact: userInfo?.phone || ''
            },
            theme: {
              color: plan.color
            },
            modal: {
              ondismiss: function () {
                setIsPaymentProcessing(false)
              }
            }
          }

          const rzp = new window.Razorpay(options)
          rzp.open()
        }
      } catch (err) {
        console.error('Payment initiation failed:', err)
        setError(err.message || 'Payment initiation failed. Please try again.')
        setIsPaymentProcessing(false)
      }
    } else {
      // Free plan
      onSelectPlan(plan, null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
          }}>
            <div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
                Choose Your Subscription Plan
              </h2>
              <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                Select the perfect plan for your PG/Hostel management needs
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.75rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem',
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Loading/Error State */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <FiLoader size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading plans...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
              <FiAlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p>{error}</p>
              <button onClick={fetchPlans} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#dc2626', color: 'white', borderRadius: '0.5rem' }}>Retry</button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}>
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalSelectedPlanId(plan.id)}
                    style={{
                      border: localSelectedPlanId === plan.id ? `3px solid ${plan.color}` : '2px solid #e5e7eb',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: localSelectedPlanId === plan.id ? `${plan.color}10` : 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {plan.offer && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '15px',
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}>
                        {plan.offer}
                      </div>
                    )}

                    {localSelectedPlanId === plan.id && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: plan.color,
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <FiCheck size={16} />
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: plan.color, marginBottom: '0.5rem' }}>
                      {plan.name}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827' }}>{plan.price}</span>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>{plan.period}</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                          <FiCheck color={plan.color} /> {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <button 
                  disabled={isPaymentProcessing}
                  onClick={onClose} 
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '600',
                    cursor: isPaymentProcessing ? 'not-allowed' : 'pointer',
                    background: '#f3f4f6',
                    border: 'none',
                    color: '#4b5563'
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={!localSelectedPlanId || isPaymentProcessing}
                  onClick={handleConfirm}
                  style={{
                    padding: '0.75rem 2rem',
                    background: localSelectedPlanId && !isPaymentProcessing ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontWeight: '700',
                    cursor: localSelectedPlanId && !isPaymentProcessing ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '180px',
                    justifyContent: 'center'
                  }}
                >
                  {isPaymentProcessing ? (
                    <>
                      <FiLoader className="animate-spin" /> Processing...
                    </>
                  ) : (
                    plans.find(p => p.id === localSelectedPlanId)?.priceNumeric > 0 ? (
                      <>
                        <FiShoppingBag /> Pay & Confirm
                      </>
                    ) : (
                      'Confirm Plan'
                    )
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
