# Real-Time Census Integrity Dashboard — Implementation Guide

## Project Overview

A dual-role web application for India's census data collection and monitoring.
Officers fill household forms in the field. Admins see live stats, anomaly alerts,
regional coverage maps, and enumerator performance — all from one dashboard.

Stack: React + Vite, JSON file as local database (no backend needed for hackathon),
Chart.js for graphs, pure CSS light mode UI.

---

## Role System & Auth

Two hardcoded roles for hackathon simplicity. No real auth needed.

```js
// auth.js
const USERS = [
  { id: 'OFF001', name: 'Ravi Kumar',    role: 'officer', region: 'Delhi-North',   pin: '1234' },
  { id: 'OFF002', name: 'Priya Sharma',  role: 'officer', region: 'Mumbai-West',   pin: '2345' },
  { id: 'OFF003', name: 'Amit Singh',    role: 'officer', region: 'Chennai-South', pin: '3456' },
  { id: 'OFF004', name: 'Sunita Devi',   role: 'officer', region: 'Kolkata-East',  pin: '4567' },
  { id: 'ADM001', name: 'Admin',         role: 'admin',   region: null,            pin: '0000' },
]

export function login(employeeId, pin) {
  return USERS.find(u => u.id === employeeId && u.pin === pin) || null
}
```

Login page has two clear entry points: "Login as Officer" and "Login as Admin"
with different accent colors. Same form underneath, just routes differently on success.

---

## Data Schema — households.json

All officer submissions write to this file. Admin reads from it.

```json
{
  "households": [
    {
      "id": "HH-OFF001-1701234567",
      "submittedBy": "OFF001",
      "officerName": "Ravi Kumar",
      "region": "Delhi-North",
      "submittedAt": "2024-01-15T10:30:00Z",
      "status": "complete",

      "address": {
        "houseNumber": "42B",
        "street": "Gandhi Nagar",
        "ward": "Ward 7",
        "district": "North Delhi",
        "state": "Delhi",
        "pincode": "110007"
      },

      "members": [
        {
          "name": "Suresh Mehta",
          "age": 45,
          "gender": "Male",
          "relation": "Head",
          "education": "Graduate",
          "occupation": "Self-employed",
          "maritalStatus": "Married",
          "religion": "Hindu",
          "caste": "General",
          "aadharLast4": "7823",
          "disability": false,
          "migrant": false
        }
      ],

      "householdInfo": {
        "totalMembers": 4,
        "monthlyIncome": "25000-50000",
        "houseType": "Pucca",
        "ownership": "Owned",
        "rooms": 3,
        "toilet": true,
        "drinkingWater": "Tap",
        "electricity": true,
        "lpgConnection": true,
        "internet": false,
        "vehiclesOwned": ["Two-wheeler"]
      },

      "anomalyFlags": [],
      "completionScore": 100
    }
  ],

  "meta": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "totalTargetHouseholds": 500,
    "version": "1.0"
  }
}
```

---

## File Structure

```
/src
  /components
    /auth
      LoginPage.jsx
    /officer
      OfficerDashboard.jsx
      HouseholdForm.jsx
      FormSection.jsx
      SubmissionSuccess.jsx
    /admin
      AdminDashboard.jsx
      StatsBar.jsx
      CoverageMap.jsx
      AnomalyPanel.jsx
      EnumeratorTable.jsx
      RegionBreakdown.jsx
      MissedHouseholdsPanel.jsx
    /shared
      Navbar.jsx
      ProgressBar.jsx
      StatCard.jsx
      Badge.jsx
  /data
    households.json
    indiaRegions.js      ← region definitions with coordinates
    cards.js             ← mock card pool (if needed)
  /utils
    anomalyDetector.js   ← DSA: hashmap duplicate check + constraint validation
    bfsTraversal.js      ← DSA: BFS across region graph for coverage spread
    waveGenerator.js     ← DSA: priority queue for revisit scheduling
    dataParser.js        ← parse households.json, compute stats
  /hooks
    useHouseholds.js     ← read/write households.json
    useAnomalies.js      ← run anomaly detection on data
  App.jsx
  main.jsx
  index.css
```

---

## Officer Side

### OfficerDashboard.jsx

After login, officer sees:
- Their name + region + employee ID in top bar
- Their personal stats: forms submitted today, this week, completion rate
- Big "New Household Entry" button
- List of their recent submissions with status badges

```jsx
// Layout
<div className="officer-shell">
  <Navbar role="officer" user={currentUser} />

  <div className="officer-home">
    <div className="officer-stats-row">
      <StatCard label="Submitted Today" value={todayCount} icon="📋" />
      <StatCard label="This Week"       value={weekCount}  icon="📅" />
      <StatCard label="Completion Rate" value="94%"        icon="✅" />
      <StatCard label="Region"          value={user.region} icon="📍" />
    </div>

    <button className="cta-btn" onClick={() => setView('form')}>
      + New Household Entry
    </button>

    <RecentSubmissions entries={mySubmissions} />
  </div>
</div>
```

### HouseholdForm.jsx

Multi-step form. 4 sections, progress indicator at top.
One section per screen — not one giant scroll. Feels less overwhelming in the field.

```
Step 1: Address Details
Step 2: Household Members (dynamic — add/remove members)
Step 3: Household Amenities & Income
Step 4: Review & Submit
```

**Step 1 — Address:**
```
House Number | Street Name
Ward         | District
State (dropdown, all Indian states) | Pincode
```

**Step 2 — Members (dynamic list):**
```
For each member:
  Name | Age | Gender (M/F/Other)
  Relation to Head (Head/Spouse/Son/Daughter/Parent/Other)
  Education | Occupation | Marital Status
  Religion | Caste Category (General/OBC/SC/ST)
  Aadhar last 4 digits | Disability (Y/N) | Migrant (Y/N)

[ + Add Member ] button
```

**Step 3 — Household Info:**
```
Total Members (auto-counted from step 2)
Monthly Income (bracket dropdown)
House Type (Pucca/Semi-Pucca/Kutcha)
Ownership (Owned/Rented/Government)
Number of Rooms
Toilet Available (Y/N)
Drinking Water Source (Tap/Well/Tanker/River)
Electricity (Y/N)
LPG Connection (Y/N)
Internet Access (Y/N)
Vehicles Owned (multi-select: None/Bicycle/Two-wheeler/Car/Tractor)
```

**Step 4 — Review:**
Show all entered data in read-only summary cards. Submit button.
On submit: generate unique ID, run anomaly pre-check, save to JSON, show success screen.

### Form validation (run before save):

```js
// In HouseholdForm.jsx before submit
function preValidate(formData) {
  const warnings = []

  formData.members.forEach((m, i) => {
    if (m.age < 0 || m.age > 120)
      warnings.push(`Member ${i+1}: Invalid age ${m.age}`)
    if (m.relation === 'Head' && m.age < 18)
      warnings.push(`Member ${i+1}: Head of household under 18`)
    if (m.maritalStatus === 'Married' && m.age < 16)
      warnings.push(`Member ${i+1}: Married but age ${m.age} seems invalid`)
  })

  const declaredTotal = formData.householdInfo.totalMembers
  const actualCount = formData.members.length
  if (declaredTotal !== actualCount)
    warnings.push(`Declared ${declaredTotal} members but only ${actualCount} entered`)

  return warnings
}
```

Show warnings in a modal — officer can override and submit anyway (flags as anomaly) or go back and fix.

---

## Admin Side

### AdminDashboard.jsx Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: Census Dashboard | Last updated: 2 min ago | 🔔 │
├──────────────┬──────────────────────────────────────────┤
│              │  STATS BAR (top)                         │
│   INDIA MAP  │  ─────────────────────────────────────── │
│  (left 40%)  │  ANOMALY PANEL                           │
│              │  ─────────────────────────────────────── │
│              │  ENUMERATOR TABLE                        │
├──────────────┴──────────────────────────────────────────┤
│  REGION BREAKDOWN TABLE  |  CHARTS ROW                  │
└─────────────────────────────────────────────────────────┘
```

### StatsBar.jsx — Top KPI row

5 stat cards across the top:

```
Total Households Surveyed | Coverage %  | Anomalies Detected | Officers Active | Avg Completion Score
        347 / 500         |    69.4%    |        12          |       4         |       91%
```

Each card has: icon, large number, label, and a small delta (↑ 23 since yesterday).

### CoverageMap.jsx — India Map with color coding

Use an SVG map of India's states. Each state/region is an SVG path.
Color-code by coverage percentage:

```js
function getCoverageColor(pct) {
  if (pct >= 80) return '#16a34a'  // green — complete
  if (pct >= 50) return '#ca8a04'  // yellow — partial
  if (pct >= 20) return '#ea580c'  // orange — low
  return '#dc2626'                  // red — critical
}
```

On hover over a state: show tooltip with state name, surveyed count, officer assigned, anomaly count.

**SVG India map source:**
Use this free SVG: `https://raw.githubusercontent.com/datta07/INDIAN-SVG-MAP/master/INDIA/INDIA.svg`
Each state path has an `id` matching state name. You manipulate fill color via JS after fetch.

```js
// CoverageMap.jsx
useEffect(() => {
  fetch('https://raw.githubusercontent.com/datta07/INDIAN-SVG-MAP/master/INDIA/INDIA.svg')
    .then(r => r.text())
    .then(svgText => {
      // inject into DOM, then color each state path
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const paths = svgDoc.querySelectorAll('path')
      paths.forEach(path => {
        const stateName = path.getAttribute('id') || path.getAttribute('title')
        const coverage = getCoverageForState(stateName, householdData)
        path.style.fill = getCoverageColor(coverage)
        path.style.stroke = '#fff'
        path.style.strokeWidth = '0.5'
      })
      setSvgContent(new XMLSerializer().serializeToString(svgDoc))
    })
}, [householdData])
```

**Map legend below:**
```
🟢 80-100% Complete   🟡 50-79% Partial   🟠 20-49% Low   🔴 0-19% Critical
```

### AnomalyPanel.jsx

```jsx
// Shows list of flagged entries
<div className="anomaly-panel">
  <h3>⚠️ Anomalies Detected <Badge count={anomalies.length} color="red" /></h3>

  {anomalies.map(a => (
    <div className="anomaly-row" key={a.id}>
      <span className="anomaly-type">{a.type}</span>
      <span className="anomaly-desc">{a.description}</span>
      <span className="anomaly-officer">{a.officerName}</span>
      <span className="anomaly-region">{a.region}</span>
      <button onClick={() => flagForRevisit(a.householdId)}>Flag Revisit</button>
    </div>
  ))}
</div>
```

Anomaly types shown with color badges:
- 🔴 INVALID_AGE
- 🟠 DUPLICATE_ENTRY
- 🟡 MEMBER_COUNT_MISMATCH
- 🔵 INCOMPLETE_FORM
- 🟣 CONFLICTING_DATA

### EnumeratorTable.jsx — Officer Performance

Table showing each officer's stats:

```
Officer | Region | Submitted | Anomalies | Avg Score | Last Active | Status
OFF001  | Delhi  |    89     |     2     |    96%    | 10 min ago  | 🟢 Active
OFF002  | Mumbai |    67     |     5     |    88%    | 2 hrs ago   | 🟡 Idle
OFF003  | Chennai|    43     |     1     |    98%    | 1 day ago   | 🔴 Inactive
```

Sort by any column. Click officer row to see their individual submissions.

### Charts Row

**Chart 1 — Age Distribution (Bar chart)**
X-axis: age brackets (0-10, 11-20, 21-30, 31-40, 41-50, 51-60, 60+)
Y-axis: count of individuals
Color: gradient blue bars

**Chart 2 — Gender Ratio (Donut chart)**
Male / Female / Other breakdown across all surveyed households

**Chart 3 — Survey Progress by Day (Line chart)**
X-axis: last 7 days
Y-axis: cumulative households surveyed
Shows velocity — are officers speeding up or slowing down?

**Chart 4 — Income Distribution (Horizontal bar)**
Each income bracket as a row, bar length = count

**Chart 5 — Amenities Coverage (Radar/Spider chart)**
Axes: Electricity, Toilet, LPG, Internet, Clean Water, Pucca House
Shows what % of surveyed households have each amenity

All charts use Chart.js. Install: `npm install chart.js react-chartjs-2`

### RegionBreakdown.jsx — Progress Bars per Region

```jsx
{regions.map(r => (
  <div className="region-row" key={r.name}>
    <span className="region-name">{r.name}</span>
    <ProgressBar value={r.surveyed} max={r.target} color={getColor(r.pct)} />
    <span className="region-pct">{r.pct}%</span>
    <span className="region-count">{r.surveyed}/{r.target}</span>
  </div>
))}
```

---

## DSA Implementations

### 1. anomalyDetector.js — HashMap duplicate detection

```js
// DSA: HashMap for O(1) duplicate lookup
export function detectAnomalies(households) {
  const anomalies = []

  // Duplicate detection using HashMap
  const aadharMap = new Map()      // aadhar last 4 + name → householdId
  const addressMap = new Map()     // full address string → householdId

  households.forEach(hh => {
    // Address duplicate check
    const addrKey = `${hh.address.houseNumber}-${hh.address.street}-${hh.address.pincode}`
    if (addressMap.has(addrKey)) {
      anomalies.push({
        type: 'DUPLICATE_ENTRY',
        householdId: hh.id,
        description: `Possible duplicate address with ${addressMap.get(addrKey)}`,
        severity: 'high',
        officerName: hh.officerName,
        region: hh.region
      })
    } else {
      addressMap.set(addrKey, hh.id)
    }

    // Per-member constraint validation
    hh.members.forEach((m, i) => {
      // Invalid age
      if (m.age < 0 || m.age > 120) {
        anomalies.push({ type: 'INVALID_AGE',
          description: `Member ${m.name}: age ${m.age} is invalid`, severity: 'high', ...meta(hh) })
      }

      // Child as head of household
      if (m.relation === 'Head' && m.age < 18) {
        anomalies.push({ type: 'CONFLICTING_DATA',
          description: `${m.name} listed as Head but age is ${m.age}`, severity: 'medium', ...meta(hh) })
      }

      // Married minor
      if (m.maritalStatus === 'Married' && m.age < 18) {
        anomalies.push({ type: 'CONFLICTING_DATA',
          description: `${m.name} marked Married at age ${m.age}`, severity: 'medium', ...meta(hh) })
      }
    })

    // Member count mismatch
    if (hh.householdInfo.totalMembers !== hh.members.length) {
      anomalies.push({ type: 'MEMBER_COUNT_MISMATCH',
        description: `Declared ${hh.householdInfo.totalMembers} members, found ${hh.members.length}`,
        severity: 'low', ...meta(hh) })
    }
  })

  return anomalies
}

function meta(hh) {
  return { householdId: hh.id, officerName: hh.officerName, region: hh.region }
}
```

### 2. bfsTraversal.js — Region graph coverage spread

```js
// DSA: BFS across region adjacency graph
// Used to compute coverage "spread" — if a region has good coverage,
// its neighbors are likely to also have coverage (for prediction)

const REGION_GRAPH = {
  'Delhi-North':   ['Delhi-South', 'Haryana-North', 'UP-West'],
  'Delhi-South':   ['Delhi-North', 'Haryana-South', 'UP-West'],
  'Mumbai-West':   ['Mumbai-East', 'Pune', 'Thane'],
  'Mumbai-East':   ['Mumbai-West', 'Thane', 'Navi-Mumbai'],
  // ... add all regions
}

export function bfsCoverageSpread(startRegion, coverageMap) {
  const visited = new Set()
  const queue = [startRegion]
  const result = []   // regions in order of BFS traversal
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

// Used to find regions with 0% coverage surrounded by high coverage
// → these are the "missed household" candidates
export function findIsolatedLowCoverage(coverageMap) {
  const suspect = []

  Object.keys(coverageMap).forEach(region => {
    if (coverageMap[region] < 20) {
      const neighbors = REGION_GRAPH[region] || []
      const neighborAvg = neighbors.reduce((sum, n) =>
        sum + (coverageMap[n] || 0), 0) / (neighbors.length || 1)

      if (neighborAvg > 60) {
        suspect.push({ region, coverage: coverageMap[region], neighborAvg,
          priority: neighborAvg - coverageMap[region] })
      }
    }
  })

  // Sort by priority (biggest gap = needs revisit most)
  return suspect.sort((a, b) => b.priority - a.priority)
}
```

### 3. revisitQueue.js — Priority queue for revisit scheduling

```js
// DSA: Max-heap priority queue
// Admin can push regions to revisit queue, sorted by urgency score
// Urgency = anomaly count * 3 + (100 - coverage%) + days since last update

export class RevisitQueue {
  constructor() { this.heap = [] }

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

  _urgencyScore(r) {
    const daysSince = Math.floor((Date.now() - new Date(r.lastUpdated)) / 86400000)
    return r.anomalyCount * 3 + (100 - r.coverage) + daysSince * 2
  }

  _bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.heap[i].score > this.heap[p].score) {
        ;[this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]
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
      ;[this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]]
      i = largest
    }
  }

  toArray() { return [...this.heap].sort((a,b) => b.score - a.score) }
}
```

### DSA Summary for Judges

| Concept | File | Purpose |
|---|---|---|
| HashMap / Map | anomalyDetector.js | O(1) duplicate address + aadhar detection |
| Constraint validation | anomalyDetector.js | Rule-based data integrity checks |
| BFS graph traversal | bfsTraversal.js | Coverage spread across region adjacency graph |
| Missed household prediction | bfsTraversal.js | Isolate low-coverage regions surrounded by high-coverage |
| Max-Heap priority queue | revisitQueue.js | Rank regions by urgency for revisit scheduling |
| Sorting (multi-key) | EnumeratorTable.jsx | Officer performance table sort |
| Greedy scoring | revisitQueue.js | Urgency score computation |

---

## UI Design System — Light Mode

```css
/* index.css */

:root {
  /* Backgrounds */
  --bg-page:    #f8fafc;
  --bg-card:    #ffffff;
  --bg-sidebar: #ffffff;

  /* Brand */
  --primary:        #2563eb;   /* government blue */
  --primary-light:  #eff6ff;
  --primary-dark:   #1d4ed8;

  /* Semantic */
  --success:  #16a34a;
  --warning:  #ca8a04;
  --danger:   #dc2626;
  --orange:   #ea580c;
  --info:     #0891b2;

  /* Text */
  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-muted:     #94a3b8;

  /* Borders */
  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);

  /* Typography */
  --font: 'Inter', system-ui, sans-serif;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font);
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
}

/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

/* Stat cards */
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card .value { font-size: 28px; font-weight: 700; color: var(--text-primary); }
.stat-card .label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card .delta { font-size: 12px; color: var(--success); }

/* Navbar */
.navbar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-brand {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Progress bars */
.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.badge-red    { background: #fef2f2; color: #dc2626; }
.badge-yellow { background: #fefce8; color: #ca8a04; }
.badge-green  { background: #f0fdf4; color: #16a34a; }
.badge-blue   { background: #eff6ff; color: #2563eb; }
.badge-purple { background: #faf5ff; color: #7c3aed; }

/* Form inputs */
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.form-input {
  padding: 9px 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s;
  background: white;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px #2563eb20; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.btn-primary   { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-outline   { background: white; color: var(--primary); border: 1px solid var(--primary); }
.btn-danger    { background: var(--danger); color: white; }
.btn-sm        { padding: 6px 12px; font-size: 13px; }
```

---

## Login Page Design

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│           🏛️  Census of India 2024                         │
│           Real-Time Integrity Dashboard                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │   Employee ID  [________________]                    │  │
│  │   PIN          [________________]                    │  │
│  │                                                      │  │
│  │   [ Login as Officer ]   [ Login as Admin ]          │  │
│  │                                                      │  │
│  │   Officer IDs: OFF001-OFF004 (PIN: 1234-4567)       │  │
│  │   Admin: ADM001  PIN: 0000                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│   Ministry of Home Affairs | Government of India           │
└────────────────────────────────────────────────────────────┘
```

Background: subtle geometric pattern in light blue.
Two buttons with different colors — blue for officer, slate/dark for admin.

---

## Mock Data (seed this in households.json)

Pre-populate with ~40-50 households across 4 regions so the admin dashboard
looks live and real on demo day. Include:
- 5-6 intentional anomalies (invalid age 150, duplicate address, member mismatch)
- Coverage spread: Delhi ~80%, Mumbai ~60%, Chennai ~40%, Kolkata ~20%
- Mix of complete and partial submissions

This makes the anomaly panel, map colors, and progress bars actually show
meaningful data during the judge demo.

---

## Build Order

1. `index.css` — full design system first
2. `LoginPage.jsx` — auth, routing to officer vs admin
3. `households.json` — seed with mock data
4. `OfficerDashboard.jsx` + `HouseholdForm.jsx` — 4-step form, save to JSON
5. `anomalyDetector.js` + `bfsTraversal.js` + `revisitQueue.js` — DSA core
6. `AdminDashboard.jsx` shell + `StatsBar.jsx`
7. `CoverageMap.jsx` — India SVG map with color coding
8. `AnomalyPanel.jsx` + `EnumeratorTable.jsx`
9. Charts — Chart.js, all 5 charts
10. `RegionBreakdown.jsx` — progress bars per region
11. Polish — loading states, tooltips, responsive tweaks

Estimated time: 10-12 hours for full working demo.

---

## Install Commands

```bash
npm create vite@latest census-dashboard -- --template react
cd census-dashboard
npm install
npm install chart.js react-chartjs-2
npm install react-router-dom
```

No other dependencies needed.
