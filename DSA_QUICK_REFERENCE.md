# DSA Quick Reference Guide

## 🚀 Quick Start

### Access DSA Features:
1. Start dev server: `npm run dev`
2. Login as Admin (username: admin, password: admin123)
3. Click **"State Graph (BFS/DFS)"** or **"District Search (Trie)"** in sidebar

---

## 📚 Implementation Files

### Core DSA Utilities:
```
src/utils/
├── stateDataLoader.js      # HashMap Cache (267 lines)
├── stateGraph.js            # State Adjacency Graph (359 lines)
├── regionalBFS.js           # BFS Regional Analyzer (388 lines)
├── stateComparisonDFS.js    # DFS Comparison Tree (448 lines)
└── districtTrie.js          # Trie Search (472 lines)
```

### UI Components:
```
src/components/admin/
├── StateComparisonView.jsx  # Graph/BFS/DFS UI (405 lines)
└── DistrictSearchView.jsx   # Trie Search UI (383 lines)
```

---

## 🎯 Use Cases

### 1. HashMap Cache - When to Use
**Problem:** Loading same state data multiple times is slow
**Solution:** Cache with O(1) lookup
```javascript
// Automatically caches on first load
const data = await stateDataCache.loadState('09');
// Subsequent calls return cached data instantly
```

### 2. State Graph - When to Use
**Problem:** Need to find neighboring states or shortest path
**Solution:** Graph with adjacency list
```javascript
// Find states that border Uttar Pradesh
const neighbors = stateGraph.getNeighbors('09');

// Find shortest route from Kerala to J&K
const path = stateGraph.findShortestPath('32', '01');
```

### 3. BFS - When to Use
**Problem:** Analyze regional patterns spreading from a center point
**Solution:** Level-by-level traversal
```javascript
// See how literacy spreads geographically
const spread = await regionalAnalyzer.analyzeLiteracySpread('09', 3);

// Find states with similar demographics
const similar = await regionalAnalyzer.findSimilarStates('09', 'literacy', 5);
```

### 4. DFS - When to Use
**Problem:** Deep comparison between states and neighbors
**Solution:** Recursive tree building
```javascript
// Build comparison tree showing detailed metrics
const tree = await stateComparisonTree.buildComparisonTree('09', 2);

// Find most similar states in tree
const pairs = stateComparisonTree.findHighSimilarityPairs(tree, 85);
```

### 5. Trie - When to Use
**Problem:** Fast autocomplete search for district names
**Solution:** Prefix tree with shared prefixes
```javascript
// Build trie (one-time operation)
districtTrie.buildFromStateData(stateData, '09');

// Instant autocomplete (<5ms)
const results = districtTrie.autocomplete('ban', 10);
// => ['bangalore', 'bankura', 'banda', ...]
```

---

## ⚡ Performance Tips

### 1. Preload States for Better UX
```javascript
// Preload neighboring states before user navigates
const neighbors = stateGraph.getNeighbors('09');
stateDataCache.preloadStates(neighbors);
```

### 2. Clear Cache to Free Memory
```javascript
// Clear specific states
stateDataCache.clearCache(['01', '02', '03']);

// Clear all
stateDataCache.clearCache();
```

### 3. Batch Load for Efficiency
```javascript
// Load multiple states in parallel
const states = await stateDataCache.loadStates(['09', '10', '20']);
```

### 4. Check Cache Before Loading
```javascript
if (stateDataCache.isCached('09')) {
  // Use cached data
} else {
  // Load from file
}
```

---

## 🧮 Complexity Cheat Sheet

| Operation | Data Structure | Time | Space | Use Case |
|-----------|----------------|------|-------|----------|
| Cache Lookup | HashMap | O(1) | O(n*m) | Avoid reloading data |
| Get Neighbors | Graph | O(1) | O(V+E) | Find bordering states |
| Shortest Path | Graph BFS | O(V+E) | O(V) | Route between states |
| Literacy Spread | BFS | O(V+E) | O(V) | Regional analysis |
| Comparison Tree | DFS | O(V+E) | O(V*d) | Deep state comparison |
| District Search | Trie | O(m) | O(1) | Exact match |
| Autocomplete | Trie | O(m+k) | O(k) | Prefix search |

**Legend:** V=vertices, E=edges, n=items, m=string length, k=results, d=depth

---

## 🎨 Visual Guide

### State Graph Structure:
```
Uttar Pradesh (09) connects to:
├── Uttarakhand (05)
├── Haryana (06)
├── Delhi (07)
├── Rajasthan (08)
├── Bihar (10)
├── Jharkhand (20)
├── Chhattisgarh (22)
└── Madhya Pradesh (23)
```

### BFS Traversal Levels:
```
Level 0: [Uttar Pradesh]
Level 1: [Uttarakhand, Haryana, Delhi, Rajasthan, Bihar, ...]
Level 2: [Punjab, Himachal Pradesh, Odisha, ...]
Level 3: [Jammu & Kashmir, West Bengal, ...]
```

### DFS Tree Example:
```
Uttar Pradesh (root)
├── Haryana (depth 1)
│   ├── Punjab (depth 2)
│   └── Himachal Pradesh (depth 2)
├── Delhi (depth 1)
└── Rajasthan (depth 1)
    └── Gujarat (depth 2)
```

### Trie Structure for "ban":
```
ROOT
└── b
    └── a
        └── n
            ├── g [bangalore] ✓
            ├── k [bankura] ✓
            └── d [banda] ✓
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Cache Not Working
**Symptom:** Every load is slow
**Solution:** Check if state code is padded (use '09' not '9')
```javascript
// ❌ Wrong
await stateDataCache.loadState('9');

// ✅ Correct
await stateDataCache.loadState('09');
```

### Issue 2: Graph Shows "No Path Found"
**Symptom:** States appear disconnected
**Solution:** Island states (Lakshadweep, Andaman) have no land borders
```javascript
const path = stateGraph.findShortestPath('31', '01');
// => { message: 'No path found (possibly island states)' }
```

### Issue 3: Trie Search Returns Nothing
**Symptom:** Autocomplete shows no results
**Solution:** Ensure Trie is built before searching
```javascript
// Build Trie first
districtTrie.buildFromStateData(stateData, '09');

// Then search
const results = districtTrie.autocomplete('luc');
```

### Issue 4: BFS/DFS Taking Too Long
**Symptom:** Analysis takes >5 seconds
**Solution:** Reduce depth/radius parameter
```javascript
// ❌ Too deep (analyzes 30+ states)
await regionalAnalyzer.analyzeLiteracySpread('09', 5);

// ✅ Optimal (analyzes ~15 states)
await regionalAnalyzer.analyzeLiteracySpread('09', 2);
```

---

## 📈 Performance Benchmarks

### Expected Timings (M1 MacBook Pro):

| Operation | First Run | Cached | Target |
|-----------|-----------|--------|--------|
| Load State | 50-200ms | <1ms | <100ms |
| Get Neighbors | - | <0.1ms | <1ms |
| Shortest Path | 5-15ms | 5-15ms | <20ms |
| BFS Depth 3 | 800-1500ms | 200-500ms | <2s |
| DFS Depth 2 | 1000-2000ms | 300-800ms | <2s |
| Build Trie (640 districts) | 1500-3000ms | - | <5s |
| Autocomplete | - | 0.5-2ms | <5ms |

---

## 🎓 Learning Resources

### In-Code Documentation:
- Each class has detailed JSDoc comments
- Time/space complexity noted for every method
- Real-world usage examples included

### Visual Learning:
- Open StateComparisonView to see BFS/DFS in action
- Open DistrictSearchView to see Trie traversal visualized
- Check browser console for algorithm logs

### Testing:
```bash
# Browser console (after starting dev server)
import('./test-dsa.js');
```

---

## 🔧 Advanced Usage

### Custom BFS Analysis:
```javascript
// Analyze urbanization instead of literacy
const pattern = await regionalAnalyzer.analyzeRegionalPattern(
  '09',
  'urbanization',
  2
);
```

### Multi-Tree Comparison:
```javascript
// Build trees from multiple states
const trees = await stateComparisonTree.buildMultipleTrees(
  ['09', '19', '27'],
  2
);
```

### Fuzzy District Search:
```javascript
// Tolerates typos
const results = districtTrie.fuzzySearch('bangalor', 10);
// Still finds "bangalore"
```

### State-Specific District Search:
```javascript
// Get only UP districts
const upDistricts = districtTrie.getDistrictsByState('09');
```

---

## 📊 Monitoring Cache Performance

```javascript
// Get detailed cache statistics
const stats = stateDataCache.getStats();
console.table({
  'Cached States': stats.cached,
  'Total Requests': stats.totalRequests,
  'Cache Hits': stats.hits,
  'Cache Misses': stats.misses,
  'Hit Rate': stats.hitRate,
  'Memory Used': stats.memorySizeEstimate
});
```

**Target Metrics:**
- Hit Rate: >70% after warmup
- Memory: <10 MB for 10 states
- Avg Request Time: <50ms (cached)

---

## 🎯 Next Steps

1. **Explore UI:** Try both new sidebar menu items
2. **Run Tests:** Load test-dsa.js in browser console
3. **Read Code:** Check implementation files for detailed docs
4. **Optimize:** Adjust depth/radius parameters for your needs
5. **Extend:** Add more metrics or visualization features

---

**Last Updated:** April 8, 2026
**Version:** 1.0.0
**Total DSA Code:** 3,272 lines
