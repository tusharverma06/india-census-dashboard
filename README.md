# Real-Time Census Integrity Dashboard

A dual-role web application for India's census data collection and monitoring system built for hackathon demonstration.

## Features

### Officer Role
- Multi-step household data entry form (4 steps)
- Address, members, household amenities collection
- Form validation with anomaly detection
- Personal statistics and submission tracking

### Admin Role
- Live statistics dashboard
- India coverage map with color-coded states
- Anomaly detection panel (12+ anomaly types)
- Enumerator performance tracking
- 5 Chart.js visualizations:
  - Age distribution (bar chart)
  - Gender ratio (donut chart)
  - Survey progress timeline (line chart)
  - Income distribution (horizontal bar)
  - Amenities coverage (radar chart)

## Data Structures & Algorithms

1. **HashMap (anomalyDetector.js)**: O(1) duplicate detection for addresses and Aadhar numbers
2. **BFS Graph Traversal (bfsTraversal.js)**: Coverage spread analysis across region adjacency graph
3. **Max-Heap Priority Queue (revisitQueue.js)**: Urgency-based revisit scheduling

## Tech Stack

- React 18 + Vite
- Chart.js + react-chartjs-2
- Pure CSS (light mode design system)
- JSON file-based local database

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Credentials

**Officers:**
- OFF001 (PIN: 1234) - Delhi-North
- OFF002 (PIN: 2345) - Mumbai-West
- OFF003 (PIN: 3456) - Chennai-South
- OFF004 (PIN: 4567) - Kolkata-East

**Admin:**
- ADM001 (PIN: 0000)

## Project Structure

```
src/
├── components/
│   ├── auth/         # LoginPage
│   ├── officer/      # OfficerDashboard, HouseholdForm
│   ├── admin/        # AdminDashboard, Charts, Maps, Tables
│   └── shared/       # Navbar, StatCard, Badge, ProgressBar
├── data/
│   ├── households.json    # 50 pre-populated households with anomalies
│   ├── auth.js           # User credentials
│   └── indiaRegions.js   # Region graph for BFS
├── utils/
│   ├── anomalyDetector.js  # HashMap duplicate detection
│   ├── bfsTraversal.js     # BFS coverage spread
│   └── revisitQueue.js     # Priority queue for scheduling
└── index.css              # Complete design system
```

## Build for Production

```bash
npm run build
npm run preview
```

## Key Highlights

- 50 pre-populated households with intentional anomalies for demo
- Real-time anomaly detection using HashMap
- Interactive India SVG map with coverage visualization
- Comprehensive enumerator performance metrics
- Multi-step form with validation
- Responsive design for mobile and desktop
