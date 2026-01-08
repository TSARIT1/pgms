import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { getActivePlans } from '../../services/subscriptionService'
import { createPaymentOrder, verifyPayment, activateFreePlan } from '../../services/subscriptionPaymentService'
import { useAuth } from '../../context/AuthContext'

export default function SubscriptionModal({ isOpen, onClose, currentPlan, onSelectPlan, adminData }) {
  const { refreshAdminData } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || '')
  const [selectedPlanData, setSelectedPlanData] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Color palette for plans
  const planColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  useEffect(() => {
    if (isOpen) {
      console.log('[SubscriptionModal] Modal opened with currentPlan:', currentPlan)
      fetchPlans()
    }
  }, [isOpen])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getActivePlans()
      
      // Transform backend data to modal format
      const transformedPlans = response.map((plan, index) => {
        let features = []
        try {
          features = JSON.parse(plan.features || '[]')
        } catch (e) {
          console.error('Error parsing features:', e)
          features = []
        }

        // Calculate discounted price if offer exists
        let discountedPrice = plan.price
        let discountPercentage = 0
        
        console.log('=== Processing Plan:', plan.name, '===')
        console.log('Original Price:', plan.price)
        console.log('Offer Field:', plan.offer)
        console.log('Offer Type:', typeof plan.offer)
        console.log('Offer Truthy:', !!plan.offer)
        
        if (plan.offer && plan.offer.trim() !== '') {
          // Extract any number from the offer text
          const match = plan.offer.match(/(\d+)/)
          console.log('Regex Match Result:', match)
          
          if (match) {
            discountPercentage = parseInt(match[1])
            discountedPrice = Math.round(plan.price - (plan.price * discountPercentage / 100))
            console.log('✓ Discount Applied!')
            console.log('  - Percentage:', discountPercentage, '%')
            console.log('  - Original Price:', plan.price)
            console.log('  - Discounted Price:', discountedPrice)
          } else {
            console.log('✗ No number found in offer text')
          }
        } else {
          console.log('✗ No offer or empty offer')
        }

        const result = {
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
          duration: plan.duration,
          durationType: plan.durationType,
        }
        
        console.log('Final Plan Object:', {
          name: result.name,
          originalPrice: result.originalPrice,
          discountedPrice: result.priceNumeric,
          hasDiscount: result.hasDiscount,
          discountPercentage: result.discountPercentage
        })
        console.log('===================\n')
        
        return result
      })

      setPlans(transformedPlans)
      
      // Set initial selected plan if currentPlan matches
      if (currentPlan) {
        const matchingPlan = transformedPlans.find(p => p.name === currentPlan)
        if (matchingPlan) {
          setSelectedPlan(matchingPlan.name)
          setSelectedPlanData(matchingPlan)
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load subscription plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelection = (plan) => {
    // Check if user is renewing (has had a subscription before)
    const isRenewing = adminData?.subscriptionEndDate !== null && adminData?.subscriptionEndDate !== undefined
    
    // Only lock plans if:
    // 1. User has a currentPlan selected during registration AND
    // 2. User is NOT renewing (first time user)
    // If user is renewing, allow them to select any plan
    if (currentPlan && plan.name !== currentPlan && !isRenewing) {
      console.log('[SubscriptionModal] Plan locked - initial registration')
      return
    }
    
    console.log('[SubscriptionModal] Plan selection allowed:', plan.name)
    setSelectedPlan(plan.name)
    setSelectedPlanData(plan)
  }

  const handleConfirm = async () => {
    if (!selectedPlan || !selectedPlanData) {
      setError('Please select a plan')
      return
    }

    try {
      setProcessingPayment(true)
      setError(null)

      // Use the already calculated discounted price
      const amount = selectedPlanData.priceNumeric

      // Check if this is a FREE plan (₹0)
      if (amount === 0) {
        console.log('[SubscriptionModal] Free plan detected, activating via backend...')
        console.log('[SubscriptionModal] Plan name:', selectedPlanData.name)
        
        // For free plans, call backend to activate the subscription
        const activateResponse = await activateFreePlan(selectedPlanData.name)
        
        console.log('[SubscriptionModal] Backend response:', activateResponse)
        
        if (activateResponse.status === 'success') {
          console.log('[SubscriptionModal] Free plan activated successfully!')
          console.log('[SubscriptionModal] Subscription dates:', {
            start: activateResponse.subscriptionStartDate,
            end: activateResponse.subscriptionEndDate
          })
          
          // Show success message
          const successMsg = document.createElement('div')
          successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
          `
          successMsg.textContent = `✓ Free plan activated! Welcome to ${selectedPlanData.name}`
          document.body.appendChild(successMsg)
          
          setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.3s ease-in'
            setTimeout(() => successMsg.remove(), 300)
          }, 4000)
          
          // Wait a bit for backend to fully commit, then refresh and close
          setTimeout(async () => {
            console.log('[SubscriptionModal] Refreshing admin data...')
            await refreshAdminData() // Refresh admin context
            await onSelectPlan(selectedPlanData.name)
            console.log('[SubscriptionModal] Admin data refreshed, closing modal')
            onClose()
          }, 500)
        } else {
          console.error('[SubscriptionModal] Failed to activate free plan:', activateResponse)
          throw new Error(activateResponse.message || 'Failed to activate free plan')
        }
        
        setProcessingPayment(false)
        return
      }

      // For PAID plans, proceed with Razorpay payment
      console.log('[SubscriptionModal] Paid plan detected, creating payment order...')

      // Create payment order
      const orderResponse = await createPaymentOrder({
        planName: selectedPlanData.name,
        amount: amount
      })

      if (orderResponse.status !== 'success') {
        throw new Error('Failed to create payment order')
      }

      // Configure Razorpay options
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'PG Management System',
        description: `Subscription: ${selectedPlanData.name}`,
        order_id: orderResponse.razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })

            if (verifyResponse.status === 'success') {
              // Payment successful - refresh admin data and call parent callback
              await refreshAdminData() // Refresh admin context
              onSelectPlan(selectedPlanData.name)
              onClose()
              
              // Show success message
              const successMsg = document.createElement('div')
              successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
              `
              successMsg.textContent = `✓ Payment successful! Subscription activated for ${selectedPlanData.name}`
              document.body.appendChild(successMsg)
              
              setTimeout(() => {
                successMsg.style.animation = 'slideOut 0.3s ease-in'
                setTimeout(() => successMsg.remove(), 300)
              }, 4000)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.')
            console.error('Payment verification error:', err)
          } finally {
            setProcessingPayment(false)
          }
        },
        prefill: {
          name: adminData?.name || '',
          email: adminData?.email || '',
          contact: adminData?.phone || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false)
            setError('Payment cancelled')
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      setError(err.message || 'Failed to process payment')
      console.error('Payment error:', err)
      setProcessingPayment(false)
    }
  }

  if (!isOpen) return null

  // Check if user MUST pay (has selected a plan but hasn't paid yet)
  const mustPay = currentPlan && !adminData?.subscriptionEndDate
  
  // Check if user is renewing/upgrading (has had a subscription before, even if expired)
  // If they have subscriptionEndDate, it means they've had a subscription before
  // In this case, unlock all plans so they can choose any plan
  const isRenewing = adminData?.subscriptionEndDate !== null && adminData?.subscriptionEndDate !== undefined
  
  console.log('[SubscriptionModal] Modal opened with currentPlan:', currentPlan)
  console.log('[SubscriptionModal] mustPay:', mustPay, 'isRenewing:', isRenewing)
  console.log('[SubscriptionModal] subscriptionEndDate:', adminData?.subscriptionEndDate)

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
          backgroundColor: mustPay ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}
        onClick={mustPay ? undefined : onClose} // Only allow closing if not required to pay
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
            maxWidth: '1400px',
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
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '0.5rem',
              }}>
                Choose Your Subscription Plan
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
              }}>
                Select the perfect plan for your PG/Hostel management needs
              </p>
              {/* Warning message if payment is required */}
              {mustPay && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiAlertCircle size={20} color="#f59e0b" />
                  <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>
                    ⚠️ You must complete payment to access the application
                  </span>
                </motion.div>
              )}
            </div>
            {/* Only show close button if payment is NOT required */}
            {!mustPay && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.75rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'color 0.2s',
                  padding: '0.5rem',
                }}
                onMouseEnter={(e) => e.target.style.color = '#111827'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              gap: '1rem',
            }}>
              <FiLoader size={48} style={{ 
                color: '#3b82f6',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading subscription plans...</p>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              padding: '2rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.75rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}>
              <p style={{ color: '#dc2626', fontSize: '1rem', fontWeight: '600' }}>{error}</p>
              <button
                onClick={fetchPlans}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2.5rem',
              }}>
                {plans.map((plan, index) => {
                  // Only lock plans if user is in initial registration (not renewing)
                  const isPlanLocked = currentPlan && plan.name !== currentPlan && !isRenewing
                  console.log(`[SubscriptionModal] Plan: ${plan.name}, currentPlan: ${currentPlan}, isRenewing: ${isRenewing}, isLocked: ${isPlanLocked}`)
                  return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: isPlanLocked ? 1 : 1.03, y: isPlanLocked ? 0 : -5 }}
                    whileTap={{ scale: isPlanLocked ? 1 : 0.98 }}
                    onClick={() => handlePlanSelection(plan)}
                    style={{
                      border: selectedPlan === plan.name ? `3px solid ${plan.color}` : '2px solid #e5e7eb',
                      borderRadius: '1.25rem',
                      padding: '2rem',
                      cursor: isPlanLocked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      backgroundColor: selectedPlan === plan.name ? `${plan.color}15` : 'white',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedPlan === plan.name 
                        ? `0 10px 25px -5px ${plan.color}40` 
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      opacity: isPlanLocked ? 0.5 : 1,
                      filter: isPlanLocked ? 'grayscale(50%)' : 'none',
                    }}
                  >
                    {/* Locked Overlay */}
                    {isPlanLocked && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}>
                        🔒 Locked
                      </div>
                    )}

                    {/* Offer Badge */}
                    {plan.offer && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.375rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
                      }}>
                        {plan.offer}
                      </div>
                    )}

                    {/* Selected Checkmark */}
                    {selectedPlan === plan.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: 'absolute',
                          top: '1.5rem',
                          right: '1.5rem',
                          backgroundColor: plan.color,
                          color: 'white',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <FiCheck size={20} strokeWidth={3} />
                      </motion.div>
                    )}

                    {/* Plan Name */}
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: plan.color,
                      marginBottom: '1rem',
                      marginTop: plan.offer ? '0.5rem' : '0',
                    }}>
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      {/* Show original price with strikethrough if there's a discount */}
                      {plan.hasDiscount && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem',
                        }}>
                          <span style={{
                            fontSize: '1.25rem',
                            color: '#9ca3af',
                            textDecoration: 'line-through',
                            fontWeight: '600',
                          }}>
                            ₹{plan.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#10b981',
                            fontWeight: '700',
                            backgroundColor: '#d1fae5',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                          }}>
                            Save {plan.discountPercentage}%
                          </span>
                        </div>
                      )}
                      
                      {/* Discounted or regular price */}
                      <span style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: plan.hasDiscount ? '#10b981' : '#111827',
                        lineHeight: '1',
                      }}>
                        {plan.price}
                      </span>
                      <div style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginTop: '0.5rem',
                        fontWeight: '500',
                      }}>
                        {plan.period}
                      </div>
                    </div>

                    {/* Features */}
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                    }}>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          marginBottom: '1rem',
                          color: '#374151',
                          fontSize: '0.95rem',
                        }}>
                          <FiCheck style={{ 
                            color: plan.color, 
                            flexShrink: 0,
                            marginTop: '0.125rem',
                            strokeWidth: 3,
                          }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}>
                {/* Only show Cancel button if payment is NOT required */}
                {!mustPay && (
                  <button
                    onClick={onClose}
                    style={{
                      padding: '0.875rem 2rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={!selectedPlan}
                  style={{
                    padding: '0.875rem 2rem',
                    backgroundColor: selectedPlan ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: selectedPlan ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: selectedPlan ? '0 4px 6px -1px rgba(59, 130, 246, 0.4)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPlan) e.target.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPlan) e.target.style.backgroundColor = '#3b82f6'
                  }}
                >
                  Confirm Plan
                </button>
              </div>
            </>
          )}

          {/* No Plans Available */}
          {!loading && !error && plans.length === 0 && (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                No subscription plans available at the moment.
              </p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Please contact the administrator.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
