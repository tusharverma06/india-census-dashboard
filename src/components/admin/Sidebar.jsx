export default function Sidebar({ activeView, onViewChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'districts', label: 'Districts' },
    { id: 'anomalies', label: 'Anomaly Detection' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'revisit-queue', label: 'Revisit Queue' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Census Admin</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <small>Census Data 2011</small>
        </div>
      </div>
    </div>
  )
}
