import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../services/auth'
import AuthModal from './AuthModal'
import { LogIn } from 'lucide-react'

function RequireAuth({ children }) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(null) // null = loading
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      const loggedIn = !!session
      setIsLoggedIn(loggedIn)
      if (!loggedIn) {
        setShowAuth(true)
      }
    })
  }, [])

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sign In Required</h2>
          <p className="text-sm text-slate-500 mt-1">
            You need to sign in to access your career path and track your progress.
          </p>
        </div>
        <button
          onClick={() => setShowAuth(true)}
          className="px-5 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Sign In
        </button>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setIsLoggedIn(true)
            setShowAuth(false)
          }}
        />
      </div>
    )
  }

  return children
}

export default RequireAuth
