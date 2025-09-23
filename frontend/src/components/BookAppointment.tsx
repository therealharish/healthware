import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, FileText, ChevronRight } from 'lucide-react';
import { appointmentApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface BookAppointmentProps {
  onNavigate: (page: string) => void;
}

export default function BookAppointment({ onNavigate }: BookAppointmentProps) {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch doctors from API on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await appointmentApi.getDoctors();
        setDoctors(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch available time slots when doctor and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        console.log(`=== FETCHING TIME SLOTS ===`);
        console.log(`Doctor ID: ${selectedDoctor}`);
        console.log(`Selected Date: ${selectedDate}`);
        
        const response = await appointmentApi.getAvailableTimeSlots(selectedDoctor, selectedDate);
        
        console.log(`API Response:`, response);
        console.log(`Available time slots received:`, response.availableTimeSlots);
        console.log(`Number of slots:`, response.availableTimeSlots?.length || 0);
        
        setAvailableTimeSlots(response.availableTimeSlots);
        
        // Clear selected time if it's no longer available
        if (selectedTime && !response.availableTimeSlots.includes(selectedTime)) {
          setSelectedTime('');
        }
      } catch (err) {
        console.error('Error fetching available time slots:', err);
        setAvailableTimeSlots([]);
      }
    };

    fetchTimeSlots();
  }, [selectedDoctor, selectedDate, selectedTime]);

  const handleBookAppointment = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setShowValidationDialog(true);
      return;
    }

    try {
      setLoading(true);
      await appointmentApi.bookAppointment(
        selectedDoctor,
        selectedDate,
        selectedTime,
        symptoms
      );
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setErrorMessage('Failed to book appointment. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
            <p className="text-lg text-gray-600">Choose your preferred doctor and get the care you need</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">1</div>
                <span className="font-medium text-blue-600">Select Doctor</span>
              </div>
              <div className="flex items-center space-x-4 opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-white rounded-full text-sm font-medium">2</div>
                <span className="font-medium text-gray-400">Schedule & Symptoms</span>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No doctors available at the moment.</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDoctor === doctor._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedDoctor(doctor._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                          <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>Available Online</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-yellow-500 mb-1">
                          <span className="text-lg font-bold text-gray-900">{doctor.rating || '4.8'}</span>
                          <span className="text-sm text-gray-500">★</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedDoctor}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
          <p className="text-lg text-gray-600">Choose your preferred time and share your symptoms</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 opacity-50">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">✓</div>
              <span className="font-medium text-green-600">Doctor Selected</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">2</div>
              <span className="font-medium text-blue-600">Schedule & Symptoms</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Date and Time Selection - shadcn style */}
            <div className="flex gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <label htmlFor="date-picker" className="text-lg font-medium text-gray-900">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  id="date-picker"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                <label htmlFor="time-picker" className="text-lg font-medium text-gray-900">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Time
                </label>
                <select
                  id="time-picker"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || availableTimeSlots.length === 0}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {selectedDate 
                      ? availableTimeSlots.length === 0 
                        ? 'No slots available' 
                        : 'Select time'
                      : 'Select date first'
                    }
                  </option>
                  {availableTimeSlots.map((time: string) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                <FileText className="w-5 h-5 inline mr-2" />
                Describe Your Symptoms (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Please describe your symptoms, concerns, or reason for visit. This helps your doctor prepare for your consultation."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Sent Successfully!</AlertDialogTitle>
              <AlertDialogDescription>
                Your appointment request has been sent to the doctor for approval. You will be notified once the doctor approves or declines your request. You can check the status in your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setShowSuccessDialog(false);
                onNavigate('patient-dashboard');
              }}>
                View My Requests
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Booking Failed</AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Login Required Dialog */}
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Login Required</AlertDialogTitle>
              <AlertDialogDescription>
                Please log in to book an appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowLoginDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Validation Dialog */}
        <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Missing Information</AlertDialogTitle>
              <AlertDialogDescription>
                Please fill in all required fields: doctor, date, and time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowValidationDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}