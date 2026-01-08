# Quick Reference - Frontend-Backend Connection

## Quick Start

### Start Backend
```bash
cd pgm_Backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
# Runs on http://localhost:5173
```

---

## 📁 Key Files Created

### Services
- `src/services/apiConfig.js` - API configuration
- `src/services/apiHelper.js` - Generic fetch functions
- `src/services/adminService.js` - Admin APIs
- `src/services/tenantService.js` - Tenant APIs
- `src/services/roomService.js` - Room APIs
- `src/services/paymentService.js` - Payment APIs

### Context & Hooks
- `src/context/AuthContext.jsx` - Authentication state
- `src/hooks/useAuth.js` - Auth hook
- `src/hooks/useFetch.js` - API call hook
- `src/components/ProtectedRoute.jsx` - Protected routes

### Configuration
- `.env` - Environment variables
- `.env.development` - Dev config
- `.env.production` - Prod config

---

## 📚 Common Code Snippets

### Use Auth (Login/Logout)
```jsx
import { useAuth } from '../hooks/useAuth';

const { admin, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Logout
logout();
```

### Fetch Data
```jsx
import { useFetch } from '../hooks/useFetch';
import { getAllTenants } from '../services/tenantService';

const { data, loading, error, execute } = useFetch();

// Load data
useEffect(() => {
  execute(getAllTenants);
}, []);

// Use data: data?.data (first data is response, second is actual array)
```

### Protect Routes
```jsx
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🔌 API Endpoints Summary

### Admin
```
POST   /api/admin/register
POST   /api/admin/login
GET    /api/admin/{id}
PUT    /api/admin/{id}
DELETE /api/admin/{id}
```

### Tenants
```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/{id}
PUT    /api/tenants/{id}
DELETE /api/tenants/{id}
GET    /api/tenants/status/{status}
```

### Rooms
```
GET    /api/rooms
POST   /api/rooms
GET    /api/rooms/{id}
PUT    /api/rooms/{id}
DELETE /api/rooms/{id}
GET    /api/rooms/status/{status}
GET    /api/rooms/type/{type}
```

### Payments
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/{id}
PUT    /api/payments/{id}
DELETE /api/payments/{id}
GET    /api/payments/tenant/{tenantId}
GET    /api/payments/status/{status}
GET    /api/payments/date-range?startDate=X&endDate=Y
```

---

## 🧪 Testing Flow

1. **Backend**: Run `mvn spring-boot:run` ✅
2. **Frontend**: Run `npm run dev` ✅
3. **Register**: Go to `/register` and create admin ✅
4. **Login**: Go to `/login` with credentials ✅
5. **Dashboard**: Should show after login ✅
6. **CRUD Operations**: Use dashboard to manage data ✅

---

## ⚙️ Configuration

### Change API URL
Edit `.env`:
```
VITE_API_URL=http://localhost:8080/api
```

### Change Frontend Port
Edit `vite.config.js`:
```js
export default {
  server: {
    port: 5174  // Change port here
  }
}
```

### Change Backend Port
Edit `application.properties`:
```properties
server.port=8081  # Change port here
```

---

## 🐛 Debug Tips

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API calls to `http://localhost:8080/api`
4. Check request/response data

### Check Console
1. Open DevTools Console
2. Look for errors from API calls
3. Check logged data

### Check Backend Logs
1. Look at terminal where backend is running
2. Should see SQL queries and HTTP requests
3. Check for error messages

---

## 📋 Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] MySQL database created and populated
- [ ] Admin user registered in database
- [ ] Can login from frontend
- [ ] Tenants page loads and shows data
- [ ] Can create/edit/delete tenants
- [ ] Can view rooms and make payments
- [ ] All CRUD operations work

---

## 🎯 Next Steps

1. Update each page to use the API services
2. Add form validations
3. Add success/error notifications
4. Add JWT token authentication (optional)
5. Deploy to production

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Backend CORS already enabled |
| 404 Not Found | Check API endpoint URL matches backend |
| 401 Unauthorized | Login again, check credentials |
| 500 Server Error | Check backend logs, verify database |
| Network Error | Check backend is running on port 8080 |
| API returns null | Check response format in browser DevTools |

---

## 📖 Documentation Files

- `INTEGRATION_GUIDE.md` - Detailed integration examples
- `FRONTEND_BACKEND_SETUP.md` - Complete setup guide
- `API_DOCUMENTATION.md` (in backend) - Full API reference
- `README.md` (in backend) - Backend setup guide

---

**Status**: ✅ Frontend-Backend connection established and ready!
