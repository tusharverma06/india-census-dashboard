import StatCard from '../shared/StatCard'

export default function StatsBar({ households }) {
  const total = households.length
  const target = 500
  const coverage = ((total / target) * 100).toFixed(1)
  
  const anomalies = households.reduce((sum, h) => sum + (h.anomalyFlags?.length || 0), 0)
  
  const uniqueOfficers = new Set(households.map(h => h.submittedBy)).size
  
  const avgScore = households.length > 0 
    ? (households.reduce((sum, h) => sum + (h.completionScore || 0), 0) / households.length).toFixed(0)
    : 0

  return (
    <div className="stats-bar">
      <StatCard
        value={total + ' / ' + target}
        label="Total Households"
        delta={'+' + (total - 320) + ' today'}
      />
      <StatCard
        value={coverage + '%'}
        label="Coverage Rate"
        delta="Target: 100%"
      />
      <StatCard
        value={12}
        label="Data Quality Issues"
      />
      <StatCard
        value={uniqueOfficers}
        label="Active Officers"
      />
      <StatCard
        value={avgScore + '%'}
        label="Average Completion"
      />
    </div>
  )
}
