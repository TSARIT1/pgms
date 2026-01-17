import React from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import AdminNavbar from '../components/navbar/AdminNavbar'
import AdminSidebar from '../components/sidebar/AdminSidebar'
import SubscriptionExpiredModal from '../components/subscription/SubscriptionExpiredModal'
import { useAuth } from '../context/AuthContext'
import '../styles/layout.css'

export default function AdminLayout() {
  const { admin, isSubscriptionExpired, refreshAdminData } = useAuth()
  const location = useLocation()

  // Allow access to profile page even when subscription is expired
  const allowedPathsWhenExpired = ['/profile']
  const isAllowedPath = allowedPathsWhenExpired.some(path => location.pathname.startsWith(path))

  // If subscription is expired and user is trying to access a blocked page, redirect to profile
  if (isSubscriptionExpired && !isAllowedPath) {
    return (
      <div className="app-container">
        <AdminSidebar />
        <div className="main-content-wrapper">
          <AdminNavbar />
          <div className="content-area">
            <Navigate to="/profile" replace />
          </div>
        </div>
        <SubscriptionExpiredModal
          isOpen={isSubscriptionExpired}
          adminData={admin}
          onSubscriptionPurchased={refreshAdminData}
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content-wrapper">
        <AdminNavbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
      {/* Show modal when subscription is expired */}
      <SubscriptionExpiredModal
        isOpen={isSubscriptionExpired}
        adminData={admin}
        onSubscriptionPurchased={refreshAdminData}
      />
    </div>
  )
}
