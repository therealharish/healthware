// Simple file-based storage utility
const fs = require('fs');
const path = require('path');

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const TEST_BOOKINGS_FILE = path.join(DATA_DIR, 'test-bookings.json');
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, 'prescriptions.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf8');
  }
};

// Initialize all data files
initFile(USERS_FILE, []);
initFile(APPOINTMENTS_FILE, []);
initFile(TEST_BOOKINGS_FILE, []);
initFile(PRESCRIPTIONS_FILE, []);
initFile(ORDERS_FILE, []);

// Read data from file
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Write data to file
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// User operations
const getUsers = () => readData(USERS_FILE);
const saveUsers = (users) => writeData(USERS_FILE, users);
const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  return saveUsers(users);
};
const findUser = (email, userType) => {
  const users = getUsers();
  return users.find(u => u.email === email && u.userType === userType);
};
const validateUser = (email, password, userType) => {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password && u.userType === userType);
};

// Appointment operations
const getAppointments = () => readData(APPOINTMENTS_FILE);
const saveAppointments = (appointments) => writeData(APPOINTMENTS_FILE, appointments);
const addAppointment = (appointment) => {
  const appointments = getAppointments();
  appointments.push(appointment);
  return saveAppointments(appointments);
};
const getPatientAppointments = (patientEmail) => {
  const appointments = getAppointments();
  return appointments.filter(a => a.patientEmail === patientEmail);
};
const getDoctorAppointments = (doctorId) => {
  const appointments = getAppointments();
  return appointments.filter(a => a.doctorId === doctorId);
};

// Test booking operations
const getTestBookings = () => readData(TEST_BOOKINGS_FILE);
const saveTestBookings = (bookings) => writeData(TEST_BOOKINGS_FILE, bookings);
const addTestBooking = (booking) => {
  const bookings = getTestBookings();
  bookings.push(booking);
  return saveTestBookings(bookings);
};
const getPatientTestBookings = (patientEmail) => {
  const bookings = getTestBookings();
  return bookings.filter(b => b.patientEmail === patientEmail);
};

// Prescription operations
const getPrescriptions = () => readData(PRESCRIPTIONS_FILE);
const savePrescriptions = (prescriptions) => writeData(PRESCRIPTIONS_FILE, prescriptions);
const addPrescription = (prescription) => {
  const prescriptions = getPrescriptions();
  prescriptions.push(prescription);
  return savePrescriptions(prescriptions);
};
const getPatientPrescriptions = (patientEmail) => {
  const prescriptions = getPrescriptions();
  return prescriptions.filter(p => p.patientEmail === patientEmail);
};
const getDoctorPrescriptions = (doctorEmail) => {
  const prescriptions = getPrescriptions();
  return prescriptions.filter(p => p.doctorEmail === doctorEmail);
};

// Order operations
const getOrders = () => readData(ORDERS_FILE);
const saveOrders = (orders) => writeData(ORDERS_FILE, orders);
const addOrder = (order) => {
  const orders = getOrders();
  orders.push(order);
  return saveOrders(orders);
};
const getPatientOrders = (patientEmail) => {
  const orders = getOrders();
  return orders.filter(o => o.patientEmail === patientEmail);
};

module.exports = {
  // User operations
  getUsers,
  saveUsers,
  addUser,
  findUser,
  validateUser,
  
  // Appointment operations
  getAppointments,
  saveAppointments,
  addAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  
  // Test booking operations
  getTestBookings,
  saveTestBookings,
  addTestBooking,
  getPatientTestBookings,
  
  // Prescription operations
  getPrescriptions,
  savePrescriptions,
  addPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  
  // Order operations
  getOrders,
  saveOrders,
  addOrder,
  getPatientOrders,
};
