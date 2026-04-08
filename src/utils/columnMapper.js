export class ColumnMapper {
  constructor(columnNames) {
    this.mappings = {}

    if (columnNames && Array.isArray(columnNames)) {
      columnNames.forEach(row => {
        const shortName = Object.keys(row)[0]
        const fullName = row[shortName]
        if (shortName && fullName) {
          this.mappings[shortName] = fullName
        }
      })
    }
  }

  getFullName(shortName) {
    return this.mappings[shortName] || shortName
  }

  getAllMappings() {
    return { ...this.mappings }
  }
}

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A'
  return new Intl.NumberFormat('en-IN').format(num)
}

export const formatPercentage = (value, total) => {
  if (!value || !total || total === 0) return '0.00%'
  return ((value / total) * 100).toFixed(2) + '%'
}

export const calculateLiteracyRate = (literate, total) => {
  if (!total || total === 0) return 0
  return ((literate / total) * 100).toFixed(2)
}

export const calculateGenderRatio = (male, female) => {
  if (!male || male === 0) return 0
  return ((female / male) * 1000).toFixed(0)
}
