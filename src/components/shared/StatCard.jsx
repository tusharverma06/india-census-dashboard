export default function StatCard({ icon, value, label, delta, title, subtitle }) {
  return (
    <div className="stat-card">
      <div className="value">{value}</div>
      <div className="label">{title || label}</div>
      {(subtitle || delta) && <div className="delta">{subtitle || delta}</div>}
    </div>
  )
}
