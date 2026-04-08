import { useState } from 'react'
import LoginPage from './components/auth/LoginPage'
import OfficerDashboard from './components/officer/OfficerDashboard'
import AdminDashboard from './components/admin/AdminDashboard'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (currentUser.role === 'officer') {
    return <OfficerDashboard user={currentUser} />
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} />
  }

  return null
}
