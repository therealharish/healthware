# Healthware Backend

A comprehensive healthcare management system backend built with Node.js, Express, and MongoDB.

## 🏥 Overview

Healthware Backend is a RESTful API that powers a digital healthcare platform, enabling seamless communication between patients, doctors, and healthcare administrators. The system provides secure authentication, appointment management, prescription handling, and comprehensive medical data management.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Patient/Doctor)
- Secure password hashing with bcryptjs
- Protected routes with middleware

### 👥 User Management
- User registration and login for patients and doctors
- Profile management with medical specialties
- Automatic patient/doctor record creation
- Password validation and security

### 📅 Appointment System
- Real-time appointment booking
- Doctor availability management
- Time slot conflict prevention
- Appointment status tracking (scheduled, completed, cancelled)
- Smart time filtering for same-day bookings

### 💊 Prescription Management
- Digital prescription creation
- Prescription history tracking
- Medicine integration
- Patient-doctor prescription linking

### 🧪 Medical Testing
- Test booking and management
- Lab integration system
- Test result storage
- Fasting requirement tracking

### 🏥 Healthcare Data Models
- Patient medical history
- Doctor profiles with specialties
- Appointment records
- Medicine catalog
- Test categories and pricing

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration
- **Cross-Origin**: CORS enabled

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User schema (patients & doctors)
│   ├── Appointment.js       # Appointment management
│   ├── Doctor.js            # Doctor-specific data
│   ├── Patient.js           # Patient medical records
│   ├── Medicine.js          # Medicine catalog
│   ├── Prescription.js      # Digital prescriptions
│   ├── Test.js              # Medical tests
│   ├── Lab.js               # Laboratory information
│   ├── TestBooking.js       # Test appointments
│   └── Order.js             # Medicine orders
├── routes/
│   ├── doctorRoutes.js      # Doctor-specific endpoints
│   ├── patientRoutes.js     # Patient-specific endpoints
│   ├── medicineRoutes.js    # Medicine and pharmacy
│   └── testRoutes.js        # Medical testing
├── server.js                # Main application entry point
├── storage.js               # Data storage utilities
├── dataStore.js             # Data management
├── migrate-passwords.js     # Database migration utility
└── package.json             # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Healthware/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the backend directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/healthware
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
```bash
npm start
```

The server will start on `http://localhost:5001`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "userType": "patient|doctor",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male|female|other",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "userType": "patient|doctor",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/me
Authorization: Bearer <jwt-token>
```

### Appointment Endpoints

#### Get All Doctors
```http
GET /api/doctors
```

#### Get Doctor Availability
```http
GET /api/doctors/:doctorId/availability/:date
```

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "doctorId": "doctor-id",
  "date": "2024-12-15",
  "time": "10:00 AM",
  "notes": "Regular checkup"
}
```

#### Get User Appointments
```http
GET /api/appointments
Authorization: Bearer <jwt-token>
```

#### Cancel Appointment
```http
DELETE /api/appointments/:appointmentId
Authorization: Bearer <jwt-token>
```

### Health Check
```http
GET /api/health
```

## 🔒 Security Features

- **Password Security**: Passwords are hashed using bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Route Protection**: Middleware-based route protection for sensitive endpoints
- **Data Validation**: Input validation and sanitization
- **CORS Configuration**: Cross-origin resource sharing properly configured

## 💾 Database Schema

### User Model
```javascript
{
  userType: 'patient' | 'doctor',
  firstName: String,
  lastName: String,
  gender: 'male' | 'female' | 'other',
  email: String (unique),
  password: String (hashed),
  specialty: String (for doctors),
  createdAt: Date
}
```

### Appointment Model
```javascript
{
  patientId: ObjectId,
  patientName: String,
  doctorId: ObjectId,
  doctorName: String,
  date: String,
  time: String,
  notes: String,
  status: 'scheduled' | 'completed' | 'cancelled',
  createdAt: Date
}
```

## 🧪 Development Features

### Data Seeding
The application automatically seeds initial doctor data when starting:
- Sample doctors with different specialties
- Default working hours and availability
- Test data for development

### Database Migrations
- Password migration utility for existing users
- Schema update scripts
- Data transformation tools

## 🌟 Advanced Features

### Smart Scheduling
- Prevents double-booking of time slots
- Filters out past time slots for same-day appointments
- Supports extended working hours (8 AM - 7:30 PM)
- Configurable appointment duration

### Role-Based Dashboards
- Separate endpoints for patient and doctor data
- Customized data views based on user type
- Secure data isolation between user roles

### Medical Records Integration
- Comprehensive patient medical history
- Doctor specialization tracking
- Prescription and test result storage
- Medicine catalog management

## 🔧 Configuration

### Environment Variables
```env
PORT=5001                    # Server port
MONGODB_URI=                 # MongoDB connection string
JWT_SECRET=                  # JWT signing secret
NODE_ENV=development         # Environment mode
```

### Database Configuration
The application uses Mongoose for MongoDB integration with:
- Connection pooling
- Automatic reconnection
- Schema validation
- Middleware hooks

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB Atlas or production database
4. Set up proper logging and monitoring
5. Configure reverse proxy (nginx)
6. Enable SSL/TLS

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the health check endpoint
- Ensure MongoDB connection is active
- Verify environment variables are set correctly

---

**Built with ❤️ for better healthcare management**
