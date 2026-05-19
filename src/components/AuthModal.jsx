import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react'
import { loginUser, registerUser, clearAuthError } from '../store/slices/authSlice'

function AuthModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.loading)
  const reduxError = useSelector((state) => state.auth.error)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const error = localError || reduxError

  const getFriendlyError = (msg) => {
    if (!msg) return ''
    const m = msg.toLowerCase()
    if (m.includes('rate limit') || m.includes('over_email_send_rate_limit')) {
      return 'Email rate limit reached. Please wait a few minutes and try again, or contact support.'
    }
    if (m.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.'
    }
    if (m.includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead.'
    }
    if (m.includes('password')) {
      return 'Password must be at least 6 characters long.'
    }
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    dispatch(clearAuthError())

    try {
      if (mode === 'login') {
        await dispatch(loginUser({ email, password })).unwrap()
      } else {
        await dispatch(registerUser({ email, password })).unwrap()
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      // Error is already in Redux state; localError is a fallback
      setLocalError(getFriendlyError(err))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="relative bg-slate-900 px-5 py-5 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/60 text-xs mt-1">
              {mode === 'login'
                ? 'Sign in to save your reports and track progress'
                : 'Join CareerGPS to get personalized career guidance'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{getFriendlyError(error)}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setLocalError(''); dispatch(clearAuthError()) }}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal
