import Papa from 'papaparse'

export const parseCSV = async (filePath) => {
  try {
    const response = await fetch(filePath)
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error parsing CSV:', error)
    throw error
  }
}

export const loadCensusData = async () => {
  try {
    const [censusData, columnNames] = await Promise.all([
      parseCSV('/PCA_FULL_CSV.csv'),
      parseCSV('/pca-colnames.csv')
    ])

    return { censusData, columnNames }
  } catch (error) {
    console.error('Error loading census data:', error)
    throw error
  }
}

export const loadPCATotal = async () => {
  try {
    const response = await fetch('/pca/pca-total.csv')
    const csvText = await response.text()

    const parsed = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    })

    return parsed.data
  } catch (error) {
    console.error('Error loading PCA total data:', error)
    throw error
  }
}

/**
 * Load all state CSV files from pca/ directory (01.csv through 35.csv)
 * Combines all states into a single dataset with proper mapping
 */
export const loadAllStatesData = async () => {
  try {
    // State code to name mapping (based on census data)
    const stateMapping = {
      '01': 'JAMMU & KASHMIR',
      '02': 'HIMACHAL PRADESH',
      '03': 'PUNJAB',
      '04': 'CHANDIGARH',
      '05': 'UTTARAKHAND',
      '06': 'HARYANA',
      '07': 'NCT OF DELHI',
      '08': 'RAJASTHAN',
      '09': 'UTTAR PRADESH',
      '10': 'BIHAR',
      '11': 'SIKKIM',
      '12': 'ARUNACHAL PRADESH',
      '13': 'NAGALAND',
      '14': 'MANIPUR',
      '15': 'MIZORAM',
      '16': 'TRIPURA',
      '17': 'MEGHALAYA',
      '18': 'ASSAM',
      '19': 'WEST BENGAL',
      '20': 'JHARKHAND',
      '21': 'ODISHA',
      '22': 'CHHATTISGARH',
      '23': 'MADHYA PRADESH',
      '24': 'GUJARAT',
      '25': 'DAMAN & DIU',
      '26': 'DADRA & NAGAR HAVELI',
      '27': 'MAHARASHTRA',
      '28': 'ANDHRA PRADESH',
      '29': 'KARNATAKA',
      '30': 'GOA',
      '31': 'LAKSHADWEEP',
      '32': 'KERALA',
      '33': 'TAMIL NADU',
      '34': 'PUDUCHERRY',
      '35': 'ANDAMAN & NICOBAR ISLANDS'
    }

    // Column headers from pca/colnames.csv
    const headers = [
      'State', 'State Code', 'Level', 'Name', 'TRU', 'TRU1',
      'No_HH', 'TOT_P', 'TOT_M', 'TOT_F', 'P_06', 'M_06', 'F_06',
      'P_SC', 'M_SC', 'F_SC', 'P_ST', 'M_ST', 'F_ST',
      'P_LIT', 'M_LIT', 'F_LIT', 'P_ILL', 'M_ILL', 'F_ILL',
      'TOT_WORK_P', 'TOT_WORK_M', 'TOT_WORK_F',
      'MAINWORK_P', 'MAINWORK_M', 'MAINWORK_F',
      'MAIN_CL_P', 'MAIN_CL_M', 'MAIN_CL_F',
      'MAIN_AL_P', 'MAIN_AL_M', 'MAIN_AL_F',
      'MAIN_HH_P', 'MAIN_HH_M', 'MAIN_HH_F',
      'MAIN_OT_P', 'MAIN_OT_M', 'MAIN_OT_F',
      'MARGWORK_P', 'MARGWORK_M', 'MARGWORK_F',
      'MARG_CL_P', 'MARG_CL_M', 'MARG_CL_F',
      'MARG_AL_P', 'MARG_AL_M', 'MARG_AL_F',
      'MARG_HH_P', 'MARG_HH_M', 'MARG_HH_F',
      'MARG_OT_P', 'MARG_OT_M', 'MARG_OT_F',
      'MARGWORK_3_6_P', 'MARGWORK_3_6_M', 'MARGWORK_3_6_F',
      'MARG_CL_3_6_P', 'MARG_CL_3_6_M', 'MARG_CL_3_6_F',
      'MARG_AL_3_6_P', 'MARG_AL_3_6_M', 'MARG_AL_3_6_F',
      'MARG_HH_3_6_P', 'MARG_HH_3_6_M', 'MARG_HH_3_6_F',
      'MARG_OT_3_6_P', 'MARG_OT_3_6_M', 'MARG_OT_3_6_F',
      'MARGWORK_0_3_P', 'MARGWORK_0_3_M', 'MARGWORK_0_3_F',
      'MARG_CL_0_3_P', 'MARG_CL_0_3_M', 'MARG_CL_0_3_F',
      'MARG_AL_0_3_P', 'MARG_AL_0_3_M', 'MARG_AL_0_3_F',
      'MARG_HH_0_3_P', 'MARG_HH_0_3_M', 'MARG_HH_0_3_F',
      'MARG_OT_0_3_P', 'MARG_OT_0_3_M', 'MARG_OT_0_3_F',
      'NON_WORK_P', 'NON_WORK_M', 'NON_WORK_F'
    ]

    const allData = []

    // Load all state files (01 through 35)
    const statePromises = Object.keys(stateMapping).map(async (stateCode) => {
      try {
        const response = await fetch(`/pca/${stateCode}.csv`)
        if (!response.ok) {
          console.warn(`State file ${stateCode}.csv not found`)
          return []
        }

        const csvText = await response.text()
        const lines = csvText.trim().split('\n')

        return lines.map(line => {
          const values = line.split(',')
          const row = {}

          headers.forEach((header, index) => {
            if (index < values.length) {
              const value = values[index]
              // Convert numeric values
              if (index >= 6 && !isNaN(value) && value !== '') {
                row[header] = parseFloat(value)
              } else {
                row[header] = value
              }
            }
          })

          return row
        })
      } catch (error) {
        console.warn(`Error loading state ${stateCode}:`, error)
        return []
      }
    })

    const stateDataArrays = await Promise.all(statePromises)
    stateDataArrays.forEach(stateData => {
      allData.push(...stateData)
    })

    // Filter for Total rows only (no Rural/Urban split for cleaner data)
    const totalData = allData.filter(row => row.TRU === 'Total')

    console.log(`Loaded ${totalData.length} total census records from ${Object.keys(stateMapping).length} states`)

    return totalData
  } catch (error) {
    console.error('Error loading all states data:', error)
    throw error
  }
}

/**
 * Load state-level aggregated data for analytics
 */
export const loadStateAggregatedData = async () => {
  try {
    const allData = await loadAllStatesData()

    // Group by state and aggregate
    const stateMap = {}

    allData.forEach(row => {
      if (row.Level === 'STATE') {
        const state = row.State
        if (!stateMap[state]) {
          stateMap[state] = {
            state: state,
            stateCode: row['State Code'],
            districts: 0,
            population: 0,
            male: 0,
            female: 0,
            households: 0,
            literate: 0,
            workers: 0,
            childPopulation: 0,
            scPopulation: 0,
            stPopulation: 0
          }
        }

        stateMap[state].population += row.TOT_P || 0
        stateMap[state].male += row.TOT_M || 0
        stateMap[state].female += row.TOT_F || 0
        stateMap[state].households += row.No_HH || 0
        stateMap[state].literate += row.P_LIT || 0
        stateMap[state].workers += row.TOT_WORK_P || 0
        stateMap[state].childPopulation += row.P_06 || 0
        stateMap[state].scPopulation += row.P_SC || 0
        stateMap[state].stPopulation += row.P_ST || 0
      } else if (row.Level === 'DISTRICT') {
        const state = row.State
        if (stateMap[state]) {
          stateMap[state].districts += 1
        }
      }
    })

    return Object.values(stateMap)
  } catch (error) {
    console.error('Error loading state aggregated data:', error)
    throw error
  }
}
