import { Link, useLocation } from 'react-router-dom'
import { Compass, Menu, X, Github, Twitter, Linkedin, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { onAuthStateChange } from '../services/auth'
import { fetchSession, logoutUser, setUser } from '../store/slices/authSlice'
import AuthModal from './AuthModal'

function Layout({ children }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    dispatch(fetchSession())
    const unsubscribe = onAuthStateChange((session) => {
      dispatch(setUser(session?.user || null))
    })
    return () => unsubscribe()
  }, [dispatch])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/select-role', label: 'Careers' },
    { path: '/report', label: 'Report' },
    { path: '/checkin', label: 'Check-in' },
    { path: '/progress', label: 'Progress' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
          scrolled ? 'bg-white/95 border-slate-200 backdrop-blur-sm' : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight">
                CareerGPS
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                  <span className="text-xs text-slate-500 max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="ml-3 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <nav className="px-4 py-2 space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-slate-100 mt-2">
                  {user ? (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-slate-600 truncate">{user.email}</span>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-slate-500 hover:text-slate-900 font-medium"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowAuth(true); setMobileMenuOpen(false) }}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
                <Compass className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm text-slate-900">CareerGPS</span>
            </div>
            <p className="text-xs text-slate-400">
              Evidence-based career navigation
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    </div>
  )
}

export default Layout
