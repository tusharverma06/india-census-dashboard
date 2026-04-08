import { useState } from 'react'
import { login } from '../../data/auth'

export default function LoginPage({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (role) => {
    const user = login(employeeId, pin)
    
    if (!user) {
      setError('Invalid credentials')
      return
    }
    
    if (user.role !== role) {
      setError(`This account is not authorized for ${role} access`)
      return
    }
    
    onLogin(user)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <h1>Census of India 2024</h1>
          <p>Real-Time Integrity Dashboard</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="OFF001 or ADM001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PIN</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          {error && (
            <div className="badge badge-red" style={{ padding: '8px 12px' }}>
              {error}
            </div>
          )}

          <div className="login-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => handleLogin('officer')}
            >
              Login as Officer
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleLogin('admin')}
            >
              Login as Admin
            </button>
          </div>

          <div className="login-hint">
            <strong>Demo Credentials:</strong><br/>
            Officer: OFF001-OFF004 (PIN: 1234-4567)<br/>
            Admin: ADM001 (PIN: 0000)
          </div>
        </div>
      </div>
    </div>
  )
}
