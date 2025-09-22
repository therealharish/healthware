import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { appointmentApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to generate calendar dates
  const generateCalendarDates = () => {
    const today = new Date();
    const currentDate = new Date(currentMonth);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDay.getDay();
    
    const dates = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      // Only include dates from today onwards
      if (date >= today || date.toDateString() === today.toDateString()) {
        dates.push(date);
      } else {
        dates.push(null); // Past dates as null
      }
    }
    
    return dates;
  };

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
      alert('Please log in to book an appointment.');
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields.');
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
      alert('Appointment booked successfully! You will receive a confirmation email shortly.');
      onNavigate('patient-dashboard');
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment. Please try again.');
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
            {/* Date Selection - Calendar */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Select Date
              </label>
              
              {/* Calendar Header */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar dates */}
                <div className="grid grid-cols-7">
                  {generateCalendarDates().map((date, index) => {
                    if (!date) {
                      return <div key={index} className="p-3 h-12"></div>;
                    }
                    
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 h-12 text-sm border-r border-b hover:bg-blue-50 transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isToday 
                            ? 'bg-blue-100 text-blue-800 font-semibold'
                            : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Select Time
              </label>
              <div className="bg-white border rounded-xl p-4">
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      {selectedDoctor && selectedDate 
                        ? 'No available time slots for this date. Please select a different date.' 
                        : 'Please select a doctor and date to see available time slots.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Morning Slots */}
                    {availableTimeSlots.filter(time => time.includes('AM')).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Morning</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {availableTimeSlots
                            .filter(time => time.includes('AM'))
                            .map((time: string) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-2 text-sm rounded-lg border-2 font-medium transition-all ${
                                  selectedTime === time
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Afternoon/Evening Slots */}
                    {availableTimeSlots.filter(time => time.includes('PM')).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Afternoon & Evening</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {availableTimeSlots
                            .filter(time => time.includes('PM'))
                            .map((time: string) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-2 text-sm rounded-lg border-2 font-medium transition-all ${
                                  selectedTime === time
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
      </div>
    </div>
  );
}