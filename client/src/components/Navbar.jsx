
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Blog Application
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/" className="text-slate-700 hover:text-blue-600">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.full_name} ({user.role})
              </span>

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="text-slate-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-700 hover:text-blue-600">
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
