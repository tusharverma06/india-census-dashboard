// Hardcoded users for hackathon demo
const USERS = [
  { id: 'OFF001', name: 'Ravi Kumar',    role: 'officer', region: 'Delhi-North',   pin: '1234' },
  { id: 'OFF002', name: 'Priya Sharma',  role: 'officer', region: 'Mumbai-West',   pin: '2345' },
  { id: 'OFF003', name: 'Amit Singh',    role: 'officer', region: 'Chennai-South', pin: '3456' },
  { id: 'OFF004', name: 'Sunita Devi',   role: 'officer', region: 'Kolkata-East',  pin: '4567' },
  { id: 'ADM001', name: 'Admin',         role: 'admin',   region: null,            pin: '0000' },
]

export function login(employeeId, pin) {
  return USERS.find(u => u.id === employeeId && u.pin === pin) || null
}

export { USERS }
