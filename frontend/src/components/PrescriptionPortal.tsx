import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  FileText, 
  Pill, 
  Save, 
  History, 
  Calendar, 
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doctorApi } from '../utils/api';
import MedicineSelector from './MedicineSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface PrescriptionPortalProps {
  onNavigate: (page: string) => void;
  appointment: {
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
    status: string;
    appointmentType?: string;
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionHistory {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medications: Medication[];
  status: 'active' | 'completed' | 'cancelled';
}

export default function PrescriptionPortal({ onNavigate, appointment }: PrescriptionPortalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [prescriptionHistory, setPrescriptionHistory] = useState<PrescriptionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showMedicineSelector, setShowMedicineSelector] = useState(false);
  const [currentMedicationId, setCurrentMedicationId] = useState<string | null>(null);

  // Load prescription history on component mount
  useEffect(() => {
    loadPrescriptionHistory();
  }, [appointment.patientEmail]);

  const loadPrescriptionHistory = async () => {
    if (!appointment.patientEmail) return;
    
    try {
      setHistoryLoading(true);
      const history = await doctorApi.getPrescriptionsForPatient(appointment.patientEmail);
      
      // Convert legacy prescriptions to new format
      const formattedHistory: PrescriptionHistory[] = history.map((prescription: any, index: number) => ({
        id: prescription._id || `hist-${index}`,
        date: new Date(prescription.date || prescription.createdAt).toLocaleDateString(),
        doctorName: prescription.doctorEmail?.split('@')[0] || 'Unknown Doctor',
        diagnosis: prescription.diagnosis || 'No diagnosis recorded',
        medications: prescription.medications || [
          {
            id: '1',
            name: 'Legacy Prescription',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: prescription.prescription || 'No details available'
          }
        ],
        status: prescription.status || 'completed'
      }));
      
      setPrescriptionHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading prescription history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleMedicineSelect = (medicine: any) => {
    if (currentMedicationId) {
      updateMedication(currentMedicationId, 'name', medicine.name);
    }
    setCurrentMedicationId(null);
  };

  const openMedicineSelector = (medicationId: string) => {
    setCurrentMedicationId(medicationId);
    setShowMedicineSelector(true);
  };

  const hasUnsavedChanges = () => {
    return medications.length > 0 || diagnosis.trim() !== '' || generalNotes.trim() !== '';
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      onNavigate('doctor-dashboard');
    }
  };

  const confirmBack = () => {
    setShowUnsavedDialog(false);
    onNavigate('doctor-dashboard');
  };

  const savePrescription = async () => {
    if (!user?.email || !appointment.patientEmail) {
      setErrorMessage('Missing doctor or patient information');
      setShowErrorDialog(true);
      return;
    }

    if (medications.length === 0) {
      setErrorMessage('Please add at least one medication');
      setShowErrorDialog(true);
      return;
    }

    // Validate medications
    const incompleteMeds = medications.filter(med => 
      !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()
    );

    if (incompleteMeds.length > 0) {
      setErrorMessage('Please complete all medication fields');
      setShowErrorDialog(true);
      return;
    }

    try {
      setLoading(true);
      
      // Create a comprehensive prescription string for the legacy API
      const prescriptionText = `
DIAGNOSIS: ${diagnosis || 'Not specified'}

MEDICATIONS:
${medications.map((med, index) => 
  `${index + 1}. ${med.name} ${med.dosage}
   - Frequency: ${med.frequency}
   - Duration: ${med.duration}
   ${med.instructions ? `- Instructions: ${med.instructions}` : ''}`
).join('\n\n')}

ADDITIONAL NOTES:
${generalNotes || 'None'}

---
Prescribed by: Dr. ${user.firstName} ${user.lastName}
Date: ${new Date().toLocaleDateString()}
Appointment: ${appointment.date} at ${appointment.time}
      `.trim();

      // Save the structured prescription (fallback to text-based for compatibility)
      await doctorApi.addPrescription(
        user.email,
        appointment.patientEmail,
        prescriptionText
      );

      // Try to mark appointment as completed using the enhanced API
      try {
        await doctorApi.completeAppointmentWithPrescription(appointment._id);
      } catch (error) {
        console.log('Could not mark appointment as completed via API, continuing...');
      }

      // Reset form
      setMedications([]);
      setDiagnosis('');
      setGeneralNotes('');
      
      // Refresh history
      await loadPrescriptionHistory();
      
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving prescription:', error);
      setErrorMessage('Failed to save prescription. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{appointment.patientName}</h1>
                  <p className="text-gray-600">{appointment.patientEmail}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{appointment.appointmentType || 'consultation'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {appointment.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
            
            {/* Patient's Chief Complaint */}
            {appointment.symptoms && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-medium text-blue-900 mb-2">Chief Complaint / Symptoms</h3>
                <p className="text-blue-800">{appointment.symptoms}</p>
              </div>
            )}
            
            {appointment.notes && appointment.notes !== appointment.symptoms && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Pill className="w-4 h-4 inline mr-2" />
                New Prescription
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                Prescription History ({prescriptionHistory.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Write New Prescription</h2>
            
            {/* Diagnosis Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Diagnosis
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter primary diagnosis and any additional findings..."
              />
            </div>

            {/* Medications Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <Pill className="w-4 h-4 inline mr-2" />
                  Medications
                </label>
                <button
                  onClick={addMedication}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              {medications.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medications added</h3>
                  <p className="text-gray-500 mb-4">Click "Add Medication" to start prescribing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={medication.id} className="p-6 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Medication {index + 1}</h3>
                        <button
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medicine Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={medication.name}
                              onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                              className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                              placeholder="e.g., Lisinopril"
                            />
                            <button
                              type="button"
                              onClick={() => openMedicineSelector(medication.id)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Search medicines"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dosage *
                          </label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., 10mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency *
                          </label>
                          <select
                            value={medication.frequency}
                            onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select frequency</option>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="Four times daily">Four times daily</option>
                            <option value="Every other day">Every other day</option>
                            <option value="As needed">As needed</option>
                            <option value="Before meals">Before meals</option>
                            <option value="After meals">After meals</option>
                            <option value="At bedtime">At bedtime</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration *
                          </label>
                          <input
                            type="text"
                            value={medication.duration}
                            onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., 7 days, 2 weeks"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions
                        </label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          rows={2}
                          placeholder="e.g., Take with food, Avoid alcohol, Take at the same time each day"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Notes */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Additional Notes & Instructions
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Any additional instructions, follow-up recommendations, lifestyle changes, etc."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={savePrescription}
                disabled={loading || medications.length === 0}
                className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Prescription History Tab */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Prescription History</h2>
            
            {historyLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">Loading prescription history...</span>
              </div>
            ) : prescriptionHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prescription history</h3>
                <p className="text-gray-500">This patient has no previous prescriptions on record.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {prescriptionHistory.map((prescription) => (
                  <div key={prescription.id} className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prescription.date}</h3>
                        <p className="text-sm text-gray-600">Prescribed by {prescription.doctorName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prescription.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : prescription.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    
                    {prescription.diagnosis !== 'No diagnosis recorded' && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Diagnosis</h4>
                        <p className="text-blue-800">{prescription.diagnosis}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Medications</h4>
                      <div className="space-y-3">
                        {prescription.medications.map((medication) => (
                          <div key={medication.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {medication.name} {medication.dosage && `(${medication.dosage})`}
                              </h5>
                              {medication.frequency && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Frequency:</span> {medication.frequency}
                                </p>
                              )}
                              {medication.duration && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Duration:</span> {medication.duration}
                                </p>
                              )}
                              {medication.instructions && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Instructions:</span> {medication.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prescription Saved Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              The prescription has been saved and the patient will be notified. The appointment has been marked as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              onNavigate('doctor-dashboard');
            }}>
              Back to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <AlertTriangle className="w-5 h-5 text-yellow-600 inline mr-2" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the prescription. Are you sure you want to leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUnsavedDialog(false)}>
              Continue Editing
            </AlertDialogAction>
            <AlertDialogAction onClick={confirmBack} className="bg-red-600 hover:bg-red-700">
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Medicine Selector Modal */}
      {showMedicineSelector && (
        <MedicineSelector
          onSelect={handleMedicineSelect}
          onClose={() => setShowMedicineSelector(false)}
        />
      )}
    </div>
  );
}
