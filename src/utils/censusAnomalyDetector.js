import { getStateName } from './stateMapper'

/**
 * CENSUS ANOMALY DETECTION using HASHMAP
 *
 * DSA Algorithm: HashMap (JavaScript Map)
 * Time Complexity: O(n) for single pass detection + O(n) for statistical analysis
 * Space Complexity: O(n) for storing district mappings and statistics
 *
 * Use Case: Detect data quality issues using statistical outliers and HashMap lookups
 */

export const detectCensusAnomalies = (censusData) => {
  const anomalies = []

  // Filter only DISTRICT level data for anomaly detection
  const districts = censusData.filter(row => row.Level === 'DISTRICT')

  // STEP 1: Build HASHMAP with district statistics - O(n)
  const districtStatsMap = new Map()
  const sexRatios = []
  const literacyRates = []
  const childRatios = []
  const workforceRates = []
  const scStRatios = []

  districts.forEach((row) => {
    const district = row.Name
    const stateName = getStateName(row.State)
    const key = `${row.State}-${district}`

    // Calculate key metrics
    const totalPop = parseInt(row.TOT_P) || 0
    const male = parseInt(row.TOT_M) || 0
    const female = parseInt(row.TOT_F) || 0
    const literate = parseInt(row.P_LIT) || 0
    const child = parseInt(row.P_06) || 0
    const workers = parseInt(row.TOT_WORK_P) || 0
    const sc = parseInt(row.P_SC) || 0
    const st = parseInt(row.P_ST) || 0

    const stats = {
      district,
      state: stateName,
      totalPop,
      sexRatio: male > 0 ? (female / male) * 1000 : 0,
      literacyRate: totalPop > 0 ? (literate / totalPop) * 100 : 0,
      childRatio: totalPop > 0 ? (child / totalPop) * 100 : 0,
      workforceRate: totalPop > 0 ? (workers / totalPop) * 100 : 0,
      scStRatio: totalPop > 0 ? ((sc + st) / totalPop) * 100 : 0
    }

    districtStatsMap.set(key, stats)

    // Collect values for statistical analysis
    if (totalPop > 1000) { // Only include districts with significant population
      sexRatios.push(stats.sexRatio)
      literacyRates.push(stats.literacyRate)
      childRatios.push(stats.childRatio)
      workforceRates.push(stats.workforceRate)
      scStRatios.push(stats.scStRatio)
    }
  })

  // STEP 2: Calculate statistical thresholds - O(n log n)
  const calcStats = (arr) => {
    if (arr.length === 0) return { mean: 0, std: 0, min: 0, max: 0 }
    const sorted = [...arr].sort((a, b) => a - b)
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length
    const std = Math.sqrt(variance)
    return {
      mean,
      std,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)]
    }
  }

  const sexRatioStats = calcStats(sexRatios)
  const literacyStats = calcStats(literacyRates)
  const childStats = calcStats(childRatios)
  const workforceStats = calcStats(workforceRates)
  const scStStats = calcStats(scStRatios)

  // STEP 3: DETECT ANOMALIES using HashMap - O(n)
  let anomalyId = 0

  districtStatsMap.forEach((stats, key) => {
    if (stats.totalPop < 1000) return // Skip small population districts

    // ANOMALY 1: EXTREME GENDER IMBALANCE (Sex Ratio Outliers)
    // Using 2 standard deviations from mean
    const sexRatioLower = sexRatioStats.mean - (2 * sexRatioStats.std)
    const sexRatioUpper = sexRatioStats.mean + (2 * sexRatioStats.std)

    if (stats.sexRatio < sexRatioLower || stats.sexRatio > sexRatioUpper) {
      const severity = stats.sexRatio < 850 || stats.sexRatio > 1100 ? 'high' : 'medium'
      anomalies.push({
        id: `sex-ratio-${anomalyId++}`,
        type: 'extreme_gender_imbalance',
        severity,
        district: stats.district,
        state: stats.state,
        message: `Unusual sex ratio: ${stats.sexRatio.toFixed(0)} females per 1000 males (National avg: ${sexRatioStats.mean.toFixed(0)})`,
        field: 'TOT_M, TOT_F',
        value: stats.sexRatio.toFixed(0),
        expected: sexRatioStats.mean.toFixed(0)
      })
    }

    // ANOMALY 2: LITERACY RATE OUTLIERS
    // Using IQR method for outliers
    const literacyIQR = literacyStats.q3 - literacyStats.q1
    const literacyLower = literacyStats.q1 - (1.5 * literacyIQR)
    const literacyUpper = literacyStats.q3 + (1.5 * literacyIQR)

    if (stats.literacyRate < literacyLower || stats.literacyRate > literacyUpper) {
      const severity = stats.literacyRate < 30 ? 'high' : stats.literacyRate < 50 ? 'medium' : 'low'
      anomalies.push({
        id: `literacy-${anomalyId++}`,
        type: 'literacy_rate_outlier',
        severity,
        district: stats.district,
        state: stats.state,
        message: `${stats.literacyRate < literacyStats.mean ? 'Very low' : 'Unusually high'} literacy rate: ${stats.literacyRate.toFixed(1)}% (National avg: ${literacyStats.mean.toFixed(1)}%)`,
        field: 'P_LIT, TOT_P',
        value: stats.literacyRate.toFixed(1),
        expected: literacyStats.mean.toFixed(1)
      })
    }

    // ANOMALY 3: CHILD POPULATION ANOMALIES
    // Detect unusual child population ratios
    if (stats.childRatio < 5 || stats.childRatio > 25) {
      const severity = stats.childRatio < 3 || stats.childRatio > 30 ? 'high' : 'medium'
      anomalies.push({
        id: `child-ratio-${anomalyId++}`,
        type: 'unusual_child_population',
        severity,
        district: stats.district,
        state: stats.state,
        message: `${stats.childRatio < childStats.mean ? 'Very low' : 'Unusually high'} child population: ${stats.childRatio.toFixed(1)}% (0-6 years) (National avg: ${childStats.mean.toFixed(1)}%)`,
        field: 'P_06, TOT_P',
        value: stats.childRatio.toFixed(1),
        expected: childStats.mean.toFixed(1)
      })
    }

    // ANOMALY 4: WORKFORCE PARTICIPATION ANOMALIES
    // Detect unusual workforce participation rates
    const workforceLower = workforceStats.mean - (2 * workforceStats.std)
    const workforceUpper = workforceStats.mean + (2 * workforceStats.std)

    if (stats.workforceRate < workforceLower || stats.workforceRate > workforceUpper) {
      const severity = stats.workforceRate < 20 || stats.workforceRate > 70 ? 'high' : 'medium'
      anomalies.push({
        id: `workforce-${anomalyId++}`,
        type: 'workforce_participation_anomaly',
        severity,
        district: stats.district,
        state: stats.state,
        message: `${stats.workforceRate < workforceStats.mean ? 'Very low' : 'Unusually high'} workforce participation: ${stats.workforceRate.toFixed(1)}% (National avg: ${workforceStats.mean.toFixed(1)}%)`,
        field: 'TOT_WORK_P, TOT_P',
        value: stats.workforceRate.toFixed(1),
        expected: workforceStats.mean.toFixed(1)
      })
    }

    // ANOMALY 5: SC/ST POPULATION CONCENTRATION
    // Detect unusual SC/ST population concentrations
    if (stats.scStRatio > 60 || (stats.scStRatio < 5 && stats.scStRatio > 0)) {
      const severity = stats.scStRatio > 80 ? 'medium' : 'low'
      anomalies.push({
        id: `scst-${anomalyId++}`,
        type: 'sc_st_concentration',
        severity,
        district: stats.district,
        state: stats.state,
        message: `${stats.scStRatio > scStStats.mean ? 'Very high' : 'Very low'} SC/ST population: ${stats.scStRatio.toFixed(1)}% (National avg: ${scStStats.mean.toFixed(1)}%)`,
        field: 'P_SC, P_ST, TOT_P',
        value: stats.scStRatio.toFixed(1),
        expected: scStStats.mean.toFixed(1)
      })
    }
  })

  console.log(`🔍 Anomaly Detection Complete:`)
  console.log(`  - Total districts analyzed: ${districtStatsMap.size}`)
  console.log(`  - Anomalies detected: ${anomalies.length}`)
  console.log(`  - HashMap operations: ${districtStatsMap.size} insertions, ${districtStatsMap.size} lookups`)
  console.log(`  - Algorithm Summary:`)
  console.log(`    1. Extreme Gender Imbalance: ${anomalies.filter(a => a.type === 'extreme_gender_imbalance').length}`)
  console.log(`    2. Literacy Rate Outliers: ${anomalies.filter(a => a.type === 'literacy_rate_outlier').length}`)
  console.log(`    3. Unusual Child Population: ${anomalies.filter(a => a.type === 'unusual_child_population').length}`)
  console.log(`    4. Workforce Participation Anomalies: ${anomalies.filter(a => a.type === 'workforce_participation_anomaly').length}`)
  console.log(`    5. SC/ST Concentration: ${anomalies.filter(a => a.type === 'sc_st_concentration').length}`)

  return anomalies
}

export const getAnomalyCounts = (anomalies) => {
  return {
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
    total: anomalies.length
  }
}
