// Shared data store for the application
module.exports = {
  users: [],
  doctors: [
    { id: 'doc1', name: 'Dr. Alice Smith', specialty: 'Cardiology' },
    { id: 'doc2', name: 'Dr. Bob Johnson', specialty: 'Dermatology' },
    { id: 'doc3', name: 'Dr. Carol Lee', specialty: 'Pediatrics' },
  ],
  appointments: [],
  prescriptions: [],
  labs: [
    { id: 'lab1', name: 'City Lab', address: '123 Main St' },
    { id: 'lab2', name: 'Health Diagnostics', address: '456 Oak Ave' },
  ],
  tests: [
    { id: 'test1', name: 'Blood Test', price: 500 },
    { id: 'test2', name: 'X-Ray', price: 1200 },
    { id: 'test3', name: 'MRI', price: 5000 },
  ],
  testBookings: [],
  medicines: [
    { id: 'med1', name: 'Paracetamol', price: 20, stock: 100 },
    { id: 'med2', name: 'Amoxicillin', price: 50, stock: 50 },
    { id: 'med3', name: 'Ibuprofen', price: 30, stock: 80 },
  ],
  orders: [],
};
