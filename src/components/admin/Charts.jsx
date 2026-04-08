import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
)

export function AgeDistributionChart({ households }) {
  const members = households.flatMap(h => h.members)
  const ageBrackets = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0
  }
  
  members.forEach(m => {
    const age = m.age
    if (age <= 10) ageBrackets['0-10']++
    else if (age <= 20) ageBrackets['11-20']++
    else if (age <= 30) ageBrackets['21-30']++
    else if (age <= 40) ageBrackets['31-40']++
    else if (age <= 50) ageBrackets['41-50']++
    else if (age <= 60) ageBrackets['51-60']++
    else ageBrackets['60+']++
  })

  const data = {
    labels: Object.keys(ageBrackets),
    datasets: [{
      label: 'Population',
      data: Object.values(ageBrackets),
      backgroundColor: 'rgba(37, 99, 235, 0.8)',
    }]
  }

  return (
    <div className="chart-container">
      <div className="chart-title">Age Distribution</div>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  )
}

export function GenderRatioChart({ households }) {
  const members = households.flatMap(h => h.members)
  const genders = { Male: 0, Female: 0, Other: 0 }
  
  members.forEach(m => {
    genders[m.gender] = (genders[m.gender] || 0) + 1
  })

  const data = {
    labels: Object.keys(genders),
    datasets: [{
      data: Object.values(genders),
      backgroundColor: ['#2563eb', '#ec4899', '#8b5cf6'],
    }]
  }

  return (
    <div className="chart-container">
      <div className="chart-title">Gender Distribution</div>
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  )
}

export function ProgressTimelineChart({ households }) {
  const sortedHH = [...households].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
  
  const dayGroups = {}
  sortedHH.forEach(h => {
    const day = new Date(h.submittedAt).toISOString().split('T')[0]
    dayGroups[day] = (dayGroups[day] || 0) + 1
  })

  const labels = Object.keys(dayGroups).slice(-7)
  const values = labels.map((_, idx) => {
    return Object.values(dayGroups).slice(0, idx + 1).reduce((a, b) => a + b, 0)
  })

  const data = {
    labels,
    datasets: [{
      label: 'Cumulative Households',
      data: values,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }

  return (
    <div className="chart-container">
      <div className="chart-title">Survey Progress Timeline</div>
      <Line data={data} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  )
}

export function IncomeDistributionChart({ households }) {
  const incomes = {}
  households.forEach(h => {
    const bracket = h.householdInfo?.monthlyIncome || 'Unknown'
    incomes[bracket] = (incomes[bracket] || 0) + 1
  })

  const data = {
    labels: Object.keys(incomes),
    datasets: [{
      label: 'Households',
      data: Object.values(incomes),
      backgroundColor: 'rgba(202, 138, 4, 0.8)',
    }]
  }

  return (
    <div className="chart-container">
      <div className="chart-title">Income Distribution</div>
      <Bar data={data} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: true }} />
    </div>
  )
}

export function AmenitiesChart({ households }) {
  const total = households.length
  const amenities = {
    Electricity: 0,
    Toilet: 0,
    LPG: 0,
    Internet: 0,
    'Clean Water': 0
  }

  households.forEach(h => {
    if (h.householdInfo?.electricity) amenities.Electricity++
    if (h.householdInfo?.toilet) amenities.Toilet++
    if (h.householdInfo?.lpgConnection) amenities.LPG++
    if (h.householdInfo?.internet) amenities.Internet++
    if (h.householdInfo?.drinkingWater === 'Tap') amenities['Clean Water']++
  })

  const percentages = Object.keys(amenities).map(k => ((amenities[k] / total) * 100).toFixed(0))

  const data = {
    labels: Object.keys(amenities),
    datasets: [{
      label: 'Coverage %',
      data: percentages,
      backgroundColor: 'rgba(8, 145, 178, 0.2)',
      borderColor: '#0891b2',
      borderWidth: 2,
    }]
  }

  return (
    <div className="chart-container">
      <div className="chart-title">Amenities Coverage</div>
      <Radar data={data} options={{ responsive: true, maintainAspectRatio: true, scales: { r: { beginAtZero: true, max: 100 } } }} />
    </div>
  )
}
