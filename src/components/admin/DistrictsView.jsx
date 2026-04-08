import { useState, useMemo } from 'react'
import { formatNumber, calculateLiteracyRate } from '../../utils/columnMapper'
import { getStateName } from '../../utils/stateMapper'

export default function DistrictsView({ censusData }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'population', direction: 'desc' })

  const districtData = useMemo(() => {
    return censusData
      .filter(row => row.Level === 'DISTRICT')
      .map(row => ({
        stateCode: row.State,
        stateName: getStateName(row.State),
        district: row.Name,
        population: row.TOT_P || 0,
        households: row.No_HH || 0,
        literacyRate: calculateLiteracyRate(row.P_LIT, row.TOT_P),
        workerRate: calculateLiteracyRate(row.TOT_WORK_P, row.TOT_P),
        male: row.TOT_M || 0,
        female: row.TOT_F || 0,
        sexRatio: row.TOT_F && row.TOT_M ? Math.round((row.TOT_F / row.TOT_M) * 1000) : 0,
        raw: row
      }))
  }, [censusData])

  const filteredData = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    let filtered = districtData.filter(d => {
      const stateNameStr = String(d.stateName || '').toLowerCase()
      const districtStr = String(d.district || '').toLowerCase()
      return districtStr.includes(searchLower) || stateNameStr.includes(searchLower)
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'district' || sortConfig.key === 'stateName') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        } else {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [districtData, searchTerm, sortConfig])

  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = key => {
    if (sortConfig.key !== key) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="districts-view">
      <div className="districts-header-sticky">
        <div className="districts-header">
          <h2>District Census Data</h2>
          <div className="districts-controls">
            <input
              type="text"
              placeholder="Search districts or states..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="districts-search"
            />
            <div className="districts-count">
              Showing {filteredData.length} of {districtData.length} districts
            </div>
          </div>
        </div>
      </div>

      <div className="districts-table-container">
        <table className="districts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stateName')} className="sortable">
                State {getSortIcon('stateName')}
              </th>
              <th onClick={() => handleSort('district')} className="sortable">
                District {getSortIcon('district')}
              </th>
              <th onClick={() => handleSort('population')} className="sortable">
                Population {getSortIcon('population')}
              </th>
              <th onClick={() => handleSort('households')} className="sortable">
                Households {getSortIcon('households')}
              </th>
              <th onClick={() => handleSort('literacyRate')} className="sortable">
                Literacy Rate {getSortIcon('literacyRate')}
              </th>
              <th onClick={() => handleSort('workerRate')} className="sortable">
                Worker Rate {getSortIcon('workerRate')}
              </th>
              <th onClick={() => handleSort('sexRatio')} className="sortable">
                Sex Ratio {getSortIcon('sexRatio')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.stateName}</td>
                <td><strong>{row.district}</strong></td>
                <td className="number">{formatNumber(row.population)}</td>
                <td className="number">{formatNumber(row.households)}</td>
                <td className="number">{row.literacyRate}%</td>
                <td className="number">{row.workerRate}%</td>
                <td className="number">{row.sexRatio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
