import Badge from '../shared/Badge'

export default function AnomalyPanel({ anomalies }) {
  const getBadgeColor = (type) => {
    switch(type) {
      case 'INVALID_AGE': return 'red'
      case 'DUPLICATE_ENTRY': return 'orange'
      case 'MEMBER_COUNT_MISMATCH': return 'yellow'
      case 'INCOMPLETE_FORM': return 'blue'
      case 'CONFLICTING_DATA': return 'purple'
      default: return 'blue'
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Data Quality Issues
        <Badge color="red" count={anomalies.length} />
      </h3>

      <div className="anomaly-panel">
        {anomalies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No data quality issues detected</p>
        ) : (
          anomalies.slice(0, 20).map(a => (
            <div className="anomaly-row" key={a.id}>
              <Badge color={getBadgeColor(a.type)}>{a.type}</Badge>
              <span className="anomaly-desc">{a.description}</span>
              <span className="anomaly-officer">{a.officerName}</span>
              <span className="anomaly-region">{a.region}</span>
              <button className="btn btn-sm btn-outline">Review</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
