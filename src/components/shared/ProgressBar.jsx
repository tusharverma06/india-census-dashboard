export default function ProgressBar({ value, max, color }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const getColor = () => {
    if (color) return color
    if (percentage >= 80) return '#16a34a'
    if (percentage >= 50) return '#ca8a04'
    if (percentage >= 20) return '#ea580c'
    return '#dc2626'
  }

  return (
    <div className="progress-bar">
      <div 
        className="progress-bar-fill" 
        style={{ width: percentage + '%', backgroundColor: getColor() }}
      />
    </div>
  )
}
