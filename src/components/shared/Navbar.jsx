export default function Navbar({ user, role }) {
  const handleLogout = () => {
    window.location.href = '/'
  }

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <span>🏛️</span>
        <span>Census Dashboard 2024</span>
      </div>
      
      <div className="navbar-right">
        {user && (
          <>
            <div className="navbar-user">
              <span>{user.name}</span>
              {user.region && <span className="badge badge-blue">{user.region}</span>}
              <span className="badge badge-purple">{user.id}</span>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}
