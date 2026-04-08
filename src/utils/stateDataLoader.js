import Papa from 'papaparse';

/**
 * HashMap-based cache for lazy loading state data
 * Time Complexity:
 * - loadState: O(1) cache hit, O(n) cache miss (n = file size)
 * - loadStates: O(k) where k = number of states
 * Space Complexity: O(n * m) where n = number of states, m = data per state
 */
class StateDataCache {
  constructor() {
    this.cache = new Map(); // HashMap for O(1) lookup
    this.loadingStates = new Set(); // Track in-progress loads
    this.loadPromises = new Map(); // Store promises for concurrent requests
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  /**
   * Lazy load state data only when needed
   * @param {string} stateCode - State code (01-35)
   * @returns {Promise<Array>} - Parsed CSV data
   */
  async loadState(stateCode) {
    this.stats.totalRequests++;

    // O(1) cache hit
    if (this.cache.has(stateCode)) {
      console.log(`✓ Cache HIT for state ${stateCode}`);
      this.stats.hits++;
      return this.cache.get(stateCode);
    }

    // If already loading, return existing promise
    if (this.loadPromises.has(stateCode)) {
      console.log(`⌛ Waiting for state ${stateCode} to finish loading...`);
      return this.loadPromises.get(stateCode);
    }

    console.log(`✗ Cache MISS - Loading state ${stateCode}...`);
    this.stats.misses++;
    this.loadingStates.add(stateCode);

    // Create loading promise
    const loadPromise = this._fetchStateData(stateCode);
    this.loadPromises.set(stateCode, loadPromise);

    try {
      const data = await loadPromise;

      // Store in cache
      this.cache.set(stateCode, data);
      this.loadingStates.delete(stateCode);
      this.loadPromises.delete(stateCode);

      console.log(`✓ State ${stateCode} loaded successfully (${data.length} rows)`);
      return data;
    } catch (error) {
      this.loadingStates.delete(stateCode);
      this.loadPromises.delete(stateCode);
      console.error(`✗ Failed to load state ${stateCode}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch state data from CSV file
   * @private
   */
  async _fetchStateData(stateCode) {
    const paddedCode = String(stateCode).padStart(2, '0');
    const response = await fetch(`/pca/${paddedCode}.csv`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch state ${stateCode}`);
    }

    const csvText = await response.text();
    return this.parseCSV(csvText);
  }

  /**
   * Load multiple states efficiently (parallel loading)
   * @param {Array<string>} stateCodes - Array of state codes
   * @returns {Promise<Array>} - Array of state data
   */
  async loadStates(stateCodes) {
    console.log(`📦 Batch loading ${stateCodes.length} states...`);
    const startTime = performance.now();

    const results = await Promise.all(
      stateCodes.map(code => this.loadState(code))
    );

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✓ Batch load complete in ${duration}ms`);

    return results;
  }

  /**
   * Preload states for better UX
   * @param {Array<string>} stateCodes - States to preload
   */
  async preloadStates(stateCodes) {
    console.log(`🔄 Preloading ${stateCodes.length} states in background...`);

    // Non-blocking preload
    stateCodes.forEach(code => {
      if (!this.cache.has(code) && !this.loadingStates.has(code)) {
        this.loadState(code).catch(err => {
          console.warn(`Preload failed for state ${code}:`, err.message);
        });
      }
    });
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : 0;

    return {
      cached: this.cache.size,
      cacheKeys: Array.from(this.cache.keys()).sort(),
      loading: this.loadingStates.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests: this.stats.totalRequests,
      hitRate: `${hitRate}%`,
      memorySizeEstimate: this._estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cache
   * @private
   */
  _estimateMemoryUsage() {
    let totalRows = 0;
    this.cache.forEach(data => {
      totalRows += data.length;
    });

    // Rough estimate: ~100 bytes per row
    const estimatedBytes = totalRows * 100;
    const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(2);

    return `~${estimatedMB} MB`;
  }

  /**
   * Clear cache to free memory
   * @param {Array<string>} stateCodes - Optional: clear specific states only
   */
  clearCache(stateCodes = null) {
    if (stateCodes) {
      stateCodes.forEach(code => this.cache.delete(code));
      console.log(`🗑️  Cleared ${stateCodes.length} states from cache`);
    } else {
      const size = this.cache.size;
      this.cache.clear();
      console.log(`🗑️  Cleared entire cache (${size} states)`);
    }
  }

  /**
   * Parse CSV text to array
   * @param {string} csvText - Raw CSV text
   * @returns {Array} - Parsed data
   */
  parseCSV(csvText) {
    const result = Papa.parse(csvText, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    return result.data;
  }

  /**
   * Get state data from cache (sync, no loading)
   * @param {string} stateCode - State code
   * @returns {Array|null} - Cached data or null
   */
  getCached(stateCode) {
    return this.cache.get(stateCode) || null;
  }

  /**
   * Check if state is cached
   * @param {string} stateCode - State code
   * @returns {boolean}
   */
  isCached(stateCode) {
    return this.cache.has(stateCode);
  }

  /**
   * Check if state is currently loading
   * @param {string} stateCode - State code
   * @returns {boolean}
   */
  isLoading(stateCode) {
    return this.loadingStates.has(stateCode);
  }
}

// Export singleton instance
export const stateDataCache = new StateDataCache();

// Export class for testing
export { StateDataCache };
