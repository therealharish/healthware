import { useState } from 'react';
import { User, Clock, FileText, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DoctorDashboardProps {
  onNavigate: (page: string) => void;
}

export default function DoctorDashboard({ onNavigate }: DoctorDashboardProps) {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<{[key: string]: string}>({});

  const todayAppointments = [
    {
      id: '1',
      patient: 'John Doe',
      time: '9:00 AM',
      symptoms: 'Chest pain and shortness of breath',
      medicalHistory: 'Hypertension, Diabetes Type 2',
      status: 'waiting'
    },
    {
      id: '2',
      patient: 'Sarah Williams',
      time: '9:30 AM',
      symptoms: 'Skin rash on arms',
      medicalHistory: 'Allergic to penicillin',
      status: 'completed'
    },
    {
      id: '3',
      patient: 'Michael Brown',
      time: '10:00 AM',
      symptoms: 'Regular checkup',
      medicalHistory: 'No significant history',
      status: 'waiting'
    }
  ];

  const handlePrescriptionSubmit = (patientId: string) => {
    if (prescriptions[patientId]) {
      alert('Prescription saved successfully! Patient will be notified.');
      // Update appointment status to completed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, Dr. {user?.lastName || 'Doctor'}!
          </h1>
          <p className="text-lg text-gray-600">You have 3 appointments today</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Appointments</h2>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPatient === appointment.id
                        ? 'border-blue-500 bg-blue-50'
                        : appointment.status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedPatient(appointment.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.patient}</h3>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'completed' && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status === 'completed' ? 'Completed' : 'Waiting'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Symptoms:</h4>
                        <p className="text-gray-600">{appointment.symptoms}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Medical History:</h4>
                        <p className="text-gray-600">{appointment.medicalHistory}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Details & Prescription */}
          <div className="space-y-6">
            {selectedPatient ? (
              <>
                {/* Patient Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h3>
                  {(() => {
                    const patient = todayAppointments.find(a => a.id === selectedPatient);
                    return patient ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{patient.patient}</h4>
                            <p className="text-gray-500">Age: 45, Male</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-900">Appointment Time:</span>
                            <p className="text-gray-600">{patient.time}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Chief Complaint:</span>
                            <p className="text-gray-600">{patient.symptoms}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Medical History:</span>
                            <p className="text-gray-600">{patient.medicalHistory}</p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Prescription */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Prescription</h3>
                  <div className="space-y-4">
                    <textarea
                      value={prescriptions[selectedPatient] || ''}
                      onChange={(e) => setPrescriptions({
                        ...prescriptions,
                        [selectedPatient]: e.target.value
                      })}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      rows={6}
                      placeholder="Enter prescription details...&#10;&#10;Example:&#10;1. Lisinopril 10mg - Once daily&#10;2. Metformin 500mg - Twice daily with meals&#10;3. Aspirin 81mg - Once daily"
                    />
                    <button
                      onClick={() => handlePrescriptionSubmit(selectedPatient)}
                      disabled={!prescriptions[selectedPatient]}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Save Prescription
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-500">Click on a patient appointment to view details and write prescriptions</p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Total Appointments</span>
                  </div>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-900">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}