import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiArrowRight, FiUsers, FiHome, FiAward, FiChevronLeft, FiChevronRight, FiSearch, FiImage, FiX, FiLock } from 'react-icons/fi'
import AppointmentForm from '../../components/appointment/AppointmentForm'
import { getAllPGHostels, sendLoginOtp, verifyLoginOtp } from '../../services/adminService'
import { getActivePlans } from '../../services/subscriptionService'

export default function LandingPage() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pgHostels, setPgHostels] = useState([])
  const [loadingHostels, setLoadingHostels] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [selectedHostelPhotos, setSelectedHostelPhotos] = useState([])
  const [selectedHostelName, setSelectedHostelName] = useState('')
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedHostelId, setSelectedHostelId] = useState(null)
  
  // SuperAdmin Login States
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)
  
  // SuperAdmin Login OTP States
  const [showAdminOtpModal, setShowAdminOtpModal] = useState(false)
  const [adminLoginOtp, setAdminLoginOtp] = useState('')
  const [adminOtpError, setAdminOtpError] = useState('')
  const [adminOtpLoading, setAdminOtpLoading] = useState(false)

  // Background images array
  const backgroundImages = [
    '/images/young-friends-hostel.jpg',
    '/images/taton-moise-ukQQm0mLWyI-unsplash.jpg',
    '/images/maria-moroz-hzWyJwwLYw0-unsplash.jpg',
  ]

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch PG/Hostels on mount
  useEffect(() => {
    fetchPGHostels()
    fetchSubscriptionPlans()
  }, [])

  const fetchPGHostels = async () => {
    try {
      setLoadingHostels(true)
      const response = await getAllPGHostels()
      if (response.status === 'success') {
        setPgHostels(response.data)
      }
    } catch (error) {
      console.error('Error fetching PG/Hostels:', error)
      setPgHostels([])
    } finally {
      setLoadingHostels(false)
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true)
      const plans = await getActivePlans()
      setSubscriptionPlans(plans)
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    // Set the search query and scroll to PG listings section
    if (searchQuery.trim()) {
      scrollToSection('pg-listings')
    }
  }

  // Handle location search
  const handleLocationSearch = async (e) => {
    e.preventDefault()
    if (locationSearch.trim()) {
      try {
        setLoadingLocations(true)
        
        // Geocode the searched location
        const geocoded = await geocodeAddress(locationSearch)
        
        if (geocoded) {
          setSearchCenter({ lat: geocoded.lat, lng: geocoded.lng })
          
          // Filter hostels within the search radius
          const nearby = hostelLocations.filter(hostel => {
            if (!hostel.latitude || !hostel.longitude) return false
            
            const distance = calculateDistance(
              geocoded.lat,
              geocoded.lng,
              hostel.latitude,
              hostel.longitude
            )
            
            return distance <= searchRadius
          })
          
          setFilteredLocations(nearby)
          setShowMap(true)
          
          // Scroll to map section
          setTimeout(() => {
            const mapSection = document.getElementById('map-section')
            if (mapSection) {
              mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        } else {
          // Fallback: Show all locations if geocoding fails
          console.warn('Geocoding failed, showing all locations')
          setFilteredLocations(hostelLocations)
          setSearchCenter(null) // Will use default center or calculate from locations
          setShowMap(true)
          
          alert(
            'Unable to geocode your search location. This may be due to:\n\n' +
            '1. Google Maps billing not enabled in your Google Cloud account\n' +
            '2. API restrictions\n\n' +
            'Showing all registered PG/Hostels instead. You can browse the map to find locations near you.'
          )
          
          // Scroll to map section
          setTimeout(() => {
            const mapSection = document.getElementById('map-section')
            if (mapSection) {
              mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        }
      } catch (error) {
        console.error('Error searching location:', error)
        // Fallback: Show all locations on error
        setFilteredLocations(hostelLocations)
        setSearchCenter(null)
        setShowMap(true)
        
        alert(
          'Failed to search location. Showing all registered PG/Hostels instead.'
        )
        
        // Scroll to map section
        setTimeout(() => {
          const mapSection = document.getElementById('map-section')
          if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } finally {
        setLoadingLocations(false)
      }
    }
  }

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length)
  }

  // SuperAdmin Login Handlers
  const handleAdminLogin = async () => {
    setAdminLoginError('')
    
    // Validate email field
    if (!adminEmail) {
      setAdminLoginError('Email is required')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(adminEmail)) {
      setAdminLoginError('Please enter a valid email address')
      return
    }
    
    try {
      setAdminLoginLoading(true)
      // Send OTP directly to the email
      const otpResponse = await sendLoginOtp(adminEmail)
      if (otpResponse.status === 'success') {
        setShowAdminLoginModal(false)
        setShowAdminOtpModal(true)
      }
    } catch (err) {
      setAdminLoginError(err.message || 'Failed to send OTP. Please check your email.')
    } finally {
      setAdminLoginLoading(false)
    }
  }

  const handleVerifyAdminOtp = async () => {
    if (!adminLoginOtp || adminLoginOtp.length !== 6) {
      setAdminOtpError('Please enter a valid 6-digit OTP')
      return
    }

    try {
      setAdminOtpLoading(true)
      setAdminOtpError('')
      
      const response = await verifyLoginOtp(adminEmail, adminLoginOtp)
      
      if (response.status === 'success' && response.verified) {
        // Store token and user data
        localStorage.setItem('token', response.token)
        localStorage.setItem('admin', JSON.stringify(response.data))
        localStorage.setItem('role', response.role)
        
        // Close modal first
        setShowAdminOtpModal(false)
        setAdminLoginOtp('')
        
        // Use window.location.href instead of navigate() to force page reload
        // This ensures AuthContext re-reads from localStorage
        if (response.role === 'SUPER_ADMIN') {
          window.location.href = '/superadmin'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setAdminOtpError('Invalid or expired OTP')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setAdminOtpError(err.message || 'Failed to verify OTP')
    } finally {
      setAdminOtpLoading(false)
    }
  }


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1 },
    },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation Bar */}
      <motion.nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: isScrolled ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => scrollToSection('hero')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <img 
              src="/images/pg-hostel-logo.jpg" 
              alt="PG Hostel Logo" 
              style={{
                height: '60px',
                width: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: '0 1 300px',
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="Search by location (e.g., Pune, Mumbai, Delhi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: '2rem',
                border: isScrolled ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: isScrolled ? 'white' : 'rgba(255, 255, 255, 0.2)',
                color: isScrolled ? '#111827' : 'white',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.backgroundColor = 'white'
                e.target.style.color = '#111827'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.3)'
                e.target.style.backgroundColor = isScrolled ? 'white' : 'rgba(255, 255, 255, 0.2)'
                e.target.style.color = isScrolled ? '#111827' : 'white'
              }}
            />
            <FiSearch
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isScrolled ? '#6b7280' : 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem',
              }}
            />
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Appointment', id: 'appointment' },
              { label: 'Plans', id: 'pricing' },
              { label: 'About Us', id: 'about' },
              { label: 'Contact Us', id: 'info' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isScrolled ? '#111827' : 'white',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem 0',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isScrolled ? '#111827' : 'white'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: 'transparent',
                color: isScrolled ? '#3b82f6' : 'white',
                border: `2px solid ${isScrolled ? '#3b82f6' : 'white'}`,
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Register PG/Hostel
            </motion.button>
          </div>
        </div>
      </motion.nav>
      {/* Hero Section */}
      <motion.section
        id="hero"
        className="hero-section"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image Slider */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: currentSlide === index ? 1 : 0,
            }}
          />
        ))}
        
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 2 }} />
        
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <FiChevronLeft />
        </button>

        <button
          onClick={goToNext}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <FiChevronRight />
        </button>

        {/* Slide Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            gap: '1rem',
          }}
        >
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentSlide === index ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (currentSlide !== index) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentSlide !== index) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                }
              }}
            />
          ))}
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            width: '100%',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <img 
              src="/images/pg-hostel-logo.jpg" 
              alt="PG Hostel Logo" 
              style={{
                height: '150px',
                width: 'auto',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                border: '4px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Welcome to TSAR IT PG/Hostel Management platform
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              marginBottom: '1.5rem',
              opacity: 0.95,
              fontWeight: '300',
            }}
          >
            Your Home Away From Home - Modern Management, Premium Living Experience
          </motion.p>

          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2rem',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Login <FiArrowRight />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Register PG/Hostel
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* PG/Hostel Listings Section */}
      <motion.section
        id="pg-listings"
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: 'white',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#111827',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            🏠 Available PG/Hostels
          </motion.h2>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '3rem',
            fontSize: '1.125rem',
          }}>
            Browse through our registered PG/Hostels and find your perfect home
          </p>

          {/* Location Search Bar */}
          <div style={{
            maxWidth: '600px',
            margin: '0 auto 2rem',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
            }}>
              <FiSearch style={{
                position: 'absolute',
                left: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.25rem',
                color: '#6b7280',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search by location (e.g., Pune, Mumbai, Delhi)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3.5rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '50px',
                  backgroundColor: '#f9fafb',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.backgroundColor = '#f9fafb'
                }}
              />
            </div>
          </div>

          {loadingHostels ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>Loading PG/Hostels...</p>
            </div>
          ) : (() => {
            // Filter PG/Hostels based on search query
            const filteredHostels = searchQuery.trim()
              ? pgHostels.filter(hostel =>
                  hostel.hostelAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  hostel.hostelName?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : pgHostels;

            // Pagination logic
            const totalPages = Math.ceil(filteredHostels.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedHostels = filteredHostels.slice(startIndex, endIndex)

            return filteredHostels.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>No PG/Hostels registered yet</p>
            </div>
          ) : (
            <>
              <div style={{
                overflowX: 'auto',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '2px solid #e5e7eb',
                    }}>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>PG/Hostel Name</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Manager</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Phone</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Email</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Address</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Location</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Photos</th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHostels.map((hostel, index) => {
                      let hostelPhotosArray = []
                      try {
                        if (hostel.hostelPhotos) {
                          hostelPhotosArray = JSON.parse(hostel.hostelPhotos)
                        }
                      } catch (e) {
                        console.error('Error parsing hostel photos:', e)
                      }

                      return (
                        <motion.tr
                          key={hostel.id}
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                          }}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          viewport={{ once: true }}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                        >
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#111827',
                          }}>
                            {hostel.hostelName || 'PG/Hostel'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.95rem',
                            color: '#6b7280',
                          }}>
                            {hostel.name || 'N/A'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.95rem',
                            color: '#374151',
                          }}>
                            {hostel.phone || 'N/A'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.95rem',
                            color: '#374151',
                          }}>
                            {hostel.email || 'N/A'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.95rem',
                            color: '#374151',
                            maxWidth: '250px',
                          }}>
                            {hostel.hostelAddress || 'N/A'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center',
                          }}>
                            {hostel.locationLink ? (
                              <a
                                href={hostel.locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#3b82f6',
                                  textDecoration: 'underline',
                                  fontSize: '0.875rem',
                                }}
                              >
                                View Map
                              </a>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>N/A</span>
                            )}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center',
                          }}>
                            {hostelPhotosArray.length > 0 ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedHostelPhotos(hostelPhotosArray)
                                  setSelectedHostelName(hostel.hostelName)
                                  setIsPhotoModalOpen(true)
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <FiImage /> View ({hostelPhotosArray.length})
                              </motion.button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No photos</span>
                            )}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center',
                          }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedHostelId(hostel.id)
                                scrollToSection('appointment')
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              Book <FiArrowRight />
                            </motion.button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '2rem',
                  flexWrap: 'wrap',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
                      color: currentPage === 1 ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: page !== currentPage ? 1.1 : 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: page === currentPage ? '#3b82f6' : 'white',
                        color: page === currentPage ? 'white' : '#374151',
                        border: `2px solid ${page === currentPage ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '40px',
                      }}
                    >
                      {page}
                    </motion.button>
                  ))}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6',
                      color: currentPage === totalPages ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </>
          );
        })()}
        </div>
      </motion.section>

      {/* Appointment Section */}
      <motion.section
        id="appointment"
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: '#f9fafb',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#111827',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Book Your Visit
          </motion.h2>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '3rem',
            fontSize: '1.125rem',
          }}>
            Schedule an appointment to visit your preferred PG/Hostel
          </p>
          
          <AppointmentForm selectedHostelId={selectedHostelId} />
        </div>
      </motion.section>

      {/* Subscription Plans Section */}
      <motion.section
        id="pricing"
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: '#f9fafb',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#111827',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Subscription Plans
          </motion.h2>
          <p
            style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '1.1rem',
              marginBottom: '3rem',
            }}
          >
            Choose the perfect plan for your PG/Hostel management needs
          </p>

          {loadingPlans ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Loading subscription plans...
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                padding: '0 1rem',
              }}
            >
              {subscriptionPlans.map((plan, index) => {
                // Define colors for each plan
                const colors = [
                  { border: '#3b82f6', badge: '#3b82f6', icon: '#3b82f6', button: '#3b82f6' }, // Blue
                  { border: '#6366f1', badge: '#6366f1', icon: '#6366f1', button: '#6366f1' }, // Indigo
                  { border: '#f59e0b', badge: '#f59e0b', icon: '#f59e0b', button: '#f59e0b' }, // Orange
                  { border: '#8b5cf6', badge: '#8b5cf6', icon: '#8b5cf6', button: '#8b5cf6' }, // Purple
                ]
                const planColor = colors[index % colors.length]
                
                return (
                  <motion.div
                    key={plan.id}
                    style={{
                      background: 'white',
                      borderRadius: '1rem',
                      padding: '2.5rem 2rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: `2px solid ${planColor.border}`,
                      position: 'relative',
                      overflow: 'visible',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' }}
                  >
                    {/* Badge */}
                    {plan.offer && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '20px',
                          background: planColor.badge,
                          color: 'white',
                          padding: '0.375rem 1rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {plan.offer}
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `${planColor.icon}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <FiHome style={{ fontSize: '1.75rem', color: planColor.icon }} />
                    </div>

                    {/* Plan Name */}
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {plan.name}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        minHeight: '40px',
                      }}
                    >
                      {(() => {
                        // Determine plan term based on duration
                        let planTerm = 'short-term';
                        
                        if (plan.durationType === 'DAY') {
                          planTerm = 'short-term';
                        } else if (plan.durationType === 'MONTH') {
                          if (plan.duration < 1) {
                            planTerm = 'short-term';
                          } else if (plan.duration >= 1 && plan.duration < 3) {
                            planTerm = 'medium-term';
                          } else {
                            planTerm = 'long-term';
                          }
                        }
                        
                        return `Perfect for ${planTerm} PG/Hostel management`;
                      })()}
                    </p>

                    {/* Pricing */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      {(() => {
                        // Calculate discount if offer exists
                        let discountedPrice = plan.price
                        let discountPercentage = 0
                        let hasDiscount = false

                        if (plan.offer) {
                          const match = plan.offer.match(/(\d+)/)
                          if (match) {
                            discountPercentage = parseInt(match[1])
                            discountedPrice = Math.round(plan.price - (plan.price * discountPercentage / 100))
                            hasDiscount = true
                          }
                        }

                        return (
                          <>
                            {/* Show original price with strikethrough if there's a discount */}
                            {hasDiscount && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.75rem',
                              }}>
                                <span style={{
                                  fontSize: '1.25rem',
                                  color: '#9ca3af',
                                  textDecoration: 'line-through',
                                  fontWeight: '600',
                                }}>
                                  ₹{plan.price.toLocaleString()}
                                </span>
                                <span style={{
                                  fontSize: '0.875rem',
                                  color: '#10b981',
                                  fontWeight: '700',
                                  backgroundColor: '#d1fae5',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                }}>
                                  Save {discountPercentage}%
                                </span>
                              </div>
                            )}

                            {/* Discounted or regular price */}
                            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                              <span style={{ 
                                fontSize: '2rem', 
                                color: hasDiscount ? '#10b981' : '#6b7280', 
                                fontWeight: '600' 
                              }}>₹</span>
                              <span style={{ 
                                fontSize: '3.5rem', 
                                fontWeight: '800', 
                                color: hasDiscount ? '#10b981' : '#1f2937', 
                                lineHeight: '1' 
                              }}>
                                {discountedPrice.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                /{plan.duration}{plan.durationType === 'MONTH' ? 'mo' : 'd'}
                              </span>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    {/* Features Section */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Key Features
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {JSON.parse(plan.features || '[]').map((feature, idx) => (
                          <li
                            key={idx}
                            style={{
                              padding: '0.625rem 0',
                              color: '#374151',
                              display: 'flex',
                              alignItems: 'flex-start',
                              fontSize: '0.95rem',
                            }}
                          >
                            <span style={{ color: planColor.icon, marginRight: '0.75rem', fontSize: '1.25rem', lineHeight: '1' }}>
                              ✓
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/register?plan=${encodeURIComponent(plan.name)}&planId=${plan.id}`)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: planColor.button,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Get Started Now
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        style={{
          padding: '3rem 1.5rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: '#111827',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose Us?
          </motion.h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                icon: FiHome,
                title: 'Modern Facilities',
                desc: 'State-of-the-art amenities and well-maintained rooms',
              },
              {
                icon: FiUsers,
                title: 'Community Living',
                desc: 'Safe and friendly environment for students',
              },
              {
                icon: FiAward,
                title: 'Professional Management',
                desc: '24/7 support and efficient PG/Hostel management system',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '2rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    borderLeft: '4px solid #3b82f6',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Icon style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>


      {/* CTA Section */}
      <motion.section
        style={{
          padding: '2.5rem 1.5rem',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/images/zoshua-colah-TzMGehZmocI-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          color: 'white',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: '700',
            marginBottom: '1rem',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Ready to Join Our Community?
        </motion.h2>

        <motion.p
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
            marginBottom: '1.5rem',
            opacity: 0.9,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Register now to secure your spot in Elite Hostel
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Get Started <FiArrowRight />
        </motion.button>
      </motion.section>

      {/* Info Section - Contact Details */}
      <motion.section
        id="info"
        style={{
          padding: '3rem 1.5rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: '#111827',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Contact Us
          </motion.h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                icon: FiMapPin,
                title: 'Address',
                content: '12-203/745, CHURCH STREET, NAKKABANDA, Punganur, Madanapalle, Chittoor- 517247, Andhra Pradesh',
              },
              {
                icon: FiPhone,
                title: 'Phone',
                content: '+91 94913 01258',
              },
              {
                icon: FiMail,
                title: 'Email',
                content: 'tsarit@tsaritservices.com',
              },
            ].map((info, idx) => {
              const Icon = info.icon
              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)' }}
                >
                  <Icon style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                    {info.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{info.content}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer
        style={{
          padding: '1.5rem 1rem',
          backgroundColor: '#1f2937',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>
          © 2025 TSAR IT PG/HMS All rights reserved.
        </p>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
          Premium Student Housing | Modern Management | Professional Service
        </p>
        
        {/* SuperAdmin Login Button */}
        <motion.button
          onClick={() => setShowAdminLoginModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          🔐 SuperAdmin Login
        </motion.button>
      </footer>

      {/* Photo Modal */}
      {isPhotoModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
              }}>
                {selectedHostelName} - Photos
              </h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {/* Photos Grid */}
            <div style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}>
              {selectedHostelPhotos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <img
                    src={`http://localhost:8080${photo}`}
                    alt={`${selectedHostelName} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SuperAdmin Login Modal */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAdminLoginModal(false)
              setAdminEmail('')
              setAdminLoginError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowAdminLoginModal(false)
                  setAdminEmail('')
                  setAdminLoginError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>SuperAdmin Login</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Enter your SuperAdmin credentials to access the system
                </p>
                
                {/* Email Field */}
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email Address"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                />
                
                {adminLoginError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{adminLoginError}</p>}
                
                <button
                  onClick={handleAdminLogin}
                  disabled={adminLoginLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: adminLoginLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adminLoginLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {adminLoginLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SuperAdmin Login OTP Verification Modal */}
      <AnimatePresence>
        {showAdminOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAdminOtpModal(false)
              setAdminLoginOtp('')
              setAdminOtpError('')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowAdminOtpModal(false)
                  setAdminLoginOtp('')
                  setAdminOtpError('')
                }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid #1f2937',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                <FiX />
              </button>
              <div style={{ textAlign: 'center' }}>
                <FiLock style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Verify OTP</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  We've sent a 6-digit code to {adminEmail}
                </p>
                <input
                  type="text"
                  value={adminLoginOtp}
                  onChange={(e) => setAdminLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    margin: '1rem 0',
                  }}
                />
                {adminOtpError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{adminOtpError}</p>}
                <button
                  onClick={handleVerifyAdminOtp}
                  disabled={adminOtpLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: adminOtpLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adminOtpLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '0.75rem',
                  }}
                >
                  {adminOtpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await sendLoginOtp(adminEmail)
                      setAdminOtpError('')
                      alert('OTP resent successfully!')
                    } catch (err) {
                      setAdminOtpError(err.message || 'Failed to resend OTP')
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
