export default function Badge({ children, color = 'blue', count }) {
  return (
    <span className={`badge badge-${color}`}>
      {children || count}
    </span>
  )
}
