/**
 * MAX-HEAP PRIORITY QUEUE for District Revisit Scheduling
 *
 * DSA Algorithm: Binary Heap (Max-Heap)
 * Time Complexity:
 *   - Push (insert): O(log n)
 *   - Pop (extract max): O(log n)
 *   - Peek: O(1)
 * Space Complexity: O(n)
 *
 * Use Case: Efficiently prioritize districts needing revisits based on
 * urgency score calculated from anomaly count, data quality, and population.
 */

export class RevisitPriorityQueue {
  constructor() {
    this.heap = []
  }

  /**
   * Calculate urgency score for a district based on multiple factors
   * Higher score = Higher priority for revisit
   */
  calculateUrgency(district) {
    // Factor 1: Anomaly count (weight: 10 per anomaly)
    const anomalyScore = (district.anomalyCount || 0) * 10

    // Factor 2: Data completeness (inverse - less complete = higher priority)
    const dataQualityScore = (100 - (district.completenessPercent || 100)) * 2

    // Factor 3: Population weight (log scale to avoid overwhelming small issues)
    const populationWeight = Math.log10(parseInt(district.TOT_P || 1) + 1)

    return anomalyScore + dataQualityScore + populationWeight
  }

  /**
   * Insert district into priority queue
   * O(log n) time complexity due to bubble-up operation
   */
  push(district) {
    const urgency = this.calculateUrgency(district)
    this.heap.push({ ...district, urgencyScore: urgency })
    this._bubbleUp(this.heap.length - 1)
  }

  /**
   * Extract district with highest urgency
   * O(log n) time complexity due to sink-down operation
   */
  pop() {
    if (this.heap.length === 0) return null

    const top = this.heap[0]
    const last = this.heap.pop()

    if (this.heap.length > 0) {
      this.heap[0] = last
      this._sinkDown(0)
    }

    return top
  }

  /**
   * View highest priority district without removing
   * O(1) time complexity
   */
  peek() {
    return this.heap[0] || null
  }

  /**
   * Get current queue size
   */
  size() {
    return this.heap.length
  }

  /**
   * Convert heap to sorted array (descending by urgency)
   * O(n log n) time complexity
   */
  toArray() {
    return [...this.heap].sort((a, b) => b.urgencyScore - a.urgencyScore)
  }

  /**
   * Bubble up: Maintain heap property after insertion
   * Move element up until parent is larger
   */
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)

      if (this.heap[index].urgencyScore > this.heap[parentIndex].urgencyScore) {
        // Swap with parent
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]]
        index = parentIndex
      } else {
        break
      }
    }
  }

  /**
   * Sink down: Maintain heap property after extraction
   * Move element down until both children are smaller
   */
  _sinkDown(index) {
    const length = this.heap.length

    while (true) {
      let largest = index
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2

      // Check if left child is larger
      if (leftChild < length && this.heap[leftChild].urgencyScore > this.heap[largest].urgencyScore) {
        largest = leftChild
      }

      // Check if right child is larger
      if (rightChild < length && this.heap[rightChild].urgencyScore > this.heap[largest].urgencyScore) {
        largest = rightChild
      }

      // If no swap needed, heap property is satisfied
      if (largest === index) break

      // Swap with largest child
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]]
      index = largest
    }
  }

  /**
   * Clear all elements from queue
   */
  clear() {
    this.heap = []
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.heap.length === 0
  }
}
