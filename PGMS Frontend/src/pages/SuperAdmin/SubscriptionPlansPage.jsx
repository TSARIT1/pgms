import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX } from 'react-icons/fi'

export default function SubscriptionPlansPage() {
  const plans = [
    {
      id: 'BASIC',
      name: 'Basic Plan',
      price: '₹0',
      period: 'Free Forever',
      color: '#6b7280',
      features: [
        'Up to 20 students',
        'Basic features',
        'Email support',
        'Monthly reports',
        'Basic analytics',
      ],
      limitations: [
        'No priority support',
        'Limited customization',
      ],
    },
    {
      id: 'PREMIUM',
      name: 'Premium Plan',
      price: '₹999',
      period: 'per month',
      color: '#3b82f6',
      popular: true,
      features: [
        'Up to 50 students',
        'All basic features',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Automated reports',
      ],
      limitations: [
        'Limited to 50 students',
      ],
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Plan',
      price: '₹1,999',
      period: 'per month',
      color: '#8b5cf6',
      features: [
        'Unlimited students',
        'All premium features',
        '24/7 support',
        'Custom integrations',
        'Dedicated account manager',
        'White-label solution',
        'Advanced security',
        'Custom workflows',
      ],
      limitations: [],
    },
  ]

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
            Subscription Plans
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem' }}>
            Available subscription tiers for PG/Hostel owners
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: plan.popular ? '0 10px 40px rgba(59, 130, 246, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: plan.popular ? `3px solid ${plan.color}` : 'none',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 15px 45px ${plan.color}40`,
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  backgroundColor: plan.color,
                  color: 'white',
                  padding: '0.375rem 1rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}>
                  Most Popular
                </div>
              )}

              <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
              }}>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: plan.color,
                  marginBottom: '1rem',
                }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#111827',
                  }}>
                    {plan.price}
                  </span>
                </div>
                <span style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                }}>
                  {plan.period}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Features
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      color: '#374151',
                    }}>
                      <div style={{
                        backgroundColor: `${plan.color}20`,
                        borderRadius: '50%',
                        padding: '0.25rem',
                      }}>
                        <FiCheck style={{ color: plan.color }} size={16} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Limitations
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}>
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                        color: '#6b7280',
                      }}>
                        <FiX style={{ color: '#ef4444' }} size={16} />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
