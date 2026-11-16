import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>

      <p className="mt-3 text-slate-600">Page not found.</p>

      <Link to="/" className="mt-5 text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  )
}

export default NotFound