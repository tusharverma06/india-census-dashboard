import ProgressBar from '../shared/ProgressBar'
import { REGION_TARGETS } from '../../data/indiaRegions'

export default function RegionBreakdown({ households }) {
  const regions = Object.keys(REGION_TARGETS)
  
  const getRegionStats = (region) => {
    const surveyed = households.filter(h => h.region === region).length
    const target = REGION_TARGETS[region] || 100
    const pct = ((surveyed / target) * 100).toFixed(1)
    
    return { surveyed, target, pct: parseFloat(pct) }
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px' }}>Region Coverage</h3>
      <div>
        {regions.map(region => {
          const stats = getRegionStats(region)
          return (
            <div className="region-row" key={region}>
              <span className="region-name">{region}</span>
              <ProgressBar value={stats.surveyed} max={stats.target} />
              <span className="region-pct">{stats.pct}%</span>
              <span className="region-count">{stats.surveyed}/{stats.target}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
