# Frontend-Backend Connection Setup Guide

## Overview

The React frontend is now fully connected to the Spring Boot backend via REST APIs. All API calls go through a centralized service layer for better maintainability and error handling.

## Architecture

```
React Components
      ↓
   useAuth Hook / useFetch Hook
      ↓
Service Layer (adminService, tenantService, etc.)
      ↓
API Helper (apiHelper.js)
      ↓
HTTP Fetch API
      ↓
Spring Boot Backend (http://localhost:8080/api)
      ↓
Database (MySQL)
```

## Project Structure

### Frontend Services (`src/services/`)

```
src/services/
├── apiConfig.js          # API configuration and endpoints
├── apiHelper.js          # Generic fetch helper functions
├── adminService.js       # Admin API operations
├── tenantService.js      # Tenant API operations
├── roomService.js        # Room API operations
└── paymentService.js     # Payment API operations
```

### Frontend Context (`src/context/`)

```
src/context/
└── AuthContext.jsx       # Authentication state management
```

### Frontend Hooks (`src/hooks/`)

```
src/hooks/
├── useAuth.js           # Hook to access auth context
└── useFetch.js          # Hook for API calls with loading/error states
```

### Frontend Components

```
src/components/
└── ProtectedRoute.jsx   # Route protection for authenticated users
```

## Setup Instructions

### 1. Install Dependencies (Already in package.json)

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

The `.env` files are already configured:

**Development** (`.env.development`):
```
VITE_API_URL=http://localhost:8080/api
```

**Production** (`.env.production`):
```
VITE_API_URL=https://api.pgm.com/api
```

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

### 4. Ensure Backend is Running

```bash
cd pgm_Backend
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

## API Integration Examples

### Example 1: Using Auth Context in LoginPage

```jsx
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Example 2: Fetching Tenants List

```jsx
import { useFetch } from '../hooks/useFetch';
import { getAllTenants } from '../services/tenantService';
import { useEffect, useState } from 'react';

export const StudentListPage = () => {
  const { loading, error, execute } = useFetch();
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const response = await execute(getAllTenants);
        setTenants(response?.data || []);
      } catch (err) {
        console.error('Failed to load tenants:', err);
      }
    };
    loadTenants();
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Students/Tenants</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Room</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>{tenant.name}</td>
              <td>{tenant.email}</td>
              <td>{tenant.phone}</td>
              <td>{tenant.roomNumber}</td>
              <td>{tenant.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Example 3: Creating a Tenant

```jsx
import { createTenant } from '../services/tenantService';
import { useFetch } from '../hooks/useFetch';

export const TenantFormPage = () => {
  const { loading, error, execute } = useFetch();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    roomNumber: '',
    joiningDate: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await execute(createTenant, {
        ...formData,
        age: parseInt(formData.age),
      });
      console.log('Tenant created:', response.data);
      // Reset form or redirect
    } catch (err) {
      console.error('Failed to create tenant:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      {/* More inputs... */}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Tenant'}
      </button>
    </form>
  );
};
```

### Example 4: Room Management

```jsx
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService';
import { useFetch } from '../hooks/useFetch';

export const RoomListPage = () => {
  const { loading, error, execute } = useFetch();
  const [rooms, setRooms] = useState([]);

  const loadRooms = async () => {
    try {
      const response = await execute(getAllRooms);
      setRooms(response?.data || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await execute(deleteRoom, id);
      loadRooms(); // Refresh list
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div>
      <h1>Rooms</h1>
      <table>
        <thead>
          <tr>
            <th>Room #</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Occupied</th>
            <th>Rent</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.roomNumber}</td>
              <td>{room.type}</td>
              <td>{room.capacity}</td>
              <td>{room.occupiedBeds}</td>
              <td>₹{room.rent}</td>
              <td>{room.status}</td>
              <td>
                <button onClick={() => handleDelete(room.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Example 5: Payment Tracking

```jsx
import { getPaymentsByTenant, getPaymentsByStatus } from '../services/paymentService';
import { useFetch } from '../hooks/useFetch';

export const PaymentListPage = () => {
  const { loading, error, execute } = useFetch();
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadPayments = async () => {
    try {
      let response;
      if (filter === 'pending') {
        response = await execute(getPaymentsByStatus, 'PENDING');
      } else if (filter === 'completed') {
        response = await execute(getPaymentsByStatus, 'COMPLETED');
      } else {
        response = await execute(getAllPayments);
      }
      setPayments(response?.data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  return (
    <div>
      <h1>Payments</h1>
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>Tenant ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.tenantId}</td>
              <td>₹{payment.amount}</td>
              <td>{payment.paymentDate}</td>
              <td>{payment.method}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## API Response Format

All API responses follow this format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { /* entity data */ },
  "timestamp": "2024-12-06T10:30:00"
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "validationErrors": { /* field errors */ },
  "timestamp": "2024-12-06T10:30:00"
}
```

## Features Implemented

✅ **Authentication Context** - Global auth state management
✅ **Login/Register Integration** - Connected to backend auth APIs
✅ **Protected Routes** - Route protection for authenticated users
✅ **API Service Layer** - Centralized API calls
✅ **Error Handling** - Global error management
✅ **Loading States** - Loading indicators during API calls
✅ **Environment Variables** - Dev and production configs
✅ **Custom Hooks** - `useAuth` and `useFetch` for easy integration
✅ **CORS Enabled** - Backend configured for frontend requests

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: CORS is already configured in the backend. Ensure backend is running on `http://localhost:8080`

### Issue: API Not Found
**Solution**: Check that the backend API URL in `.env` matches the running backend URL

### Issue: Authentication Not Working
**Solution**: Verify credentials exist in the database. Admin must be registered first.

### Issue: Port Already in Use
**Solution**: 
- Frontend: Change port in `vite.config.js`
- Backend: Change `server.port` in `application.properties`

## Testing the Connection

### 1. Register Admin
```bash
curl -X POST http://localhost:8080/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@pgm.com",
    "phone": "9876543210",
    "password": "admin@123"
  }'
```

### 2. Login from Frontend
Navigate to `http://localhost:5173/login` and use:
- Email: admin@pgm.com
- Password: admin@123

### 3. Verify in Console
Open browser console and check:
- Network tab shows API calls to `http://localhost:8080/api`
- Application tab shows `admin` data in localStorage

## Next Steps

1. **Update existing components** to use the API services
2. **Add form validation** on frontend
3. **Add success/error notifications** for user feedback
4. **Implement JWT token** for better security (optional)
5. **Add request interceptors** for common headers (optional)
6. **Add caching** for frequently accessed data (optional)

## Support

For issues or questions:
1. Check the INTEGRATION_GUIDE.md
2. Review example implementations in this guide
3. Check browser console for error messages
4. Verify backend logs for API errors
