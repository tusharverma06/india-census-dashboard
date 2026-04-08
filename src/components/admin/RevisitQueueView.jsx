import { useMemo, useState } from 'react'
import { RevisitPriorityQueue } from '../../utils/revisitPriorityQueue'
import { detectCensusAnomalies } from '../../utils/censusAnomalyDetector'
import { getStateName } from '../../utils/stateMapper'

export default function RevisitQueueView({ censusData }) {
  const [showDsaInfo, setShowDsaInfo] = useState(true)

  const { revisitQueue, totalDistricts, avgUrgency } = useMemo(() => {
    const queue = new RevisitPriorityQueue()
    const anomaliesMap = new Map()

    // Filter only district-level data for priority queue
    const districtData = censusData.filter(row => row.Level === 'DISTRICT')

    // Count anomalies per district using HashMap (O(1) lookup)
    const anomalies = detectCensusAnomalies(censusData)
    anomalies.forEach(anomaly => {
      // Use state name for consistent key matching
      const key = `${anomaly.state}-${anomaly.district}`
      anomaliesMap.set(key, (anomaliesMap.get(key) || 0) + 1)
    })

    // Add each district with anomalies to priority queue
    districtData.forEach(district => {
      // Use state name (not code) for key matching
      const key = `${getStateName(district.State)}-${district.Name}`
      const anomalyCount = anomaliesMap.get(key) || 0

      if (anomalyCount > 0) {
        queue.push({
          ...district,
          stateName: getStateName(district.State), // Add readable state name
          anomalyCount,
          completenessPercent: calculateCompleteness(district)
        })
      }
    })

    const sortedQueue = queue.toArray().slice(0, 20) // Top 20
    const totalUrgency = sortedQueue.reduce((sum, item) => sum + item.urgencyScore, 0)

    return {
      revisitQueue: sortedQueue,
      totalDistricts: queue.size(),
      avgUrgency: sortedQueue.length > 0 ? (totalUrgency / sortedQueue.length).toFixed(2) : 0
    }
  }, [censusData])

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1>Revisit Priority Queue</h1>
          <p className="view-subtitle">
            Districts ranked by urgency using Max-Heap Priority Queue algorithm
          </p>
        </div>
        <button
          className="btn-secondary btn-sm"
          onClick={() => setShowDsaInfo(!showDsaInfo)}
        >
          {showDsaInfo ? 'Hide' : 'Show'} DSA Info
        </button>
      </div>

      {showDsaInfo && (
        <div className="dsa-info-panel">
          <div className="dsa-info-header">
            <h3>Data Structure & Algorithm Implementation</h3>
          </div>
          <div className="dsa-info-grid">
            <div className="dsa-info-card">
              <div className="dsa-info-label">Algorithm</div>
              <div className="dsa-info-value">Binary Heap (Max-Heap)</div>
              <div className="dsa-info-desc">
                Efficiently maintains highest priority district at root for O(1) access
              </div>
            </div>
            <div className="dsa-info-card">
              <div className="dsa-info-label">Time Complexity</div>
              <div className="dsa-info-value">O(log n)</div>
              <div className="dsa-info-desc">
                Insert and extract operations use bubble-up and sink-down
              </div>
            </div>
            <div className="dsa-info-card">
              <div className="dsa-info-label">Space Complexity</div>
              <div className="dsa-info-value">O(n)</div>
              <div className="dsa-info-desc">
                Stores n districts with urgency metadata
              </div>
            </div>
            <div className="dsa-info-card">
              <div className="dsa-info-label">HashMap Usage</div>
              <div className="dsa-info-value">O(1) Lookup</div>
              <div className="dsa-info-desc">
                Duplicate detection and anomaly counting with constant time
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Districts Requiring Revisit</div>
          <div className="stat-value">{totalDistricts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Urgency Score</div>
          <div className="stat-value">{avgUrgency}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Priority Count</div>
          <div className="stat-value">{revisitQueue.slice(0, 5).length}</div>
        </div>
      </div>

      <div className="card">
        <table className="data-table revisit-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>District</th>
              <th>State</th>
              <th>Urgency Score</th>
              <th>Anomalies</th>
              <th>Population</th>
              <th>Data Quality</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {revisitQueue.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No districts require revisit - all data is clean
                </td>
              </tr>
            ) : (
              revisitQueue.map((item, index) => (
                <tr key={index} className={getPriorityRowClass(index)}>
                  <td>
                    <div className={`priority-badge priority-${getPriorityLevel(index)}`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td>
                    <div className="district-name">{item.Name}</div>
                  </td>
                  <td className="text-muted">{item.stateName || getStateName(item.State)}</td>
                  <td>
                    <div className="urgency-score">
                      {item.urgencyScore.toFixed(2)}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-red">{item.anomalyCount}</span>
                  </td>
                  <td>{parseInt(item.TOT_P || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.completenessPercent}%`,
                          background: getCompletenessColor(item.completenessPercent)
                        }}
                      />
                      <span className="progress-bar-text">
                        {item.completenessPercent.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="btn-sm btn-primary">Schedule Revisit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dsa-explanation">
        <h3>How Priority Queue Works</h3>
        <div className="dsa-steps">
          <div className="dsa-step">
            <div className="dsa-step-number">1</div>
            <div className="dsa-step-content">
              <h4>Urgency Calculation</h4>
              <p>
                Score = (Anomaly Count × 10) + (Data Incompleteness × 2) + log₁₀(Population)
              </p>
            </div>
          </div>
          <div className="dsa-step">
            <div className="dsa-step-number">2</div>
            <div className="dsa-step-content">
              <h4>Heap Insertion (Bubble-Up)</h4>
              <p>
                New districts are added to the end and bubbled up until heap property is satisfied
              </p>
            </div>
          </div>
          <div className="dsa-step">
            <div className="dsa-step-number">3</div>
            <div className="dsa-step-content">
              <h4>Extraction (Sink-Down)</h4>
              <p>
                Highest priority district is removed from root, last element replaces it and sinks down
              </p>
            </div>
          </div>
          <div className="dsa-step">
            <div className="dsa-step-number">4</div>
            <div className="dsa-step-content">
              <h4>O(log n) Efficiency</h4>
              <p>
                Both operations take logarithmic time, making it highly efficient for large datasets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateCompleteness(district) {
  const fields = Object.values(district)
  const nonEmpty = fields.filter(v => v && v !== '0' && v !== '').length
  return (nonEmpty / fields.length) * 100
}

function getPriorityLevel(index) {
  if (index < 5) return 'critical'
  if (index < 10) return 'high'
  return 'medium'
}

function getPriorityRowClass(index) {
  if (index < 5) return 'priority-row-critical'
  if (index < 10) return 'priority-row-high'
  return ''
}

function getCompletenessColor(percent) {
  if (percent >= 80) return '#16a34a'
  if (percent >= 60) return '#ca8a04'
  return '#dc2626'
}
