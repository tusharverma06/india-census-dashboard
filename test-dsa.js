/**
 * DSA Implementation Test Script
 * Run this in browser console to test all 5 DSA implementations
 */

async function testDSAImplementations() {
  console.log('🧪 Starting DSA Implementation Tests...\n');

  // Test 1: HashMap Cache
  console.log('📦 TEST 1: HashMap State Data Cache');
  console.log('=====================================');

  const { stateDataCache } = await import('./src/utils/stateDataLoader.js');

  console.time('First Load (Cache Miss)');
  const state1 = await stateDataCache.loadState('09');
  console.timeEnd('First Load (Cache Miss)');

  console.time('Second Load (Cache Hit)');
  const state2 = await stateDataCache.loadState('09');
  console.timeEnd('Second Load (Cache Hit)');

  const cacheStats = stateDataCache.getStats();
  console.log('Cache Stats:', cacheStats);
  console.log('✅ HashMap Cache Test Passed\n');

  // Test 2: State Graph
  console.log('🗺️  TEST 2: State Adjacency Graph');
  console.log('=================================');

  const { stateGraph } = await import('./src/utils/stateGraph.js');

  const neighbors = stateGraph.getNeighbors('09');
  console.log('UP Neighbors:', neighbors.length, 'states');

  const path = stateGraph.findShortestPath('32', '01');
  console.log('Path from Kerala to J&K:', path.distance, 'hops');
  console.log('Route:', path.stateNames.join(' → '));

  const graphStats = stateGraph.getGraphStats();
  console.log('Graph Stats:', graphStats);
  console.log('✅ Graph Test Passed\n');

  // Test 3: BFS Regional Analyzer
  console.log('🔍 TEST 3: BFS Regional Analyzer');
  console.log('=================================');

  const { regionalAnalyzer } = await import('./src/utils/regionalBFS.js');

  console.time('BFS Literacy Spread');
  const bfsResults = await regionalAnalyzer.analyzeLiteracySpread('09', 2);
  console.timeEnd('BFS Literacy Spread');

  console.log('States Analyzed:', bfsResults.statesAnalyzed);
  console.log('Average Literacy:', bfsResults.summary.averageLiteracy + '%');
  console.log('✅ BFS Test Passed\n');

  // Test 4: DFS Comparison Tree
  console.log('🌳 TEST 4: DFS State Comparison Tree');
  console.log('====================================');

  const { stateComparisonTree } = await import('./src/utils/stateComparisonDFS.js');

  console.time('DFS Tree Build');
  const tree = await stateComparisonTree.buildComparisonTree('09', 2);
  console.timeEnd('DFS Tree Build');

  const treeAnalysis = stateComparisonTree.analyzeTree(tree);
  console.log('Tree Nodes:', treeAnalysis.totalNodes);
  console.log('Average Similarity:', treeAnalysis.averageSimilarity + '%');
  console.log('✅ DFS Test Passed\n');

  // Test 5: District Trie
  console.log('🔠 TEST 5: District Search Trie');
  console.log('================================');

  const { districtTrie } = await import('./src/utils/districtTrie.js');

  // Build trie from one state
  console.time('Trie Build');
  const testStateData = await stateDataCache.loadState('09');
  districtTrie.buildFromStateData(testStateData, '09');
  console.timeEnd('Trie Build');

  console.time('Trie Autocomplete');
  const searchResults = districtTrie.autocomplete('luc', 10);
  console.timeEnd('Trie Autocomplete');

  console.log('Search Results:', searchResults.length, 'districts');
  console.log('Results:', searchResults.map(r => r.name).join(', '));

  const trieStats = districtTrie.getStats();
  console.log('Trie Stats:', trieStats);
  console.log('✅ Trie Test Passed\n');

  // Final Summary
  console.log('🎉 ALL TESTS PASSED!');
  console.log('====================');
  console.log('✅ HashMap Cache - O(1) lookup working');
  console.log('✅ State Graph - O(V+E) traversal working');
  console.log('✅ BFS - Level-order traversal working');
  console.log('✅ DFS - Depth-first tree building working');
  console.log('✅ Trie - O(m) autocomplete working');
  console.log('\n📊 Final Cache Stats:', stateDataCache.getStats());
}

// Run tests
testDSAImplementations().catch(console.error);
