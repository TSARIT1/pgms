import React from 'react'
import { Outlet } from 'react-router-dom'
import SuperAdminSidebar from '../components/sidebar/SuperAdminSidebar'

export default function SuperAdminLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}>
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '280px', // Space for sidebar
        overflowY: 'auto',
      }}>
        <Outlet />
      </div>
    </div>
  )
}
