import { useMemo } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AnalyticsView({ censusData }) {
  const stateData = useMemo(() => {
    return censusData.filter(row => row.Level === 'STATE')
  }, [censusData])

  const districtData = useMemo(() => {
    return censusData.filter(row => row.Level === 'DISTRICT')
  }, [censusData])

  const topStatesByPopulation = useMemo(() => {
    const sorted = [...stateData].sort((a, b) => (b.TOT_P || 0) - (a.TOT_P || 0)).slice(0, 10)

    return {
      labels: sorted.map(d => d.Name),
      datasets: [
        {
          label: 'Population',
          data: sorted.map(d => d.TOT_P),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    }
  }, [stateData])

  const literacyByState = useMemo(() => {
    const sorted = [...stateData]
      .map(state => ({
        name: state.Name,
        rate: state.TOT_P > 0 ? ((state.P_LIT / state.TOT_P) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 15)

    return {
      labels: sorted.map(s => s.name),
      datasets: [
        {
          label: 'Literacy Rate (%)',
          data: sorted.map(s => s.rate),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    }
  }, [stateData])

  const genderDistribution = useMemo(() => {
    const totals = stateData.reduce(
      (acc, row) => ({
        male: acc.male + (row.TOT_M || 0),
        female: acc.female + (row.TOT_F || 0)
      }),
      { male: 0, female: 0 }
    )

    return {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [totals.male, totals.female],
          backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1
        }
      ]
    }
  }, [stateData])

  const workerDistribution = useMemo(() => {
    const totals = stateData.reduce(
      (acc, row) => ({
        cultivator: acc.cultivator + (row.MAIN_CL_P || 0),
        agricultural: acc.agricultural + (row.MAIN_AL_P || 0),
        household: acc.household + (row.MAIN_HH_P || 0),
        other: acc.other + (row.MAIN_OT_P || 0)
      }),
      { cultivator: 0, agricultural: 0, household: 0, other: 0 }
    )

    return {
      labels: ['Cultivators', 'Agricultural Labourers', 'Household Industries', 'Other Workers'],
      datasets: [
        {
          label: 'Main Workers',
          data: [totals.cultivator, totals.agricultural, totals.household, totals.other],
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
  }, [stateData])

  const sexRatioByState = useMemo(() => {
    const sorted = [...stateData]
      .map(state => ({
        name: state.Name,
        ratio: state.TOT_M > 0 ? ((state.TOT_F / state.TOT_M) * 1000).toFixed(0) : 0
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10)

    return {
      labels: sorted.map(s => s.name),
      datasets: [
        {
          label: 'Sex Ratio (Females per 1000 Males)',
          data: sorted.map(s => s.ratio),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    }
  }, [stateData])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  }

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2>Census Data Analytics</h2>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Most Populous States</h3>
          <div className="chart-container">
            <Bar data={topStatesByPopulation} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Population by Gender</h3>
          <div className="chart-container">
            <Doughnut data={genderDistribution} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top 15 States by Literacy Rate</h3>
          <div className="chart-container">
            <Bar data={literacyByState} options={horizontalBarOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Workforce Composition</h3>
          <div className="chart-container">
            <Bar data={workerDistribution} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top 10 States by Sex Ratio</h3>
          <div className="chart-container">
            <Bar data={sexRatioByState} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
