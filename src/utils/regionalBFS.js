import { stateGraph } from './stateGraph';
import { stateDataCache } from './stateDataLoader';

/**
 * Regional Analyzer using BFS for geographic pattern analysis
 * Time Complexity:
 * - analyzeLiteracySpread: O(V + E) BFS + O(n) data processing per state
 * - findSimilarStates: O(V + E) BFS + O(n) metric calculation per state
 * - analyzeRegionalPattern: O(V + E) BFS
 * Space Complexity: O(V) for visited set and queue
 */
export class RegionalAnalyzer {
  /**
   * BFS to analyze literacy rates spreading from a starting state
   * @param {string} startState - Starting state code
   * @param {number} maxDepth - Maximum depth to traverse
   * @returns {Promise<Array>} - Analysis results
   */
  async analyzeLiteracySpread(startState, maxDepth = 3) {
    console.log(`📊 Analyzing literacy spread from ${stateGraph.getStateName(startState)} (depth: ${maxDepth})`);

    const visited = new Set();
    const queue = [[startState, 0, null]]; // [state, depth, parent]
    const results = [];

    while (queue.length > 0) {
      const [currentState, depth, parent] = queue.shift();

      if (visited.has(currentState) || depth > maxDepth) continue;
      visited.add(currentState);

      // Lazy load state data
      const stateData = await stateDataCache.loadState(currentState);

      // Calculate literacy rate
      const literacyStats = this.calculateStateLiteracyRate(stateData);
      const neighbors = stateGraph.getNeighbors(currentState);

      results.push({
        state: currentState,
        stateName: stateGraph.getStateName(currentState),
        depth,
        parent,
        literacyRate: literacyStats.rate,
        literatePopulation: literacyStats.literate,
        totalPopulation: literacyStats.total,
        neighbors: neighbors.map(n => stateGraph.getStateName(n)),
        neighborCount: neighbors.length
      });

      // Add neighbors to queue for next level
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, depth + 1, currentState]);
        }
      });
    }

    return {
      startState: stateGraph.getStateName(startState),
      maxDepth,
      statesAnalyzed: results.length,
      results: results.sort((a, b) => a.depth - b.depth),
      summary: this._summarizeLiteracySpread(results)
    };
  }

  /**
   * BFS to find states with similar demographics
   * @param {string} targetState - Target state code
   * @param {string} metric - Metric to compare ('literacy', 'population', 'urbanization')
   * @param {number} threshold - Similarity threshold
   * @returns {Promise<Object>} - Similar states
   */
  async findSimilarStates(targetState, metric = 'literacy', threshold = 5) {
    console.log(`🔍 Finding states similar to ${stateGraph.getStateName(targetState)} by ${metric}`);

    // Calculate target state metric
    const targetData = await stateDataCache.loadState(targetState);
    const targetValue = this.calculateMetric(targetData, metric);

    console.log(`Target ${metric}: ${targetValue.toFixed(2)}`);

    const similar = [];
    const visited = new Set([targetState]);
    const queue = [[targetState, 0]];

    while (queue.length > 0) {
      const [currentState, distance] = queue.shift();
      const neighbors = stateGraph.getNeighbors(currentState);

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);

        const neighborData = await stateDataCache.loadState(neighbor);
        const neighborValue = this.calculateMetric(neighborData, metric);
        const difference = Math.abs(targetValue - neighborValue);

        if (difference <= threshold) {
          similar.push({
            state: neighbor,
            stateName: stateGraph.getStateName(neighbor),
            distance: distance + 1,
            value: neighborValue,
            difference,
            percentDiff: targetValue > 0 ? (difference / targetValue * 100).toFixed(2) : 0
          });
        }

        queue.push([neighbor, distance + 1]);
      }
    }

    return {
      targetState: stateGraph.getStateName(targetState),
      targetValue,
      metric,
      threshold,
      statesFound: similar.length,
      similar: similar.sort((a, b) => a.difference - b.difference)
    };
  }

  /**
   * Analyze regional patterns using BFS
   * @param {string} startState - Starting state
   * @param {string} metric - Metric to analyze
   * @param {number} radius - Search radius
   * @returns {Promise<Object>}
   */
  async analyzeRegionalPattern(startState, metric = 'literacy', radius = 2) {
    console.log(`🗺️  Analyzing regional ${metric} pattern from ${stateGraph.getStateName(startState)}`);

    const visited = new Set();
    const queue = [[startState, 0]];
    const stateValues = [];

    while (queue.length > 0) {
      const [currentState, distance] = queue.shift();

      if (visited.has(currentState) || distance > radius) continue;
      visited.add(currentState);

      const stateData = await stateDataCache.loadState(currentState);
      const value = this.calculateMetric(stateData, metric);

      stateValues.push({
        state: currentState,
        stateName: stateGraph.getStateName(currentState),
        distance,
        value
      });

      if (distance < radius) {
        const neighbors = stateGraph.getNeighbors(currentState);
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push([neighbor, distance + 1]);
          }
        });
      }
    }

    // Calculate regional statistics
    const values = stateValues.map(s => s.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      startState: stateGraph.getStateName(startState),
      metric,
      radius,
      statesAnalyzed: stateValues.length,
      regionalAverage: avg,
      standardDeviation: stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      states: stateValues.sort((a, b) => b.value - a.value)
    };
  }

  /**
   * Calculate state-level literacy rate
   * @param {Array} stateData - State CSV data
   * @returns {Object} - Literacy statistics
   */
  calculateStateLiteracyRate(stateData) {
    let totalLiterate = 0;
    let totalPop = 0;

    stateData.forEach(row => {
      // Filter for DISTRICT rows with Total (not Rural/Urban)
      if (row[2] === 'DISTRICT' && row[4] === 'Total') {
        const literate = parseInt(row[19]) || 0; // P_LIT column
        const population = parseInt(row[7]) || 0; // TOT_P column

        totalLiterate += literate;
        totalPop += population;
      }
    });

    return {
      literate: totalLiterate,
      total: totalPop,
      rate: totalPop > 0 ? (totalLiterate / totalPop) * 100 : 0
    };
  }

  /**
   * Calculate total population
   * @param {Array} stateData - State CSV data
   * @returns {number}
   */
  calculateTotalPopulation(stateData) {
    let totalPop = 0;

    stateData.forEach(row => {
      if (row[2] === 'DISTRICT' && row[4] === 'Total') {
        totalPop += parseInt(row[7]) || 0; // TOT_P column
      }
    });

    return totalPop;
  }

  /**
   * Calculate urbanization rate
   * @param {Array} stateData - State CSV data
   * @returns {number}
   */
  calculateUrbanizationRate(stateData) {
    let urbanPop = 0;
    let totalPop = 0;

    stateData.forEach(row => {
      if (row[2] === 'DISTRICT') {
        const population = parseInt(row[7]) || 0;

        if (row[4] === 'Urban') {
          urbanPop += population;
        }

        if (row[4] === 'Total') {
          totalPop += population;
        }
      }
    });

    return totalPop > 0 ? (urbanPop / totalPop) * 100 : 0;
  }

  /**
   * Calculate sex ratio
   * @param {Array} stateData - State CSV data
   * @returns {number}
   */
  calculateSexRatio(stateData) {
    let males = 0;
    let females = 0;

    stateData.forEach(row => {
      if (row[2] === 'DISTRICT' && row[4] === 'Total') {
        males += parseInt(row[8]) || 0; // TOT_M column
        females += parseInt(row[9]) || 0; // TOT_F column
      }
    });

    return males > 0 ? (females / males) * 1000 : 0;
  }

  /**
   * Calculate metric based on type
   * @param {Array} stateData - State CSV data
   * @param {string} metric - Metric type
   * @returns {number}
   */
  calculateMetric(stateData, metric) {
    switch (metric) {
      case 'literacy':
        return this.calculateStateLiteracyRate(stateData).rate;
      case 'population':
        return this.calculateTotalPopulation(stateData);
      case 'urbanization':
        return this.calculateUrbanizationRate(stateData);
      case 'sexRatio':
        return this.calculateSexRatio(stateData);
      default:
        return 0;
    }
  }

  /**
   * Summarize literacy spread results
   * @private
   */
  _summarizeLiteracySpread(results) {
    const rates = results.map(r => r.literacyRate);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

    return {
      averageLiteracy: avg.toFixed(2),
      highestLiteracy: {
        state: results.reduce((max, r) => r.literacyRate > max.literacyRate ? r : max).stateName,
        rate: Math.max(...rates).toFixed(2)
      },
      lowestLiteracy: {
        state: results.reduce((min, r) => r.literacyRate < min.literacyRate ? r : min).stateName,
        rate: Math.min(...rates).toFixed(2)
      },
      range: (Math.max(...rates) - Math.min(...rates)).toFixed(2)
    };
  }

  /**
   * BFS to find states within a geographic region
   * @param {string} centerState - Center state
   * @param {number} maxDistance - Maximum distance
   * @returns {Promise<Array>}
   */
  async getStatesInRegion(centerState, maxDistance = 2) {
    const visited = new Set();
    const queue = [[centerState, 0]];
    const region = [];

    while (queue.length > 0) {
      const [currentState, distance] = queue.shift();

      if (visited.has(currentState) || distance > maxDistance) continue;
      visited.add(currentState);

      region.push({
        state: currentState,
        stateName: stateGraph.getStateName(currentState),
        distance
      });

      const neighbors = stateGraph.getNeighbors(currentState);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, distance + 1]);
        }
      });
    }

    return region;
  }

  /**
   * Compare multiple states using BFS from a center point
   * @param {string} centerState - Center state for comparison
   * @param {number} radius - Radius to include
   * @returns {Promise<Object>}
   */
  async compareStatesInRadius(centerState, radius = 1) {
    const states = await this.getStatesInRegion(centerState, radius);
    const comparisons = [];

    for (const { state } of states) {
      const data = await stateDataCache.loadState(state);

      comparisons.push({
        state,
        stateName: stateGraph.getStateName(state),
        literacy: this.calculateMetric(data, 'literacy'),
        population: this.calculateMetric(data, 'population'),
        urbanization: this.calculateMetric(data, 'urbanization'),
        sexRatio: this.calculateMetric(data, 'sexRatio')
      });
    }

    return {
      centerState: stateGraph.getStateName(centerState),
      radius,
      statesCompared: comparisons.length,
      comparisons: comparisons.sort((a, b) => b.literacy - a.literacy)
    };
  }
}

// Export singleton instance
export const regionalAnalyzer = new RegionalAnalyzer();
