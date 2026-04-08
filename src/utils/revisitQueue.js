// DSA: Max-heap priority queue for revisit scheduling

export class RevisitQueue {
  constructor() {
    this.heap = []
  }

  push(region) {
    const score = this._urgencyScore(region)
    this.heap.push({ ...region, score })
    this._bubbleUp(this.heap.length - 1)
  }

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

  peek() {
    return this.heap[0] || null
  }

  size() {
    return this.heap.length
  }

  _urgencyScore(r) {
    const daysSince = Math.floor((Date.now() - new Date(r.lastUpdated)) / 86400000)
    return r.anomalyCount * 3 + (100 - r.coverage) + daysSince * 2
  }

  _bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.heap[i].score > this.heap[p].score) {
        [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]
        i = p
      } else break
    }
  }

  _sinkDown(i) {
    const n = this.heap.length
    while (true) {
      let largest = i
      const l = 2*i+1, r = 2*i+2
      if (l < n && this.heap[l].score > this.heap[largest].score) largest = l
      if (r < n && this.heap[r].score > this.heap[largest].score) largest = r
      if (largest === i) break
      [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]]
      i = largest
    }
  }

  toArray() {
    return [...this.heap].sort((a,b) => b.score - a.score)
  }
}
