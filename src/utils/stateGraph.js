/**
 * State Adjacency Graph using Adjacency List representation
 * Time Complexity:
 * - getNeighbors: O(1)
 * - areAdjacent: O(k) where k = number of neighbors
 * - getStatesAtDistance: O(V + E) BFS traversal
 * Space Complexity: O(V + E) where V = vertices (states), E = edges (borders)
 */
export class StateGraph {
  constructor() {
    this.adjacencyList = new Map();
    this.stateNames = new Map();
    this.buildGraph();
  }

  /**
   * Build the state adjacency graph
   * Based on actual geographic borders between Indian states/UTs
   */
  buildGraph() {
    // Define state names for reference
    const states = {
      '01': 'Jammu & Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '25': 'Daman & Diu',
      '26': 'Dadra & Nagar Haveli',
      '27': 'Maharashtra',
      '28': 'Andhra Pradesh',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman & Nicobar Islands'
    };

    // Store state names
    Object.entries(states).forEach(([code, name]) => {
      this.stateNames.set(code, name);
    });

    // Define adjacency relationships (bidirectional borders)
    const adjacencies = {
      '01': ['02', '03', '05'], // Jammu & Kashmir
      '02': ['01', '03', '05', '06'], // Himachal Pradesh
      '03': ['01', '02', '04', '06', '08'], // Punjab
      '04': ['03', '06'], // Chandigarh
      '05': ['01', '02', '06', '09'], // Uttarakhand
      '06': ['02', '03', '04', '05', '07', '08', '09'], // Haryana
      '07': ['06', '09'], // Delhi
      '08': ['03', '06', '09', '23', '24'], // Rajasthan
      '09': ['05', '06', '07', '08', '10', '20', '22', '23'], // Uttar Pradesh
      '10': ['09', '19', '20'], // Bihar
      '11': ['19'], // Sikkim
      '12': ['18'], // Arunachal Pradesh
      '13': ['14', '18'], // Nagaland
      '14': ['13', '15', '18'], // Manipur
      '15': ['14', '16', '18'], // Mizoram
      '16': ['15', '18', '19'], // Tripura
      '17': ['18', '19'], // Meghalaya
      '18': ['12', '13', '14', '15', '16', '17', '19'], // Assam
      '19': ['10', '11', '16', '17', '18', '20', '21'], // West Bengal
      '20': ['09', '10', '19', '21', '22'], // Jharkhand
      '21': ['19', '20', '22', '28'], // Odisha
      '22': ['09', '20', '21', '23', '27', '28'], // Chhattisgarh
      '23': ['08', '09', '22', '24', '27'], // Madhya Pradesh
      '24': ['08', '23', '25', '26', '27'], // Gujarat
      '25': ['24'], // Daman & Diu
      '26': ['24', '27'], // Dadra & Nagar Haveli
      '27': ['22', '23', '24', '26', '28', '29', '30'], // Maharashtra
      '28': ['21', '22', '27', '29', '33'], // Andhra Pradesh
      '29': ['27', '28', '30', '32', '33'], // Karnataka
      '30': ['27', '29'], // Goa
      '31': [], // Lakshadweep (island - no land borders)
      '32': ['29', '33'], // Kerala
      '33': ['28', '29', '32', '34'], // Tamil Nadu
      '34': ['33'], // Puducherry
      '35': [] // Andaman & Nicobar Islands (islands - no land borders)
    };

    // Build adjacency list (bidirectional)
    Object.entries(adjacencies).forEach(([state, neighbors]) => {
      this.adjacencyList.set(state, neighbors);
    });
  }

  /**
   * Get neighboring states (direct borders)
   * @param {string} stateCode - State code
   * @returns {Array<string>} - Array of neighbor state codes
   */
  getNeighbors(stateCode) {
    return this.adjacencyList.get(stateCode) || [];
  }

  /**
   * Get state name from code
   * @param {string} stateCode - State code
   * @returns {string} - State name
   */
  getStateName(stateCode) {
    return this.stateNames.get(stateCode) || `State ${stateCode}`;
  }

  /**
   * Check if two states share a border
   * @param {string} state1 - First state code
   * @param {string} state2 - Second state code
   * @returns {boolean}
   */
  areAdjacent(state1, state2) {
    const neighbors = this.adjacencyList.get(state1) || [];
    return neighbors.includes(state2);
  }

  /**
   * Get all states at a specific distance from a given state (BFS)
   * @param {string} stateCode - Starting state
   * @param {number} distance - Distance (number of hops)
   * @returns {Array<Object>} - States at that distance
   */
  getStatesAtDistance(stateCode, distance) {
    if (distance === 0) {
      return [{
        code: stateCode,
        name: this.getStateName(stateCode),
        distance: 0
      }];
    }

    const visited = new Set();
    const queue = [[stateCode, 0]];
    const result = [];

    while (queue.length > 0) {
      const [current, dist] = queue.shift();

      if (visited.has(current)) continue;
      visited.add(current);

      if (dist === distance) {
        result.push({
          code: current,
          name: this.getStateName(current),
          distance: dist
        });
      }

      if (dist < distance) {
        const neighbors = this.getNeighbors(current);
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push([neighbor, dist + 1]);
          }
        });
      }
    }

    return result;
  }

  /**
   * Find shortest path between two states (BFS)
   * @param {string} startState - Start state code
   * @param {string} endState - End state code
   * @returns {Object} - Path info
   */
  findShortestPath(startState, endState) {
    if (startState === endState) {
      return {
        path: [startState],
        distance: 0,
        stateNames: [this.getStateName(startState)]
      };
    }

    const visited = new Set();
    const queue = [[startState, [startState]]];

    while (queue.length > 0) {
      const [current, path] = queue.shift();

      if (current === endState) {
        return {
          path,
          distance: path.length - 1,
          stateNames: path.map(code => this.getStateName(code))
        };
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = this.getNeighbors(current);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, [...path, neighbor]]);
        }
      });
    }

    return {
      path: [],
      distance: -1,
      stateNames: [],
      message: 'No path found (possibly island states)'
    };
  }

  /**
   * Get all reachable states from a given state
   * @param {string} stateCode - Starting state
   * @returns {Array<string>} - All reachable state codes
   */
  getReachableStates(stateCode) {
    const visited = new Set();
    const queue = [stateCode];

    while (queue.length > 0) {
      const current = queue.shift();

      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = this.getNeighbors(current);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }

    visited.delete(stateCode); // Remove starting state
    return Array.from(visited);
  }

  /**
   * Get graph statistics
   * @returns {Object}
   */
  getGraphStats() {
    const totalStates = this.adjacencyList.size;
    let totalEdges = 0;
    let maxDegree = 0;
    let minDegree = Infinity;
    let maxDegreeState = '';

    this.adjacencyList.forEach((neighbors, state) => {
      const degree = neighbors.length;
      totalEdges += degree;

      if (degree > maxDegree) {
        maxDegree = degree;
        maxDegreeState = state;
      }

      if (degree < minDegree && degree > 0) {
        minDegree = degree;
      }
    });

    // Each edge counted twice (bidirectional)
    totalEdges = totalEdges / 2;

    return {
      totalStates,
      totalEdges,
      maxDegree,
      maxDegreeState: `${this.getStateName(maxDegreeState)} (${maxDegreeState})`,
      minDegree: minDegree === Infinity ? 0 : minDegree,
      avgDegree: (totalEdges * 2 / totalStates).toFixed(2),
      density: (totalEdges / (totalStates * (totalStates - 1) / 2) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Get all states and their degrees (for visualization)
   * @returns {Array<Object>}
   */
  getAllStatesWithDegrees() {
    const states = [];

    this.adjacencyList.forEach((neighbors, code) => {
      states.push({
        code,
        name: this.getStateName(code),
        degree: neighbors.length,
        neighbors: neighbors.map(n => ({
          code: n,
          name: this.getStateName(n)
        }))
      });
    });

    return states.sort((a, b) => b.degree - a.degree);
  }

  /**
   * Check if graph is connected (useful for mainland vs island detection)
   * @returns {Object}
   */
  isConnected() {
    const allStates = Array.from(this.adjacencyList.keys());

    if (allStates.length === 0) return { connected: true, components: [] };

    const components = [];
    const globalVisited = new Set();

    allStates.forEach(state => {
      if (!globalVisited.has(state)) {
        const component = new Set();
        const queue = [state];

        while (queue.length > 0) {
          const current = queue.shift();

          if (component.has(current)) continue;
          component.add(current);
          globalVisited.add(current);

          const neighbors = this.getNeighbors(current);
          neighbors.forEach(neighbor => {
            if (!component.has(neighbor)) {
              queue.push(neighbor);
            }
          });
        }

        components.push(Array.from(component));
      }
    });

    return {
      connected: components.length === 1,
      componentCount: components.length,
      components: components.map(comp => ({
        size: comp.length,
        states: comp.map(code => this.getStateName(code))
      }))
    };
  }
}

// Export singleton instance
export const stateGraph = new StateGraph();
