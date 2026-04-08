// DSA: HashMap for O(1) duplicate lookup and constraint validation

export function detectAnomalies(households) {
  const anomalies = []

  // Duplicate detection using HashMap
  const aadharMap = new Map()
  const addressMap = new Map()

  households.forEach(hh => {
    const addrKey = hh.address.houseNumber + '-' + hh.address.street + '-' + hh.address.pincode
    if (addressMap.has(addrKey)) {
      anomalies.push({
        id: hh.id + '-DUP',
        type: 'DUPLICATE_ENTRY',
        householdId: hh.id,
        description: 'Possible duplicate address with ' + addressMap.get(addrKey),
        severity: 'high',
        officerName: hh.officerName,
        region: hh.region
      })
    } else {
      addressMap.set(addrKey, hh.id)
    }

    hh.members.forEach((m, i) => {
      if (m.age < 0 || m.age > 120) {
        anomalies.push({
          id: hh.id + '-AGE-' + i,
          type: 'INVALID_AGE',
          householdId: hh.id,
          description: 'Member ' + m.name + ': age ' + m.age + ' is invalid',
          severity: 'high',
          officerName: hh.officerName,
          region: hh.region
        })
      }

      if (m.relation === 'Head' && m.age < 18) {
        anomalies.push({
          id: hh.id + '-HEAD-' + i,
          type: 'CONFLICTING_DATA',
          householdId: hh.id,
          description: m.name + ' listed as Head but age is ' + m.age,
          severity: 'medium',
          officerName: hh.officerName,
          region: hh.region
        })
      }

      if (m.maritalStatus === 'Married' && m.age < 18) {
        anomalies.push({
          id: hh.id + '-MAR-' + i,
          type: 'CONFLICTING_DATA',
          householdId: hh.id,
          description: m.name + ' marked Married at age ' + m.age,
          severity: 'medium',
          officerName: hh.officerName,
          region: hh.region
        })
      }

      if (m.aadharLast4) {
        const aadharKey = m.name + '-' + m.aadharLast4
        if (aadharMap.has(aadharKey)) {
          const prevHH = aadharMap.get(aadharKey)
          if (prevHH !== hh.id) {
            anomalies.push({
              id: hh.id + '-AAD-' + i,
              type: 'DUPLICATE_ENTRY',
              householdId: hh.id,
              description: m.name + ' with Aadhar ' + m.aadharLast4 + ' appears in ' + prevHH,
              severity: 'high',
              officerName: hh.officerName,
              region: hh.region
            })
          }
        } else {
          aadharMap.set(aadharKey, hh.id)
        }
      }
    })

    if (hh.householdInfo && hh.householdInfo.totalMembers !== hh.members.length) {
      anomalies.push({
        id: hh.id + '-CNT',
        type: 'MEMBER_COUNT_MISMATCH',
        householdId: hh.id,
        description: 'Declared ' + hh.householdInfo.totalMembers + ' members, found ' + hh.members.length,
        severity: 'low',
        officerName: hh.officerName,
        region: hh.region
      })
    }
  })

  return anomalies
}

export function preValidate(formData) {
  const warnings = []

  formData.members.forEach((m, i) => {
    if (m.age < 0 || m.age > 120)
      warnings.push('Member ' + (i+1) + ': Invalid age ' + m.age)
    if (m.relation === 'Head' && m.age < 18)
      warnings.push('Member ' + (i+1) + ': Head of household under 18')
    if (m.maritalStatus === 'Married' && m.age < 16)
      warnings.push('Member ' + (i+1) + ': Married but age ' + m.age + ' seems invalid')
  })

  const declaredTotal = formData.householdInfo.totalMembers
  const actualCount = formData.members.length
  if (declaredTotal !== actualCount)
    warnings.push('Declared ' + declaredTotal + ' members but only ' + actualCount + ' entered')

  return warnings
}
