import { stateGraph } from './stateGraph';
import { stateDataCache } from './stateDataLoader';

/**
 * State Comparison Tree using DFS
 * Time Complexity:
 * - buildComparisonTree: O(V + E) DFS traversal + O(n) data loading per state
 * - compareStates: O(n) where n = data size per state
 * Space Complexity: O(V * d) where V = vertices, d = tree depth
 */
export class StateComparisonTree {
  /**
   * Build comparison tree using DFS from a root state
   * @param {string} rootState - Root state code
   * @param {number} maxDepth - Maximum tree depth
   * @returns {Promise<Object>} - Comparison tree
   */
  async buildComparisonTree(rootState, maxDepth = 2) {
    console.log(`🌳 Building comparison tree from ${stateGraph.getStateName(rootState)} (depth: ${maxDepth})`);

    const rootData = await stateDataCache.loadState(rootState);

    const tree = {
      state: rootState,
      stateName: stateGraph.getStateName(rootState),
      data: rootData,
      metrics: this.calculateMetrics(rootData),
      children: [],
      depth: 0
    };

    await this.dfsHelper(tree, new Set([rootState]), 0, maxDepth, rootData);

    console.log(`✓ Tree built with ${this.countNodes(tree)} nodes`);
    return tree;
  }

  /**
   * DFS helper for recursive tree building
   * @private
   */
  async dfsHelper(node, visited, currentDepth, maxDepth, parentData) {
    if (currentDepth >= maxDepth) return;

    const neighbors = stateGraph.getNeighbors(node.state);

    // DFS: Process each neighbor recursively
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);

      const neighborData = await stateDataCache.loadState(neighbor);

      const childNode = {
        state: neighbor,
        stateName: stateGraph.getStateName(neighbor),
        data: neighborData,
        metrics: this.calculateMetrics(neighborData),
        comparison: this.compareStates(parentData, neighborData),
        children: [],
        depth: currentDepth + 1
      };

      node.children.push(childNode);

      // Recursive DFS call
      await this.dfsHelper(childNode, visited, currentDepth + 1, maxDepth, neighborData);
    }
  }

  /**
   * Calculate comprehensive metrics for a state
   * @param {Array} stateData - State CSV data
   * @returns {Object}
   */
  calculateMetrics(stateData) {
    let totalPop = 0;
    let malePop = 0;
    let femalePop = 0;
    let literateCount = 0;
    let urbanPop = 0;
    let ruralPop = 0;

    stateData.forEach(row => {
      if (row[2] === 'DISTRICT') {
        const pop = parseInt(row[7]) || 0;
        const male = parseInt(row[8]) || 0;
        const female = parseInt(row[9]) || 0;
        const literate = parseInt(row[19]) || 0;

        if (row[4] === 'Total') {
          totalPop += pop;
          malePop += male;
          femalePop += female;
          literateCount += literate;
        } else if (row[4] === 'Urban') {
          urbanPop += pop;
        } else if (row[4] === 'Rural') {
          ruralPop += pop;
        }
      }
    });

    return {
      population: totalPop,
      malePop,
      femalePop,
      literateCount,
      urbanPop,
      ruralPop,
      literacyRate: totalPop > 0 ? (literateCount / totalPop) * 100 : 0,
      urbanizationRate: totalPop > 0 ? (urbanPop / totalPop) * 100 : 0,
      sexRatio: malePop > 0 ? (femalePop / malePop) * 1000 : 0,
      districtCount: this.countDistricts(stateData)
    };
  }

  /**
   * Count districts in state data
   * @private
   */
  countDistricts(stateData) {
    const districts = new Set();
    stateData.forEach(row => {
      if (row[2] === 'DISTRICT' && row[4] === 'Total') {
        districts.add(row[3]); // District name
      }
    });
    return districts.size;
  }

  /**
   * Compare two states
   * @param {Array} state1Data - First state data
   * @param {Array} state2Data - Second state data
   * @returns {Object}
   */
  compareStates(state1Data, state2Data) {
    const metrics1 = this.calculateMetrics(state1Data);
    const metrics2 = this.calculateMetrics(state2Data);

    return {
      populationDiff: metrics2.population - metrics1.population,
      populationRatio: metrics1.population > 0
        ? (metrics2.population / metrics1.population).toFixed(2)
        : 0,
      literacyDiff: (metrics2.literacyRate - metrics1.literacyRate).toFixed(2),
      urbanizationDiff: (metrics2.urbanizationRate - metrics1.urbanizationRate).toFixed(2),
      sexRatioDiff: (metrics2.sexRatio - metrics1.sexRatio).toFixed(2),
      similarity: this.calculateSimilarity(metrics1, metrics2)
    };
  }

  /**
   * Calculate similarity score between two states (0-100)
   * @private
   */
  calculateSimilarity(metrics1, metrics2) {
    // Normalize differences and calculate similarity
    const literacyDiff = Math.abs(metrics1.literacyRate - metrics2.literacyRate);
    const urbanizationDiff = Math.abs(metrics1.urbanizationRate - metrics2.urbanizationRate);
    const sexRatioDiff = Math.abs(metrics1.sexRatio - metrics2.sexRatio) / 10; // Scale down

    // Population difference (percentage)
    const popDiffPercent = metrics1.population > 0
      ? Math.abs(metrics1.population - metrics2.population) / metrics1.population * 100
      : 100;

    // Average difference (lower is more similar)
    const avgDiff = (literacyDiff + urbanizationDiff + sexRatioDiff + Math.min(popDiffPercent, 100)) / 4;

    // Convert to similarity score (100 = identical)
    return (100 - avgDiff).toFixed(2);
  }

  /**
   * Find most similar state in tree
   * @param {Object} tree - Comparison tree
   * @param {Object} targetMetrics - Target state metrics
   * @returns {Object}
   */
  findMostSimilar(tree, targetMetrics) {
    let mostSimilar = null;
    let highestSimilarity = -1;

    const traverse = (node) => {
      if (node.comparison) {
        const similarity = parseFloat(node.comparison.similarity);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilar = {
            state: node.stateName,
            similarity,
            comparison: node.comparison
          };
        }
      }

      node.children.forEach(child => traverse(child));
    };

    tree.children.forEach(child => traverse(child));

    return mostSimilar;
  }

  /**
   * Analyze tree patterns
   * @param {Object} tree - Comparison tree
   * @returns {Object}
   */
  analyzeTree(tree) {
    const nodes = [];
    const similarities = [];

    const traverse = (node) => {
      nodes.push({
        state: node.stateName,
        depth: node.depth,
        metrics: node.metrics
      });

      if (node.comparison) {
        similarities.push(parseFloat(node.comparison.similarity));
      }

      node.children.forEach(child => traverse(child));
    };

    traverse(tree);

    const avgSimilarity = similarities.length > 0
      ? similarities.reduce((a, b) => a + b, 0) / similarities.length
      : 0;

    return {
      totalNodes: nodes.length,
      maxDepth: Math.max(...nodes.map(n => n.depth)),
      averageSimilarity: avgSimilarity.toFixed(2),
      mostSimilar: similarities.length > 0 ? Math.max(...similarities).toFixed(2) : 0,
      leastSimilar: similarities.length > 0 ? Math.min(...similarities).toFixed(2) : 0,
      nodes
    };
  }

  /**
   * Count total nodes in tree
   * @private
   */
  countNodes(node) {
    let count = 1; // Count current node

    node.children.forEach(child => {
      count += this.countNodes(child);
    });

    return count;
  }

  /**
   * Get all leaf nodes (states with no children in tree)
   * @param {Object} tree - Comparison tree
   * @returns {Array}
   */
  getLeafNodes(tree) {
    const leaves = [];

    const traverse = (node) => {
      if (node.children.length === 0) {
        leaves.push({
          state: node.stateName,
          depth: node.depth,
          metrics: node.metrics
        });
      } else {
        node.children.forEach(child => traverse(child));
      }
    };

    traverse(tree);
    return leaves;
  }

  /**
   * Get path from root to a specific state
   * @param {Object} tree - Comparison tree
   * @param {string} targetState - Target state code
   * @returns {Array|null}
   */
  getPath(tree, targetState) {
    const path = [];

    const traverse = (node, currentPath) => {
      if (node.state === targetState) {
        return [...currentPath, node.stateName];
      }

      for (const child of node.children) {
        const result = traverse(child, [...currentPath, node.stateName]);
        if (result) return result;
      }

      return null;
    };

    return traverse(tree, []);
  }

  /**
   * Compare all nodes at a specific depth
   * @param {Object} tree - Comparison tree
   * @param {number} depth - Target depth
   * @returns {Array}
   */
  getNodesAtDepth(tree, depth) {
    const nodes = [];

    const traverse = (node) => {
      if (node.depth === depth) {
        nodes.push({
          state: node.stateName,
          metrics: node.metrics,
          comparison: node.comparison
        });
      }

      node.children.forEach(child => traverse(child));
    };

    traverse(tree);
    return nodes;
  }

  /**
   * Build multiple comparison trees for analysis
   * @param {Array<string>} rootStates - Array of root state codes
   * @param {number} maxDepth - Maximum depth
   * @returns {Promise<Array>}
   */
  async buildMultipleTrees(rootStates, maxDepth = 2) {
    console.log(`🌲 Building ${rootStates.length} comparison trees...`);

    const trees = [];

    for (const rootState of rootStates) {
      const tree = await this.buildComparisonTree(rootState, maxDepth);
      trees.push({
        rootState: stateGraph.getStateName(rootState),
        tree,
        analysis: this.analyzeTree(tree)
      });
    }

    return trees;
  }

  /**
   * Find states with highest similarity across tree
   * @param {Object} tree - Comparison tree
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array}
   */
  findHighSimilarityPairs(tree, threshold = 80) {
    const pairs = [];

    const traverse = (node, parentName) => {
      if (node.comparison && parseFloat(node.comparison.similarity) >= threshold) {
        pairs.push({
          state1: parentName,
          state2: node.stateName,
          similarity: node.comparison.similarity,
          comparison: node.comparison
        });
      }

      node.children.forEach(child => traverse(child, node.stateName));
    };

    tree.children.forEach(child => traverse(child, tree.stateName));

    return pairs.sort((a, b) => parseFloat(b.similarity) - parseFloat(a.similarity));
  }

  /**
   * Convert tree to array format (for visualization)
   * @param {Object} tree - Comparison tree
   * @returns {Array}
   */
  treeToArray(tree) {
    const array = [];

    const traverse = (node, parentId = null) => {
      const id = array.length;

      array.push({
        id,
        parentId,
        state: node.state,
        stateName: node.stateName,
        depth: node.depth,
        metrics: node.metrics,
        comparison: node.comparison,
        childCount: node.children.length
      });

      node.children.forEach(child => traverse(child, id));
    };

    traverse(tree);
    return array;
  }
}

// Export singleton instance
export const stateComparisonTree = new StateComparisonTree();
