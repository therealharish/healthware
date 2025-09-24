import { useState, useEffect } from 'react';
import { Calendar, Pill, TestTube, User, Phone, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentApi, prescriptionApi } from '../utils/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState('');

  // Fetch user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Fetching appointments for user:', user);
        const response = await appointmentApi.getAppointments();
        console.log('Received appointments:', response);
        console.log('Number of appointments:', response.length);
        if (response.length > 0) {
          console.log('First appointment:', response[0]);
          console.log('Appointment statuses:', response.map((apt: any) => apt.status));
        }
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

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) return;
      
      try {
        setPrescriptionsLoading(true);
        console.log('Fetching prescriptions for user:', user);
        const response = await prescriptionApi.getMyPrescriptions();
        console.log('Received prescriptions:', response);
        setPrescriptions(response);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        // Don't show prescription errors as they're not critical
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  // Cancel appointment function
  const handleCancelAppointment = async (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelDialog(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      await appointmentApi.cancelAppointment(appointmentToCancel);
      
      // Remove appointment from the list
      setAppointments(prev => prev.filter(apt => apt._id !== appointmentToCancel));
      
      setDialogMessage('Your appointment has been cancelled successfully.');
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setDialogMessage('Failed to cancel appointment. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setShowCancelDialog(false);
      setAppointmentToCancel(null);
    }
  };  // Helper function to get display date relative to current date
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

  // Separate appointments by status (handle both new and legacy statuses)
  const pendingRequests = appointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'scheduled' || (!apt.status && apt._id)
  );
  const approvedAppointments = appointments.filter(apt => 
    apt.status === 'approved' || apt.status === 'completed' || apt.status === 'booked'
  );
  const rejectedRequests = appointments.filter(apt => apt.status === 'rejected');
  
  // Debug logging
  console.log('All appointments:', appointments.length);
  console.log('Pending requests:', pendingRequests.length, pendingRequests);
  console.log('Approved appointments:', approvedAppointments.length, approvedAppointments);
  console.log('Rejected requests:', rejectedRequests.length, rejectedRequests);

  // Get today's approved appointment
  const todaysAppointment = appointments.find(apt => {
    const today = new Date();
    
    // Only show approved appointments for today
    if (apt.status !== 'approved' && apt.status !== 'completed') {
      return false;
    }
    
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
    
    // Only show approved or completed appointments in the upcoming section
    if (apt.status !== 'approved' && apt.status !== 'completed') {
      return false;
    }
    
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

  // Get recent prescriptions (last 3)
  const recentPrescriptions = prescriptions.slice(0, 3).map(prescription => ({
    id: prescription._id,
    doctor: prescription.doctorEmail?.split('@')[0] || 'Unknown Doctor',
    date: new Date(prescription.date || prescription.createdAt).toLocaleDateString(),
    medicines: prescription.prescription ? [prescription.prescription.split('\n')[0]] : ['No details available'],
    status: prescription.status || 'active'
  }));

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
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'pending' 
                              ? 'bg-orange-100 text-orange-700'
                              : appointment.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : appointment.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {appointment.status === 'pending' && 'Pending Approval'}
                            {appointment.status === 'approved' && 'Confirmed'}
                            {appointment.status === 'rejected' && 'Declined'}
                            {appointment.status === 'completed' && 'Completed'}
                            {appointment.status === 'scheduled' && 'Scheduled'}
                          </span>
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

            {/* Appointment Requests Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Appointment Requests</h2>
                <div className="text-sm text-gray-600">
                  Total: {appointments.length} | 
                  Pending: {pendingRequests.length} | 
                  Confirmed: {approvedAppointments.length} | 
                  Declined: {rejectedRequests.length}
                </div>
              </div>
              
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-orange-700 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Pending Approval ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((appointment) => (
                      <div key={appointment._id} className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Dr. {appointment.doctorName}</h4>
                              <p className="text-sm text-gray-600">{getDisplayDate(appointment.date)} at {appointment.time}</p>
                              <p className="text-xs text-orange-700 font-medium">Waiting for doctor's approval</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="text-red-600 text-sm font-medium hover:text-red-700"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Appointments */}
              {approvedAppointments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-green-700 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmed Appointments ({approvedAppointments.length})
                  </h3>
                  <div className="space-y-3">
                    {approvedAppointments.map((appointment) => (
                      <div key={appointment._id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              appointment.status === 'completed' 
                                ? 'bg-blue-500' 
                                : 'bg-green-500'
                            }`}>
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Dr. {appointment.doctorName}</h4>
                              <p className="text-sm text-gray-600">{getDisplayDate(appointment.date)} at {appointment.time}</p>
                              <p className={`text-xs font-medium ${
                                appointment.status === 'completed'
                                  ? 'text-blue-700'
                                  : 'text-green-700'
                              }`}>
                                {appointment.status === 'completed' ? 'Completed' : 'Confirmed - Ready to visit'}
                              </p>
                            </div>
                          </div>
                          {appointment.status === 'approved' && (
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="text-red-600 text-sm font-medium hover:text-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Requests */}
              {rejectedRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-700 mb-4 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Declined Requests ({rejectedRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {rejectedRequests.map((appointment) => (
                      <div key={appointment._id} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Dr. {appointment.doctorName}</h4>
                            <p className="text-sm text-gray-600">{getDisplayDate(appointment.date)} at {appointment.time}</p>
                            <p className="text-xs text-red-700 font-medium">Request was declined by the doctor</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No requests at all */}
              {appointments.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointment requests yet</h3>
                  <p className="text-gray-500 mb-4">Start by booking your first appointment with a doctor.</p>
                  <button
                    onClick={() => onNavigate('book-appointment')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              )}

              {/* All requests processed but no current ones */}
              {appointments.length > 0 && pendingRequests.length === 0 && approvedAppointments.length === 0 && rejectedRequests.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active requests</h3>
                  <p className="text-gray-500 mb-4">All your appointment requests have been processed.</p>
                  <button
                    onClick={() => onNavigate('book-appointment')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book New Appointment
                  </button>
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
              
              {prescriptionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading prescriptions...</span>
                </div>
              ) : recentPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions yet</h3>
                  <p className="text-gray-500 mb-4">Your prescriptions from doctors will appear here</p>
                  <button
                    onClick={() => onNavigate('book-appointment')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
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
                            <span className="text-gray-700 truncate flex-1 mr-4">{medicine}</span>
                            <button
                              onClick={() => onNavigate('medicines')}
                              className="text-blue-600 text-sm font-medium hover:text-blue-700 whitespace-nowrap"
                            >
                              Order
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <button
                          className="text-green-700 text-sm font-medium hover:text-green-800 flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAppointment} className="bg-red-600 hover:bg-red-700">
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Try Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}