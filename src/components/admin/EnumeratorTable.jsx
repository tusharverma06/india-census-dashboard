import { USERS } from '../../data/auth'

export default function EnumeratorTable({ households }) {
  const officers = USERS.filter(u => u.role === 'officer')
  
  const getOfficerStats = (officerId) => {
    const submissions = households.filter(h => h.submittedBy === officerId)
    const anomalyCount = submissions.reduce((sum, h) => sum + (h.anomalyFlags?.length || 0), 0)
    const avgScore = submissions.length > 0 
      ? (submissions.reduce((sum, h) => sum + (h.completionScore || 0), 0) / submissions.length).toFixed(0)
      : 0
    
    const lastSubmission = submissions.length > 0
      ? new Date(submissions[0].submittedAt)
      : null
    
    const hoursAgo = lastSubmission 
      ? Math.floor((Date.now() - lastSubmission.getTime()) / (1000 * 60 * 60))
      : 999
    
    const status = hoursAgo < 4 ? 'Active' : (hoursAgo < 24 ? 'Idle' : 'Inactive')
    
    return {
      submitted: submissions.length,
      anomalies: anomalyCount,
      avgScore: avgScore + '%',
      lastActive: hoursAgo < 24 ? hoursAgo + 'h ago' : lastSubmission?.toLocaleDateString() || 'Never',
      status
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'green'
      case 'Idle': return 'yellow'
      case 'Inactive': return 'red'
      default: return 'blue'
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px' }}>Enumerator Performance</h3>
      <table>
        <thead>
          <tr>
            <th>Officer ID</th>
            <th>Name</th>
            <th>Region</th>
            <th>Submitted</th>
            <th>Anomalies</th>
            <th>Avg Score</th>
            <th>Last Active</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {officers.map(officer => {
            const stats = getOfficerStats(officer.id)
            return (
              <tr key={officer.id}>
                <td>{officer.id}</td>
                <td>{officer.name}</td>
                <td>{officer.region}</td>
                <td>{stats.submitted}</td>
                <td>{stats.anomalies}</td>
                <td>{stats.avgScore}</td>
                <td>{stats.lastActive}</td>
                <td>
                  <span className={'badge badge-' + getStatusColor(stats.status)}>
                    {stats.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
