/**
 * Trie Node for district search
 */
class TrieNode {
  constructor() {
    this.children = new Map(); // Character -> TrieNode mapping
    this.isEndOfWord = false;
    this.districtData = null; // Store district information
    this.frequency = 0; // For ranking search results
  }
}

/**
 * Trie (Prefix Tree) for fast district name autocomplete
 * Time Complexity:
 * - insert: O(m) where m = length of district name
 * - autocomplete: O(m + k) where k = number of results
 * - search: O(m)
 * Space Complexity: O(n * m) where n = number of districts, m = avg name length
 */
export class DistrictTrie {
  constructor() {
    this.root = new TrieNode();
    this.totalDistricts = 0;
    this.stats = {
      insertions: 0,
      searches: 0,
      avgSearchTime: 0
    };
  }

  /**
   * Insert district into Trie
   * @param {string} districtName - District name
   * @param {Object} districtData - District metadata
   */
  insert(districtName, districtData) {
    let node = this.root;
    const name = districtName.toLowerCase().trim();

    // Traverse/create path for each character
    for (const char of name) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    // Mark end of word and store data
    node.isEndOfWord = true;
    node.districtData = districtData;
    node.frequency++;

    this.totalDistricts++;
    this.stats.insertions++;
  }

  /**
   * Search for exact district match
   * @param {string} districtName - District name
   * @returns {Object|null} - District data or null
   */
  search(districtName) {
    const startTime = performance.now();

    let node = this.root;
    const name = districtName.toLowerCase().trim();

    for (const char of name) {
      if (!node.children.has(char)) {
        this._updateSearchStats(startTime);
        return null;
      }
      node = node.children.get(char);
    }

    this._updateSearchStats(startTime);

    return node.isEndOfWord ? node.districtData : null;
  }

  /**
   * Autocomplete with prefix search
   * @param {string} prefix - Search prefix
   * @param {number} maxResults - Maximum number of results
   * @returns {Array} - Matching districts
   */
  autocomplete(prefix, maxResults = 10) {
    const startTime = performance.now();

    if (!prefix || prefix.trim() === '') {
      return [];
    }

    let node = this.root;
    const lowerPrefix = prefix.toLowerCase().trim();

    // Navigate to prefix node
    for (const char of lowerPrefix) {
      if (!node.children.has(char)) {
        this._updateSearchStats(startTime);
        return []; // No matches
      }
      node = node.children.get(char);
    }

    // Collect all words from prefix node
    const results = [];
    this._collectWords(node, lowerPrefix, results, maxResults);

    this._updateSearchStats(startTime);
    this.stats.searches++;

    return results.sort((a, b) => b.frequency - a.frequency).slice(0, maxResults);
  }

  /**
   * Collect all words from a given node using DFS
   * @private
   */
  _collectWords(node, currentWord, results, maxResults) {
    if (results.length >= maxResults) return;

    if (node.isEndOfWord) {
      results.push({
        name: currentWord,
        data: node.districtData,
        frequency: node.frequency
      });
    }

    // DFS through children
    node.children.forEach((childNode, char) => {
      if (results.length < maxResults) {
        this._collectWords(childNode, currentWord + char, results, maxResults);
      }
    });
  }

  /**
   * Search with fuzzy matching (allows 1 character difference)
   * @param {string} searchTerm - Search term
   * @param {number} maxResults - Maximum results
   * @returns {Array}
   */
  fuzzySearch(searchTerm, maxResults = 10) {
    const exactResults = this.autocomplete(searchTerm, maxResults);

    if (exactResults.length >= maxResults) {
      return exactResults;
    }

    // Try variations (remove last char, add wildcard, etc.)
    const variations = new Set();

    // Add exact matches
    exactResults.forEach(r => variations.add(JSON.stringify(r)));

    // Try prefix without last character
    if (searchTerm.length > 2) {
      const shorterPrefix = searchTerm.slice(0, -1);
      const moreResults = this.autocomplete(shorterPrefix, maxResults * 2);

      moreResults.forEach(r => {
        if (variations.size < maxResults) {
          variations.add(JSON.stringify(r));
        }
      });
    }

    return Array.from(variations)
      .map(str => JSON.parse(str))
      .slice(0, maxResults);
  }

  /**
   * Get all districts matching a pattern
   * @param {string} pattern - Search pattern
   * @returns {Array}
   */
  searchPattern(pattern) {
    const results = [];
    const lowerPattern = pattern.toLowerCase();

    const traverse = (node, currentWord) => {
      if (node.isEndOfWord && currentWord.includes(lowerPattern)) {
        results.push({
          name: currentWord,
          data: node.districtData,
          frequency: node.frequency
        });
      }

      node.children.forEach((childNode, char) => {
        traverse(childNode, currentWord + char);
      });
    };

    traverse(this.root, '');
    return results.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get all districts (for debugging)
   * @returns {Array}
   */
  getAllDistricts() {
    const results = [];

    const traverse = (node, currentWord) => {
      if (node.isEndOfWord) {
        results.push({
          name: currentWord,
          data: node.districtData,
          frequency: node.frequency
        });
      }

      node.children.forEach((childNode, char) => {
        traverse(childNode, currentWord + char);
      });
    };

    traverse(this.root, '');
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get districts by state
   * @param {string} stateCode - State code
   * @returns {Array}
   */
  getDistrictsByState(stateCode) {
    const allDistricts = this.getAllDistricts();
    return allDistricts.filter(d => d.data.stateCode === stateCode);
  }

  /**
   * Get Trie statistics
   * @returns {Object}
   */
  getStats() {
    return {
      totalDistricts: this.totalDistricts,
      insertions: this.stats.insertions,
      searches: this.stats.searches,
      avgSearchTime: this.stats.avgSearchTime.toFixed(3) + 'ms',
      nodeCount: this._countNodes(),
      memoryEstimate: this._estimateMemory()
    };
  }

  /**
   * Count total nodes in Trie
   * @private
   */
  _countNodes() {
    let count = 0;

    const traverse = (node) => {
      count++;
      node.children.forEach(childNode => traverse(childNode));
    };

    traverse(this.root);
    return count;
  }

  /**
   * Estimate memory usage
   * @private
   */
  _estimateMemory() {
    const nodes = this._countNodes();
    // Each node: Map + boolean + object + number ≈ 100 bytes
    const estimatedBytes = nodes * 100;
    const estimatedKB = (estimatedBytes / 1024).toFixed(2);
    return `~${estimatedKB} KB`;
  }

  /**
   * Update search statistics
   * @private
   */
  _updateSearchStats(startTime) {
    const duration = performance.now() - startTime;
    const totalSearches = this.stats.searches + 1;

    this.stats.avgSearchTime = (
      (this.stats.avgSearchTime * this.stats.searches + duration) / totalSearches
    );
  }

  /**
   * Visualize Trie path for a given word
   * @param {string} word - Word to visualize
   * @returns {Array} - Path visualization
   */
  visualizePath(word) {
    const path = [];
    let node = this.root;
    const lowerWord = word.toLowerCase().trim();

    path.push({
      level: 0,
      char: 'ROOT',
      childrenCount: node.children.size,
      isEndOfWord: false
    });

    for (let i = 0; i < lowerWord.length; i++) {
      const char = lowerWord[i];

      if (!node.children.has(char)) {
        path.push({
          level: i + 1,
          char: char,
          status: 'NOT_FOUND',
          message: `Path ends here - '${char}' not in trie`
        });
        break;
      }

      node = node.children.get(char);

      path.push({
        level: i + 1,
        char: char,
        childrenCount: node.children.size,
        isEndOfWord: node.isEndOfWord,
        status: 'FOUND'
      });
    }

    return path;
  }

  /**
   * Clear the entire Trie
   */
  clear() {
    this.root = new TrieNode();
    this.totalDistricts = 0;
    this.stats = {
      insertions: 0,
      searches: 0,
      avgSearchTime: 0
    };
  }

  /**
   * Build Trie from state data
   * @param {Array} stateData - CSV data
   * @param {string} stateCode - State code
   */
  buildFromStateData(stateData, stateCode) {
    const districts = new Set();

    stateData.forEach(row => {
      if (row[2] === 'DISTRICT' && row[4] === 'Total') {
        const districtName = row[3];

        if (!districts.has(districtName)) {
          districts.add(districtName);

          this.insert(districtName, {
            stateCode,
            districtName,
            population: parseInt(row[7]) || 0,
            literate: parseInt(row[19]) || 0,
            male: parseInt(row[8]) || 0,
            female: parseInt(row[9]) || 0
          });
        }
      }
    });

    console.log(`✓ Built Trie with ${districts.size} districts from state ${stateCode}`);
  }

  /**
   * Build Trie from multiple states
   * @param {Array} statesData - Array of {stateCode, data} objects
   */
  buildFromMultipleStates(statesData) {
    console.log(`📚 Building Trie from ${statesData.length} states...`);

    statesData.forEach(({ stateCode, data }) => {
      this.buildFromStateData(data, stateCode);
    });

    console.log(`✓ Trie built with ${this.totalDistricts} total districts`);
  }

  /**
   * Get top N most searched districts
   * @param {number} n - Number of results
   * @returns {Array}
   */
  getTopDistricts(n = 10) {
    const allDistricts = this.getAllDistricts();
    return allDistricts
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, n);
  }

  /**
   * Export Trie structure for visualization
   * @param {number} maxDepth - Maximum depth to export
   * @returns {Object}
   */
  exportStructure(maxDepth = 3) {
    const structure = {
      char: 'ROOT',
      children: [],
      isEndOfWord: false
    };

    const traverse = (node, parent, depth) => {
      if (depth >= maxDepth) return;

      node.children.forEach((childNode, char) => {
        const childObj = {
          char,
          children: [],
          isEndOfWord: childNode.isEndOfWord,
          frequency: childNode.frequency
        };

        parent.children.push(childObj);
        traverse(childNode, childObj, depth + 1);
      });
    };

    traverse(this.root, structure, 0);
    return structure;
  }
}

// Export singleton instance
export const districtTrie = new DistrictTrie();
