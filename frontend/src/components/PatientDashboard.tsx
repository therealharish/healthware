import { useState, useEffect } from 'react';
import { Calendar, Pill, TestTube, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentApi } from '../utils/api';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Fetching appointments for user:', user);
        const response = await appointmentApi.getAppointments();
        console.log('Received appointments:', response);
        setAppointments(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Cancel appointment function
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentApi.cancelAppointment(appointmentId);
      // Refresh appointments list
      const response = await appointmentApi.getAppointments();
      setAppointments(response);
      alert('Appointment cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  // Helper function to get display date relative to current date
  const getDisplayDate = (appointmentDate: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    try {
      const aptDate = new Date(appointmentDate);
      const todayStr = today.toDateString();
      const tomorrowStr = tomorrow.toDateString();
      const aptDateStr = aptDate.toDateString();
      
      if (aptDateStr === todayStr) {
        return 'Today';
      } else if (aptDateStr === tomorrowStr) {
        return 'Tomorrow';
      } else {
        return aptDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: aptDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      // Fallback for old string formats
      return appointmentDate;
    }
  };

  // Get today's appointment
  const todaysAppointment = appointments.find(apt => {
    const today = new Date();
    
    try {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === today.toDateString();
    } catch {
      // Handle legacy "Today" string format
      return apt.date === 'Today';
    }
  });

  // Get upcoming appointments (excluding today's and past appointments)
  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    try {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0); // Reset time to start of day
      return aptDate > today; // Only future appointments
    } catch {
      // Handle legacy string formats - these should be treated as future appointments
      // unless they're explicitly "Today" (which would be caught by todaysAppointment)
      return apt.date !== 'Today';
    }
  });

  const recentPrescriptions = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      date: 'Dec 10, 2024',
      medicines: ['Lisinopril 10mg', 'Metformin 500mg'],
      status: 'active'
    }
  ];

  const testResults = [
    {
      id: 1,
      test: 'Blood Test - Complete Profile',
      date: 'Dec 8, 2024',
      status: 'completed',
      doctor: 'Dr. Sarah Johnson'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Patient'}!
          </h1>
          <p className="text-lg text-gray-600">Here's your health overview</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Appointment - Only show if there's an appointment today */}
            {todaysAppointment && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">Today's Appointment</h2>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{todaysAppointment.doctorName}</h3>
                        <p className="text-blue-100">Doctor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{todaysAppointment.time}</p>
                      <p className="text-blue-100 text-sm">Today</p>
                    </div>
                  </div>
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-100">
                      ✓ You're all set! Just show up 5 minutes before your appointment time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Book New
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 font-medium hover:text-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No upcoming appointments scheduled.</p>
                  <button
                    onClick={() => onNavigate('book-appointment')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                          <p className="text-blue-600 text-sm">Doctor</p>
                          <p className="text-gray-500 text-sm">{appointment.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-gray-500 text-sm">
                          {getDisplayDate(appointment.date)}
                        </p>
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="text-red-600 text-xs font-medium hover:text-red-700 mt-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
                <button
                  onClick={() => onNavigate('medicines')}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Prescribed by {prescription.doctor}</span>
                      </div>
                      <span className="text-sm text-gray-500">{prescription.date}</span>
                    </div>
                    <div className="space-y-2">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{medicine}</span>
                          <button
                            onClick={() => onNavigate('medicines')}
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                          >
                            Order
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Book Appointment</span>
                </button>
                <button
                  onClick={() => onNavigate('medicines')}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-xl text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Pill className="w-5 h-5" />
                  <span className="font-medium">Order Medicines</span>
                </button>
                <button
                  onClick={() => onNavigate('tests')}
                  className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-xl text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <TestTube className="w-5 h-5" />
                  <span className="font-medium">Book Tests</span>
                </button>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Results</h3>
              <div className="space-y-3">
                {testResults.map((test) => (
                  <div key={test.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <TestTube className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900 text-sm">{test.test}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{test.date}</p>
                    <button className="text-blue-600 text-xs font-medium hover:text-blue-700 mt-1">
                      View Results
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency?</h3>
              <p className="text-red-700 text-sm mb-4">For urgent medical situations, call emergency services immediately.</p>
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                <Phone className="w-5 h-5" />
                <span>Call 911</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}