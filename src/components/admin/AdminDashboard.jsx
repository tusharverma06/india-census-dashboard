import { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import Sidebar from './Sidebar'
import DashboardView from './DashboardView'
import DistrictsView from './DistrictsView'
import AnomalyDetectionView from './AnomalyDetectionView'
import RevisitQueueView from './RevisitQueueView'
import AnalyticsView from './AnalyticsView'
import { loadAllStatesData } from '../../utils/csvParser'
import { detectCensusAnomalies } from '../../utils/censusAnomalyDetector'

export default function AdminDashboard({ user }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [censusData, setCensusData] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Load all state CSV files from pca/ directory
        const data = await loadAllStatesData()
        setCensusData(data)

        // Run anomaly detection on combined data
        const detected = detectCensusAnomalies(data)
        setAnomalies(detected)

        setLoading(false)
      } catch (err) {
        console.error('Error loading census data:', err)
        setError('Failed to load census data. Please refresh the page.')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const renderView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading census data...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView censusData={censusData} anomalies={anomalies} />
      case 'districts':
        return <DistrictsView censusData={censusData} />
      case 'anomalies':
        return <AnomalyDetectionView anomalies={anomalies} />
      case 'revisit-queue':
        return <RevisitQueueView censusData={censusData} />
      case 'analytics':
        return <AnalyticsView censusData={censusData} />
      default:
        return <DashboardView censusData={censusData} anomalies={anomalies} />
    }
  }

  return (
    <div className="admin-shell">
      <Navbar user={user} role="admin" />

      <div className="admin-layout">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <div className="admin-main">{renderView()}</div>
      </div>
    </div>
  )
}
