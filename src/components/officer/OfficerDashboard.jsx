import { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import StatCard from '../shared/StatCard'
import HouseholdForm from './HouseholdForm'
import householdsData from '../../data/households.json'

export default function OfficerDashboard({ user }) {
  const [view, setView] = useState('home')
  const [mySubmissions, setMySubmissions] = useState([])

  useEffect(() => {
    const submissions = householdsData.households.filter(h => h.submittedBy === user.id)
    setMySubmissions(submissions)
  }, [user.id])

  const getToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return mySubmissions.filter(s => s.submittedAt.startsWith(today)).length
  }

  const getThisWeek = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    return mySubmissions.filter(s => s.submittedAt >= weekAgo).length
  }

  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData)
    setView('home')
    const newSubmission = {
      id: 'HH-' + user.id + '-' + Date.now(),
      submittedBy: user.id,
      officerName: user.name,
      region: user.region,
      submittedAt: new Date().toISOString(),
      status: 'complete',
      ...formData
    }
    setMySubmissions([newSubmission, ...mySubmissions])
  }

  if (view === 'form') {
    return (
      <div className="officer-shell">
        <Navbar user={user} role="officer" />
        <HouseholdForm user={user} onSubmit={handleFormSubmit} onCancel={() => setView('home')} />
      </div>
    )
  }

  return (
    <div className="officer-shell">
      <Navbar user={user} role="officer" />
      
      <div className="officer-home">
        <div className="officer-stats-row">
          <StatCard icon="📋" value={getToday()} label="Submitted Today" delta="↑ Active" />
          <StatCard icon="📅" value={getThisWeek()} label="This Week" />
          <StatCard icon="✅" value="94%" label="Completion Rate" />
          <StatCard icon="📍" value={user.region} label="Assigned Region" />
        </div>

        <button className="cta-btn" onClick={() => setView('form')}>
          + New Household Entry
        </button>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Recent Submissions</h3>
          {mySubmissions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No submissions yet. Start by creating a new household entry.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Household ID</th>
                  <th>Address</th>
                  <th>Members</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.slice(0, 10).map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>{sub.address.houseNumber}, {sub.address.street}</td>
                    <td>{sub.members.length}</td>
                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                    <td><span className="badge badge-green">{sub.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
