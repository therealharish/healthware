import { useState, useEffect } from 'react';
import { User, Clock, FileText, CheckCircle, Calendar, Loader, UserCheck, UserX, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentApi } from '../utils/api';
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

interface DoctorDashboardProps {
  onNavigate: (page: string, appointment?: any) => void;
}

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  notes?: string;
  symptoms?: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'booked' | 'completed' | 'cancelled' | 'no-show';
  appointmentType?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorDashboard({ onNavigate }: DoctorDashboardProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [appointmentToReject, setAppointmentToReject] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState('');

  // Collapsible state
  const [isApprovedCollapsed, setIsApprovedCollapsed] = useState(false);



  // Fetch appointments when component mounts
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching appointments for doctor:', user?.email);
        const result = await appointmentApi.getAppointments();
        console.log('All appointments received:', result.length);
        console.log('Appointments:', result);
        
        // Show all appointments (don't filter by date for pending requests)
        setAppointments(result);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Helper function to sort appointments by date and time
  const sortAppointmentsByDateTime = (appointments: Appointment[]) => {
    return appointments.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();
      return dateTimeA - dateTimeB;
    });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Filter appointments that are not cancelled or rejected
  const activeAppointments = appointments.filter(apt => !['cancelled', 'rejected'].includes(apt.status));
  
  // Separate pending requests (all dates) and approved appointments (focus on today/upcoming)
  const pendingRequests = sortAppointmentsByDateTime(activeAppointments.filter(apt => apt.status === 'pending'));
  const approvedAppointments = sortAppointmentsByDateTime(activeAppointments.filter(apt => apt.status === 'approved' || apt.status === 'completed'));

  console.log('Active appointments:', activeAppointments.length);
  console.log('Pending requests:', pendingRequests.length, pendingRequests);
  console.log('Approved appointments:', approvedAppointments.length, approvedAppointments);

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.approveAppointment(appointmentId);
      
      // Update the appointment status locally
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, status: 'approved' as const } : apt
      ));
      
      setDialogMessage('Appointment approved successfully!');
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error approving appointment:', error);
      setDialogMessage('Failed to approve appointment. Please try again.');
      setShowErrorDialog(true);
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    setAppointmentToReject(appointmentId);
    setShowRejectDialog(true);
  };

  const confirmRejectAppointment = async () => {
    if (!appointmentToReject) return;
    
    try {
      await appointmentApi.rejectAppointment(appointmentToReject);
      
      // Remove the appointment from the list or update status
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentToReject ? { ...apt, status: 'rejected' as const } : apt
      ));
      
      setDialogMessage('Appointment rejected successfully.');
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      setDialogMessage('Failed to reject appointment. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setShowRejectDialog(false);
      setAppointmentToReject(null);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, Dr. {user?.lastName || 'Doctor'}!
          </h1>
          <p className="text-lg text-gray-600">
            You have {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''} and {approvedAppointments.length} approved appointment{approvedAppointments.length !== 1 ? 's' : ''} today
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading appointments...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pending Requests */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 text-orange-500 mr-2" />
                  Pending Requests ({pendingRequests.length})
                </h2>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-500">You have no appointment requests waiting for approval.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="p-6 rounded-xl border-2 border-orange-200 bg-orange-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                              <div className="flex items-center space-x-4 text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                              Pending Approval
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                            <p className="text-gray-600">{appointment.notes || appointment.symptoms || 'No notes provided'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Appointment Type:</h4>
                            <p className="text-gray-600 capitalize">{appointment.appointmentType || 'consultation'}</p>
                          </div>
                        </div>

                        {/* Approve/Reject Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproveAppointment(appointment._id)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment._id)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved Appointments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-6"
                  onClick={() => setIsApprovedCollapsed(!isApprovedCollapsed)}
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    Approved Appointments ({approvedAppointments.length})
                  </h2>
                  {isApprovedCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                {!isApprovedCollapsed && (
                  <>
                    {approvedAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No approved appointments</h3>
                        <p className="text-gray-500">You have no approved appointments scheduled.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {approvedAppointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              appointment.status === 'completed'
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                                  <div className="flex items-center space-x-4 text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatDate(appointment.date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {appointment.status === 'completed' && (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                )}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  appointment.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {appointment.status === 'completed' ? 'Completed' : 'Approved'}
                                </span>
                                <button
                                  onClick={() => onNavigate('prescription-portal', appointment)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  {appointment.status === 'completed' ? 'View' : 'Prescribe'}
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                                <p className="text-gray-600">{appointment.notes || appointment.symptoms || 'No notes provided'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">Appointment Type:</h4>
                                <p className="text-gray-600 capitalize">{appointment.appointmentType || 'consultation'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-600">Pending Requests</span>
                  </div>
                  <span className="font-semibold text-gray-900">{pendingRequests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Approved Appointments</span>
                  </div>
                  <span className="font-semibold text-gray-900">{approvedAppointments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {approvedAppointments.filter(apt => apt.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-600">Pending Treatment</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {approvedAppointments.filter(apt => apt.status === 'approved').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this appointment request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRejectAppointment} className="bg-red-600 hover:bg-red-700">
              Reject
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
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}