/**
 * API utility for making HTTP requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Generic fetch wrapper with error handling
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Get token for authenticated requests
  const token = getAuthToken();
  
  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If the server responded with an error message, use it
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

/**
 * Auth-related API calls
 */
export const authApi = {
  login: (userType: 'patient' | 'doctor', email: string, password: string) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ userType, email, password }),
    });
  },
  
  register: (userType: 'patient' | 'doctor', firstName: string, lastName: string, gender: string, email: string, password: string) => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ userType, firstName, lastName, gender, email, password }),
    });
  },

  getCurrentUser: () => {
    return apiRequest('/me');
  },
};

/**
 * Appointment-related API calls
 */
export const appointmentApi = {
  getDoctors: () => {
    return apiRequest('/doctors');
  },

  getAvailableTimeSlots: (doctorId: string, date: string) => {
    return apiRequest(`/doctors/${doctorId}/availability/${date}`);
  },
  
  bookAppointment: (doctorId: string, date: string, time: string, notes: string) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId, date, time, notes }),
    });
  },
  
  getAppointments: () => {
    return apiRequest('/appointments');
  },

  cancelAppointment: (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  },

  approveAppointment: (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}/approve`, {
      method: 'PUT',
    });
  },

  rejectAppointment: (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}/reject`, {
      method: 'PUT',
    });
  },
};

/**
 * Medicine-related API calls
 */
export const medicineApi = {
  getMedicines: () => {
    return apiRequest('/medicines');
  },
  
  placeOrder: (patientEmail: string, cart: Record<string, number>) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({ patientEmail, cart }),
    });
  },
  
  getOrders: (email: string) => {
    return apiRequest(`/orders?email=${email}`);
  },
};

/**
 * Test-related API calls
 */
export const testApi = {
  getTests: () => {
    return apiRequest('/tests');
  },
  
  getLabs: () => {
    return apiRequest('/labs');
  },
  
  bookTests: (patientEmail: string, selectedTests: string[], date: string, time: string, labId: string) => {
    return apiRequest('/test-bookings', {
      method: 'POST',
      body: JSON.stringify({ patientEmail, selectedTests, date, time, labId }),
    });
  },
  
  getTestBookings: (email: string) => {
    return apiRequest(`/test-bookings?email=${email}`);
  },
};

/**
 * Doctor-related API calls (prescriptions)
 */
/**
 * Prescription-related API calls
 */
export const prescriptionApi = {
  // Get prescriptions for the current patient
  getMyPrescriptions: () => {
    return apiRequest('/my-prescriptions');
  },
  
  // Get prescription details by ID
  getPrescriptionById: (prescriptionId: string) => {
    return apiRequest(`/prescriptions/${prescriptionId}`);
  },
};

/**
 * Doctor-related API calls (prescriptions)
 */
export const doctorApi = {
  addPrescription: (doctorEmail: string, patientEmail: string, prescription: string) => {
    return apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({ doctorEmail, patientEmail, prescription }),
    });
  },
  
  // Enhanced prescription API for structured data
  addStructuredPrescription: (prescriptionData: {
    patientEmail: string;
    doctorEmail: string;
    appointmentId?: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    notes?: string;
  }) => {
    return apiRequest('/prescriptions/structured', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  },
  
  getPrescriptionsForPatient: (patientEmail: string) => {
    return apiRequest(`/prescriptions?patientEmail=${patientEmail}`);
  },
  
  getPrescriptionsByDoctor: (doctorEmail: string) => {
    return apiRequest(`/doctor-prescriptions?doctorEmail=${doctorEmail}`);
  },
  
  // Mark appointment as completed with prescription
  completeAppointmentWithPrescription: (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}/complete`, {
      method: 'PUT',
    });
  },
};
