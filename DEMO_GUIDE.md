# Census Dashboard - Demo Guide

## Quick Start

```bash
npm install
npm run dev
```

Then open: http://localhost:5173

## Demo Flow for Judges

### 1. Login as Admin (ADM001, PIN: 0000)

Show the admin dashboard features:

- **Top Stats Bar**: 50 households surveyed, 10% coverage, anomalies detected
- **India Coverage Map**: Color-coded states (red/orange/yellow/green based on coverage)
- **Region Breakdown**: Progress bars showing Delhi-North at 10.4%, Mumbai-West at 10.4%, etc.
- **Anomaly Panel**: Shows 3 detected anomalies:
  - Invalid age (150 years)
  - Child as head of household (age 15)
  - Member count mismatch
- **Enumerator Table**: Performance of all 4 officers
- **Charts Section**: 5 visualizations
  - Age distribution bar chart
  - Gender ratio donut chart
  - Progress timeline line chart
  - Income distribution horizontal bar
  - Amenities radar chart

### 2. Logout and Login as Officer (OFF001, PIN: 1234)

Show the officer features:

- **Personal Stats**: Submissions today, this week, completion rate, assigned region
- **New Household Entry Button**: Click to start form
- **Multi-step Form**:
  - Step 1: Address details (house number, street, ward, district, state, pincode)
  - Step 2: Add household members (name, age, gender, relation, education, occupation, etc.)
    - Demonstrate adding multiple members
    - Show remove member functionality
  - Step 3: Household amenities (income, house type, rooms, toilet, electricity, LPG, internet)
  - Step 4: Review all data before submitting

- **Submit Form**: Creates new household entry
- **Recent Submissions Table**: Shows all officer's past submissions

### 3. Test Anomaly Detection

Create a household with intentional errors:

- Add a member with age 200
- Make a 10-year-old the head of household
- Set total members to 5 but only add 3 members

On submit, a warning modal appears showing all detected issues. Officer can override and submit anyway.

### 4. Return to Admin Dashboard

Show that new anomalies appear in the Anomaly Panel immediately (in real demo, would need to refresh or implement WebSocket).

## Technical Highlights to Mention

### DSA Implementations

1. **HashMap (O(1) lookup)**:
   - Located in: `src/utils/anomalyDetector.js`
   - Usage: Duplicate address detection, Aadhar number collision detection
   - Lines: 8-13 (HashMap initialization), 15-24 (duplicate checking)

2. **BFS Graph Traversal**:
   - Located in: `src/utils/bfsTraversal.js`
   - Usage: Coverage spread analysis across region adjacency graph
   - Lines: 4-27 (BFS implementation)
   - Use case: Finding isolated low-coverage regions surrounded by high-coverage neighbors

3. **Priority Queue (Max-Heap)**:
   - Located in: `src/utils/revisitQueue.js`
   - Usage: Scheduling revisits based on urgency score
   - Lines: 4-65 (complete heap implementation with bubble-up and sink-down)
   - Urgency formula: `anomalies * 3 + (100 - coverage%) + daysSince * 2`

### Architecture Highlights

- **No Backend Required**: Uses JSON file as database (perfect for hackathon)
- **Dual-Role System**: Officer and Admin have completely different UIs
- **Multi-step Form**: Improves UX for field officers with complex data entry
- **Real-time Validation**: Pre-validation before submission with override capability
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Production-Ready CSS**: Clean design system with CSS variables
- **Chart.js Integration**: 5 different chart types for comprehensive analytics

### Code Quality

- Clean component architecture
- Reusable shared components
- Separation of concerns (data, utils, components)
- No prop drilling (could add Context if needed)
- Proper React hooks usage
- Optimized bundle size (127 KB gzipped)

## File Count

- **Total Components**: 16 JSX files
- **Utilities**: 3 DSA algorithm files
- **Data Files**: 3 (auth, regions, households.json with 50 entries)
- **Lines of Code**: ~2,500 (excluding data)

## Mock Data

- 50 pre-populated households
- 4 regions with realistic distribution
- 3 intentional anomalies for demo
- Diverse data (ages, genders, incomes, amenities)

## Build Stats

```
vite build
✓ 53 modules transformed
dist/index.html                   0.48 kB
dist/assets/index-*.css          7.95 kB │ gzip: 2.18 kB
dist/assets/index-*.js         434.03 kB │ gzip: 127.60 kB
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Future Enhancements (if asked)

- WebSocket for real-time updates
- Backend API with PostgreSQL
- Mobile app with offline sync
- Geolocation integration
- Photo upload for verification
- Multi-language support (Hindi, Tamil, Bengali, etc.)
- Advanced analytics with ML-based fraud detection
