import { useState, useMemo } from 'react'
import Badge from '../shared/Badge'

export default function AnomalyDetectionView({ anomalies }) {
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const anomalyTypes = useMemo(() => {
    const types = new Set(anomalies.map(a => a.type))
    return ['all', ...Array.from(types)]
  }, [anomalies])

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      const typeMatch = filterType === 'all' || anomaly.type === filterType
      const severityMatch = filterSeverity === 'all' || anomaly.severity === filterSeverity
      return typeMatch && severityMatch
    })
  }, [anomalies, filterType, filterSeverity])

  const anomalyCounts = useMemo(() => {
    return {
      high: anomalies.filter(a => a.severity === 'high').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      low: anomalies.filter(a => a.severity === 'low').length
    }
  }, [anomalies])

  const getSeverityBadgeType = severity => {
    switch (severity) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatTypeLabel = type => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="anomaly-detection-view">
      <div className="anomaly-header">
        <h2>Anomaly Detection</h2>
        <div className="anomaly-summary">
          <div className="anomaly-summary-item high">
            <span className="count">{anomalyCounts.high}</span>
            <span className="label">High</span>
          </div>
          <div className="anomaly-summary-item medium">
            <span className="count">{anomalyCounts.medium}</span>
            <span className="label">Medium</span>
          </div>
          <div className="anomaly-summary-item low">
            <span className="count">{anomalyCounts.low}</span>
            <span className="label">Low</span>
          </div>
        </div>
      </div>

      <div className="anomaly-filters">
        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            {anomalyTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : formatTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="anomaly-count">
          Showing {filteredAnomalies.length} of {anomalies.length} anomalies
        </div>
      </div>

      <div className="anomaly-list">
        {filteredAnomalies.length === 0 ? (
          <div className="anomaly-empty">
            <p>No anomalies found matching the selected filters.</p>
          </div>
        ) : (
          filteredAnomalies.map(anomaly => (
            <div key={anomaly.id} className="anomaly-item">
              <div className="anomaly-item-header">
                <Badge type={getSeverityBadgeType(anomaly.severity)}>
                  {anomaly.severity.toUpperCase()}
                </Badge>
                <span className="anomaly-type">{formatTypeLabel(anomaly.type)}</span>
              </div>
              <div className="anomaly-item-location">
                <strong>{anomaly.district}</strong> {anomaly.state && `• ${anomaly.state}`}
              </div>
              <div className="anomaly-item-message">{anomaly.message}</div>
              {anomaly.value && anomaly.expected && (
                <div className="anomaly-item-stats">
                  <div className="anomaly-stat">
                    <span className="stat-label">Observed:</span>
                    <span className="stat-value">{anomaly.value}</span>
                  </div>
                  <div className="anomaly-stat">
                    <span className="stat-label">Expected (Avg):</span>
                    <span className="stat-value expected">{anomaly.expected}</span>
                  </div>
                </div>
              )}
              <div className="anomaly-item-field">
                <small>Fields: {anomaly.field}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
