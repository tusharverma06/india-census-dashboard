// DSA: BFS across region adjacency graph
import { REGION_GRAPH } from '../data/indiaRegions'

export function bfsCoverageSpread(startRegion, coverageMap) {
  const visited = new Set()
  const queue = [startRegion]
  const result = []
  visited.add(startRegion)

  while (queue.length > 0) {
    const region = queue.shift()
    result.push({
      region,
      coverage: coverageMap[region] || 0,
      depth: result.length
    })

    const neighbors = REGION_GRAPH[region] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  return result
}

export function findIsolatedLowCoverage(coverageMap) {
  const suspect = []

  Object.keys(coverageMap).forEach(region => {
    if (coverageMap[region] < 20) {
      const neighbors = REGION_GRAPH[region] || []
      const neighborAvg = neighbors.reduce((sum, n) =>
        sum + (coverageMap[n] || 0), 0) / (neighbors.length || 1)

      if (neighborAvg > 60) {
        suspect.push({
          region,
          coverage: coverageMap[region],
          neighborAvg,
          priority: neighborAvg - coverageMap[region]
        })
      }
    }
  })

  return suspect.sort((a, b) => b.priority - a.priority)
}
