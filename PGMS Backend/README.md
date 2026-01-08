# PG Management System - Spring Boot Backend

A complete Spring Boot backend application for managing a PG (Hostel) Management System. This project provides REST APIs for managing admins, tenants, rooms, and payments.

## Features

✅ Complete CRUD operations for all entities
✅ RESTful API design
✅ Spring Data JPA with Hibernate ORM
✅ MySQL Database support
✅ Input validation using Spring Validation
✅ Global exception handling
✅ CORS configuration
✅ Request/Response JSON serialization
✅ Comprehensive API documentation
✅ Clean architecture with service layer pattern
✅ Lombok for reducing boilerplate code
✅ Proper error handling and logging

## Technology Stack

- **Java**: 21
- **Spring Boot**: 4.0.0
- **Spring Web**: REST APIs
- **Spring Data JPA**: Database ORM
- **Hibernate**: Database mapping
- **MySQL**: Database
- **Lombok**: Code generation
- **Spring Validation**: Input validation
- **Spring Boot DevTools**: Development tools
- **Maven**: Build management

## Project Structure

```
pgm_Backend/
├── src/
│   ├── main/
│   │   ├── java/com/pgm/pgm_Backend/
│   │   │   ├── model/
│   │   │   │   ├── Admin.java
│   │   │   │   ├── Tenant.java
│   │   │   │   ├── Room.java
│   │   │   │   └── Payment.java
│   │   │   ├── repository/
│   │   │   │   ├── AdminRepository.java
│   │   │   │   ├── TenantRepository.java
│   │   │   │   ├── RoomRepository.java
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── service/
│   │   │   │   ├── AdminService.java
│   │   │   │   ├── TenantService.java
│   │   │   │   ├── RoomService.java
│   │   │   │   └── PaymentService.java
│   │   │   ├── service/impl/
│   │   │   │   ├── AdminServiceImpl.java
│   │   │   │   ├── TenantServiceImpl.java
│   │   │   │   ├── RoomServiceImpl.java
│   │   │   │   └── PaymentServiceImpl.java
│   │   │   ├── controller/
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── TenantController.java
│   │   │   │   ├── RoomController.java
│   │   │   │   └── PaymentController.java
│   │   │   ├── exception/
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java
│   │   │   ├── utils/
│   │   │   │   ├── ResponseUtil.java
│   │   │   │   └── ValidationUtil.java
│   │   │   └── PgmBackendApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/pgm/pgm_Backend/
│           └── PgmBackendApplicationTests.java
├── pom.xml
├── API_DOCUMENTATION.md
├── DATABASE_SETUP.sql
└── README.md
```

## Database Schema

### Admins Table
```sql
CREATE TABLE admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tenants Table
```sql
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    joining_date DATE NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    occupied_beds INT NOT NULL DEFAULT 0,
    rent DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'Monthly',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

## Prerequisites

- Java 21 or later
- MySQL Server 8.0 or later
- Maven 3.6 or later
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TSARIT1/PG_Management_Software.git
cd pgm_Backend
```

### 2. Create Database
```bash
# Connect to MySQL
mysql -u root -p

# Run the database setup script
source DATABASE_SETUP.sql
```

Or use MySQL Workbench to import `DATABASE_SETUP.sql`

### 3. Configure application.properties
Edit `src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pgm_database?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 4. Build the Project
```bash
mvn clean install
```

### 5. Run the Application
```bash
mvn spring-boot:run
```

Or run the JAR file:
```bash
java -jar target/pgm_Backend-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

## API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Admin APIs
```
POST   /admin/register         - Register a new admin
POST   /admin/login            - Admin login
GET    /admin/{id}             - Get admin by ID
PUT    /admin/{id}             - Update admin
DELETE /admin/{id}             - Delete admin
```

### Tenant APIs
```
GET    /tenants                - Get all tenants
GET    /tenants/{id}           - Get tenant by ID
POST   /tenants                - Create new tenant
PUT    /tenants/{id}           - Update tenant
DELETE /tenants/{id}           - Delete tenant
GET    /tenants/status/{status} - Get tenants by status
```

### Room APIs
```
GET    /rooms                  - Get all rooms
GET    /rooms/{id}             - Get room by ID
POST   /rooms                  - Create new room
PUT    /rooms/{id}             - Update room
DELETE /rooms/{id}             - Delete room
GET    /rooms/status/{status}  - Get rooms by status
GET    /rooms/type/{type}      - Get rooms by type
```

### Payment APIs
```
GET    /payments               - Get all payments
GET    /payments/{id}          - Get payment by ID
POST   /payments               - Create new payment
PUT    /payments/{id}          - Update payment
DELETE /payments/{id}          - Delete payment
GET    /payments/tenant/{id}   - Get payments by tenant
GET    /payments/status/{status} - Get payments by status
GET    /payments/date-range    - Get payments by date range
```

For detailed API documentation with request/response examples, see `API_DOCUMENTATION.md`

## Sample Requests

### Register Admin
```bash
curl -X POST http://localhost:8080/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "admin@pgm.com",
    "phone": "9876543210",
    "password": "secure_password"
  }'
```

### Create Tenant
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "age": 22,
    "phone": "9876543211",
    "email": "rajesh@email.com",
    "roomNumber": "101",
    "joiningDate": "2024-12-06",
    "address": "123 Main Street, City"
  }'
```

### Get All Tenants
```bash
curl -X GET http://localhost:8080/api/tenants
```

### Create Room
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "type": "Double",
    "capacity": 2,
    "occupiedBeds": 0,
    "rent": 15000.0
  }'
```

### Create Payment
```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "amount": 15000.0,
    "paymentDate": "2024-12-06",
    "method": "TRANSFER",
    "status": "COMPLETED",
    "notes": "December rent"
  }'
```

## Validation Rules

### Admin
- Name: Non-blank, max 100 characters
- Email: Valid email format, unique
- Phone: 10 digits, unique
- Password: Non-blank

### Tenant
- Name: Non-blank, max 100 characters
- Age: Between 18-100
- Phone: 10 digits, unique
- Email: Valid email format, unique
- Room Number: Non-blank
- Joining Date: Valid date
- Address: Non-blank

### Room
- Room Number: Non-blank, unique
- Type: "Single" or "Double"
- Capacity: Minimum 1
- Occupied Beds: Non-negative
- Rent: Greater than 0

### Payment
- Tenant ID: Must exist
- Amount: Greater than 0
- Payment Date: Valid date
- Method: CASH, CHEQUE, TRANSFER, CARD, or UPI
- Status: PENDING, COMPLETED, FAILED, or CANCELLED

## Error Handling

The application includes global exception handling with the following error responses:

### 400 Bad Request
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "validationErrors": {
    "email": "Email should be valid"
  },
  "timestamp": "2024-12-06T10:30:00"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Tenant not found with id: 999",
  "timestamp": "2024-12-06T10:30:00"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2024-12-06T10:30:00"
}
```

## Configuration

### application.properties
The main configuration file is located at `src/main/resources/application.properties`

Key configurations:
- **Server Port**: 8080
- **Database URL**: jdbc:mysql://localhost:3306/pgm_database
- **JPA DDL Auto**: update (auto-creates/updates tables)
- **Show SQL**: true (logs SQL queries)
- **Jackson Time Zone**: UTC

## CORS Support

CORS is configured in `CorsConfig.java` to allow requests from all origins with methods: GET, POST, PUT, DELETE, OPTIONS

## Logging

Logging is configured with the following levels:
- **Root Logger**: INFO
- **Application Package**: DEBUG
- **Spring Web**: DEBUG
- **Hibernate SQL**: DEBUG

## Development

### Dependencies
All dependencies are managed in `pom.xml`

### Code Structure
- **Models**: JPA entities with validation annotations
- **Repositories**: Spring Data JPA repositories
- **Services**: Business logic implementation
- **Controllers**: REST endpoints
- **Exception Handling**: Global exception handler
- **Utilities**: Helper classes for validation and response formatting

### Best Practices
- All endpoints return standard JSON response format
- Proper HTTP status codes (201 for creation, 200 for success, 400 for bad request, 404 for not found)
- Input validation using Spring Validation annotations
- Timestamps for all entities
- Proper exception handling and logging

## Testing

To run tests:
```bash
mvn test
```

## Troubleshooting

### MySQL Connection Failed
- Ensure MySQL server is running
- Verify credentials in application.properties
- Check if database exists

### Port 8080 Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Table Not Created
- Check if `spring.jpa.hibernate.ddl-auto=update` is set
- Manually run `DATABASE_SETUP.sql`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Links

- [Frontend Repository](https://github.com/TSARIT1/PG_Management_Software)
- [API Documentation](API_DOCUMENTATION.md)
- [Database Setup](DATABASE_SETUP.sql)

---

**Version**: 0.0.1  
**Last Updated**: December 6, 2024  
**Status**: Ready for Production
