import { useState } from 'react';
import { Calendar, MapPin, Clock, CreditCard, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestBookingProps {
  onNavigate: (page: string) => void;
}

export default function TestBooking({ onNavigate }: TestBookingProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to generate calendar dates
  const generateCalendarDates = () => {
    const today = new Date();
    const currentDate = new Date(currentMonth);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const dates = [];
    
    for (let i = 0; i < startDay; i++) {
      dates.push(null);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date >= today || date.toDateString() === today.toDateString()) {
        dates.push(date);
      } else {
        dates.push(null);
      }
    }
    
    return dates;
  };

  const availableTests = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      description: 'Comprehensive blood analysis including red & white blood cells',
      price: 45.00,
      fasting: false,
      duration: '10 minutes'
    },
    {
      id: '2',
      name: 'Lipid Profile',
      description: 'Cholesterol and triglyceride levels',
      price: 35.00,
      fasting: true,
      duration: '10 minutes'
    },
    {
      id: '3',
      name: 'Blood Sugar (Fasting)',
      description: 'Glucose level measurement',
      price: 25.00,
      fasting: true,
      duration: '5 minutes'
    },
    {
      id: '4',
      name: 'Thyroid Function Test',
      description: 'TSH, T3, T4 levels',
      price: 65.00,
      fasting: false,
      duration: '10 minutes'
    },
    {
      id: '5',
      name: 'Vitamin D Test',
      description: 'Vitamin D3 level assessment',
      price: 55.00,
      fasting: false,
      duration: '10 minutes'
    },
    {
      id: '6',
      name: 'HbA1c Test',
      description: '3-month average blood sugar levels',
      price: 40.00,
      fasting: false,
      duration: '10 minutes'
    }
  ];

  const labs = [
    {
      id: '1',
      name: 'CityLab Medical Center',
      address: '123 Health Street, Downtown',
      rating: 4.8,
      distance: '0.8 miles'
    },
    {
      id: '2',
      name: 'QuickTest Diagnostics',
      address: '456 Wellness Ave, Midtown',
      rating: 4.7,
      distance: '1.2 miles'
    },
    {
      id: '3',
      name: 'Premier Lab Services',
      address: '789 Care Boulevard, Uptown',
      rating: 4.9,
      distance: '2.1 miles'
    }
  ];

  const timeSlots = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  const toggleTest = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getTotalPrice = () => {
    return selectedTests.reduce((total, testId) => {
      const test = availableTests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0).toFixed(2);
  };

  const hasFastingTest = () => {
    return selectedTests.some(testId => {
      const test = availableTests.find(t => t.id === testId);
      return test?.fasting;
    });
  };

  const handleBookTests = () => {
    if (selectedTests.length === 0 || !selectedDate || !selectedTime || !selectedLab) {
      alert('Please complete all fields before booking.');
      return;
    }
    alert('Tests booked successfully! Confirmation details have been sent to your email.');
    onNavigate('patient-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Diagnostic Tests</h1>
          <p className="text-lg text-gray-600">Select tests, choose a lab, and schedule your visit</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Test Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Tests</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTests.includes(test.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleTest(test.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{test.duration}</span>
                          </span>
                          {test.fasting && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              Fasting Required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${test.price}</p>
                        {selectedTests.includes(test.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Lab</h2>
              <div className="space-y-4">
                {labs.map((lab) => (
                  <div
                    key={lab.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedLab === lab.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedLab(lab.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lab.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{lab.address}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-yellow-500">★ {lab.rating}</span>
                          <span className="text-gray-500">{lab.distance} away</span>
                        </div>
                      </div>
                      {selectedLab === lab.id && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Your Visit</h2>
              
              {/* Date Selection - Calendar */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Select Date
                </label>
                
                {/* Calendar */}
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
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Select Time
                </label>
                <div className="bg-white border rounded-xl p-4">
                  <div className="space-y-4">
                    {/* Morning Slots */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Morning</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots
                          .filter(time => time.includes('AM'))
                          .map((time) => (
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
                    
                    {/* Afternoon/Evening Slots */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Afternoon & Evening</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots
                          .filter(time => time.includes('PM'))
                          .map((time) => (
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {selectedTests.length > 0 ? (
                <div className="space-y-3 mb-4">
                  <div className="border-b pb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Tests ({selectedTests.length})</h4>
                    {selectedTests.map(testId => {
                      const test = availableTests.find(t => t.id === testId);
                      return test ? (
                        <div key={testId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{test.name}</span>
                          <span className="font-medium">${test.price}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">${getTotalPrice()}</span>
                  </div>
                  
                  {selectedLab && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Lab: {labs.find(l => l.id === selectedLab)?.name}</p>
                    </div>
                  )}
                  
                  {selectedDate && selectedTime && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{selectedDate} at {selectedTime}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tests selected</p>
              )}

              {hasFastingTest() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ Fasting Required: Please fast for 8-12 hours before your appointment
                  </p>
                </div>
              )}

              <button
                onClick={handleBookTests}
                disabled={selectedTests.length === 0 || !selectedDate || !selectedTime || !selectedLab}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Book & Pay ${getTotalPrice()}
              </button>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Notes</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Bring a valid ID to the lab</p>
                <p>• Arrive 10 minutes early</p>
                <p>• Results available within 24-48 hours</p>
                <p>• Digital reports sent to your account</p>
                <p>• Free repeat test if inconclusive</p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Need Help?</h3>
              <p className="text-sm text-green-800 mb-4">
                Questions about test preparation or have specific requirements?
              </p>
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}