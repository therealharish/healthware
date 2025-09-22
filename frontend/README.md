# Healthware Frontend

A modern, responsive healthcare management web application built with React, TypeScript, and Tailwind CSS.

## 🏥 Overview

Healthware Frontend is a comprehensive digital healthcare platform that connects patients with healthcare providers through an intuitive, user-friendly interface. The application provides seamless appointment booking, prescription management, test scheduling, and personalized dashboards for both patients and doctors.

## ✨ Features

### 🎨 Modern UI/UX
- Beautiful gradient-based design with blue and green healthcare theme
- Fully responsive layout for desktop, tablet, and mobile
- Smooth animations and transitions using Lucide React icons
- Clean, accessible interface following healthcare UX best practices

### 🔐 Authentication System
- Secure JWT-based authentication
- Role-based access (Patient/Doctor)
- Protected routes and automatic redirects
- Persistent login sessions with token management
- Comprehensive form validation

### 👥 User Dashboards

#### Patient Dashboard
- **Today's Appointments**: Highlighted current day appointments with doctor details
- **Upcoming Appointments**: Comprehensive view of all scheduled visits
- **Prescription History**: Digital prescriptions with medicine ordering
- **Test Results**: Medical test history and results
- **Quick Actions**: Fast access to booking, medicines, and tests
- **Emergency Contacts**: Quick access to emergency services

#### Doctor Dashboard
- **Patient Queue**: Today's appointment list with patient details
- **Patient Information**: Detailed medical history and chief complaints
- **Digital Prescriptions**: Write and save prescriptions digitally
- **Appointment Management**: Mark appointments as completed
- **Daily Statistics**: Overview of completed and pending appointments

### 📅 Appointment Management
- **Smart Booking**: Real-time doctor availability checking
- **Calendar Interface**: Interactive date selection with month navigation
- **Time Slot Selection**: Available time slots with conflict prevention
- **Doctor Profiles**: Browse doctors by specialty with ratings
- **Appointment Details**: Add notes and specific requirements
- **Cancellation**: Easy appointment cancellation with confirmation

### 💊 Medicine & Pharmacy
- **Digital Prescriptions**: Receive prescriptions from doctors
- **Medicine Ordering**: Direct ordering from prescriptions
- **Medicine Catalog**: Browse available medications
- **Order Tracking**: Track medicine delivery status

### 🧪 Test Booking System
- **Comprehensive Test Menu**: Wide range of medical tests
- **Lab Selection**: Choose from multiple certified laboratories
- **Fasting Requirements**: Clear indication of preparation needed
- **Flexible Scheduling**: Calendar-based appointment booking
- **Price Transparency**: Upfront test pricing
- **Test Categories**: Organized by blood tests, imaging, and specialized tests

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **HTTP Client**: Custom API utilities with axios-like functionality
- **State Management**: React Context API for authentication
- **Routing**: Custom navigation system with protected routes

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Navigation header with user menu
│   │   ├── HomePage.tsx         # Landing page with features
│   │   ├── LoginPage.tsx        # Authentication forms
│   │   ├── PatientDashboard.tsx # Patient overview and management
│   │   ├── DoctorDashboard.tsx  # Doctor workflow interface
│   │   ├── BookAppointment.tsx  # Appointment booking flow
│   │   ├── MedicineStore.tsx    # Medicine browsing and ordering
│   │   └── TestBooking.tsx      # Medical test scheduling
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── utils/
│   │   ├── api.ts              # API communication utilities
│   │   └── AuthContext.tsx     # Legacy auth utilities
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles and Tailwind imports
│   └── vite-env.d.ts          # TypeScript environment declarations
├── public/                     # Static assets
├── index.html                 # HTML template
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint rules
└── postcss.config.js        # PostCSS configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on localhost:5001

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Healthware/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_APP_NAME=CareConnect
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 Core Components

### Authentication Flow
```tsx
// Login component with role selection
<LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />

// Protected route wrapper
const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.userType === userType ? children : <Navigate to="/login" />;
};
```

### Dashboard Components
```tsx
// Patient dashboard with health overview
<PatientDashboard onNavigate={handleNavigate} />

// Doctor dashboard with patient management
<DoctorDashboard onNavigate={handleNavigate} />
```

### Booking Systems
```tsx
// Appointment booking with doctor selection
<BookAppointment onNavigate={handleNavigate} />

// Test booking with lab selection
<TestBooking onNavigate={handleNavigate} />
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb` (Blue-600)
- **Primary Green**: `#16a34a` (Green-600)
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)
- **Neutral Gray**: `#6b7280` (Gray-500)

### Typography
- **Headings**: Inter font family with bold weights
- **Body Text**: Inter font family with regular weights
- **Responsive**: Tailwind responsive typography scale

### Layout Patterns
- **Cards**: Rounded corners with subtle shadows
- **Gradients**: Healthcare-themed blue to green gradients
- **Spacing**: Consistent 8px grid system
- **Responsive**: Mobile-first responsive design

## 🔧 Configuration

### Tailwind CSS Setup
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  }
}
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001'
    }
  }
})
```

## 🔒 Security Features

### Authentication Context
```tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
```

### Protected Routes
- Automatic redirect to login for unauthenticated users
- Role-based access control for different user types
- Token validation and refresh handling
- Secure token storage in localStorage

### Input Validation
- Client-side form validation
- Email format validation
- Password strength requirements
- Required field validation with user feedback

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - Single column layout
- **Tablet**: `640px - 1024px` - Adapted grid layouts
- **Desktop**: `> 1024px` - Full multi-column layouts

### Mobile Features
- Touch-friendly button sizes
- Optimized form layouts
- Responsive navigation menu
- Mobile-first component design

## 🎭 User Experience Features

### Loading States
- Skeleton screens for content loading
- Spinner animations for operations
- Progressive disclosure of information
- Optimistic UI updates

### Error Handling
- User-friendly error messages
- Network error recovery
- Form validation feedback
- Graceful degradation

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

## 🧪 Available Scripts

```json
{
  "scripts": {
    "dev": "vite",           // Start development server
    "build": "vite build",   // Build for production
    "lint": "eslint .",      // Run ESLint
    "preview": "vite preview" // Preview production build
  }
}
```

## 📊 Performance Features

### Vite Optimizations
- Fast HMR (Hot Module Replacement)
- Tree shaking for smaller bundles
- Code splitting for lazy loading
- Optimized asset handling

### React Optimizations
- Component lazy loading
- Memoized expensive calculations
- Efficient re-render prevention
- Optimized context usage

## 🎯 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile browsers**: iOS Safari, Chrome Mobile

## 🔄 State Management

### Context Pattern
```tsx
// Authentication state
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // ...context logic
};

// Usage in components
const { user, isAuthenticated, login, logout } = useAuth();
```

### Local State
- Component-level state with useState
- Form state management
- UI state (modals, dropdowns)
- Temporary data storage

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Static Hosting (Netlify/Vercel)
```bash
# Build command
npm run build

# Publish directory
dist
```

### Environment Variables
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=CareConnect
VITE_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new components
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Development Server Issues**
```bash
# Check if backend is running
curl http://localhost:5001/api/health

# Restart development server
npm run dev
```

**Styling Issues**
```bash
# Rebuild Tailwind CSS
npm run build:css
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check component documentation
- Review the browser console for errors
- Ensure backend API is accessible
- Verify authentication tokens are valid

---

**Built with ❤️ for seamless healthcare experiences**
