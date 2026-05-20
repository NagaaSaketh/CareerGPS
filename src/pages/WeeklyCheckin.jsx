import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle,
  TrendingUp, Target, Activity, Send, MessageSquare,
  Zap, BookOpen, Briefcase, Flame, RotateCcw,
  Loader2, ChevronDown, History,
  AlertCircle, X, Trophy, BarChart3, Sparkles, ChevronRight,
  Search, MapPin, ExternalLink
} from 'lucide-react'
import TaskCard from '../components/TaskCard'
import AlertBox from '../components/AlertBox'
import { getRoleById, locationOptions } from '../data/roleConfig'
import { submitCheckin, getScrapedJobs, getCheckins, getProfile } from '../services/api'
import { getSession } from '../services/auth'
import AuthModal from '../components/AuthModal'

function formatLabel(str) {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const Toast = memo(function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -12, x: '-50%' }}
      className={`fixed top-4 left-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border text-sm font-medium ${
        type === 'error'
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
})

const NumberInput = memo(function NumberInput({ label, description, icon: Icon, value, onChange, color = 'slate' }) {
  const colorMap = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500' },
  }
  const c = colorMap[color]

  return (
    <div className={`p-4 rounded-lg border ${c.border} ${c.bg}`}>
      <label className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${c.icon}`} />
        {label}
        <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{description}</p>
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
        placeholder="Enter a number"
        required
      />
    </div>
  )
})

function getAvailableRoles() {
  const roles = new Set()
  const sessionRole = sessionStorage.getItem('selectedRole')
  if (sessionRole) roles.add(sessionRole)
  return Array.from(roles)
}


function computeTwelveWeekStats(checkinData) {
  const checkins = Object.values(checkinData || {})
  const weeks = checkins.map((c) => c.week).filter(Boolean).sort((a, b) => a - b)

  let totalApps = 0, totalResponses = 0, totalInterviews = 0
  let totalLearning = 0, totalProject = 0, totalPractice = 0
  const progressCounts = { breakthrough: 0, real_progress: 0, motion: 0, compliance: 0 }

  checkins.forEach((c) => {
    const ms = c.market_signals || {}
    totalApps += ms.applications_sent || 0
    totalResponses += ms.responses_received || 0
    totalInterviews += ms.interviews_attended || 0
    const th = c.task_hours || {}
    totalLearning += th.learning || 0
    totalProject += th.project || 0
    totalPractice += th.practice || 0

    const pt = c.progress_type
    if (pt && progressCounts[pt] !== undefined) progressCounts[pt]++
  })

  const dominantProgress = Object.entries(progressCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'motion'

  return {
    weeksCompleted: weeks.length,
    totalApps,
    totalResponses,
    totalInterviews,
    totalLearning,
    totalProject,
    totalPractice,
    dominantProgress,
    progressCounts,
    responseRate: totalApps > 0 ? ((totalResponses / totalApps) * 100).toFixed(1) : 0,
  }
}

function getCompletionAdvice(stats, role) {
  const roleName = role?.name || 'your target role'
  switch (stats.dominantProgress) {
    case 'breakthrough':
      return {
        title: 'Sprint to Offer',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        iconColor: 'text-emerald-600',
        description: `You maintained breakthrough-level output across ${stats.weeksCompleted} weeks. You shipped ${stats.totalProject} project tasks, applied to ${stats.totalApps} jobs, and attended ${stats.totalInterviews} interviews. The market is responding. Your next phase: convert interviews into offers. Focus on negotiation, offer comparison, and onboarding preparation.`,
        cta: 'Start Interview Sprint',
      }
    case 'real_progress':
      return {
        title: 'Push to Breakthrough',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        iconColor: 'text-blue-600',
        description: `You built consistently across ${stats.weeksCompleted} weeks with ${stats.totalProject} project tasks completed. You're making real progress but need more market testing. Increase applications to ${stats.totalApps + 20}+ and add one advanced portfolio piece.`,
        cta: 'Start Next 12-Week Cycle',
      }
    case 'motion':
      return {
        title: 'Break the Plateau',
        color: 'bg-amber-50 border-amber-200 text-amber-800',
        iconColor: 'text-amber-600',
        description: `You stayed active for ${stats.weeksCompleted} weeks but project output was inconsistent. You shipped ${stats.totalProject} tasks total. To break through, commit to shipping at least 2 project tasks every week for the next cycle. Reduce learning hours and increase building.`,
        cta: 'Start Disciplined Cycle',
      }
    case 'compliance':
      return {
        title: 'Reassess Your Path',
        color: 'bg-red-50 border-red-200 text-red-800',
        iconColor: 'text-red-600',
        description: `Your 12-week pattern shows heavy learning (${stats.totalLearning} hours) but minimal building (${stats.totalProject} tasks). This is the #1 trap. Consider a stepping-stone role that has a lower barrier to entry and builds transferable skills toward ${roleName}.`,
        cta: 'Explore Stepping-Stone Roles',
      }
    default:
      return {
        title: 'Keep Building',
        color: 'bg-slate-50 border-slate-200 text-slate-800',
        iconColor: 'text-slate-600',
        description: 'Continue your current plan with more focus on shipping projects.',
        cta: 'Start Next 12-Week Cycle',
      }
  }
}

function CompletionScreen({ role, activeRole, checkinData, onBack, onStartNewCycle, onExploreRoles, onViewDashboard }) {
  const stats = computeTwelveWeekStats(checkinData)
  const advice = getCompletionAdvice(stats, role)

  const accentColor = {
    breakthrough: 'border-emerald-400',
    real_progress: 'border-blue-400',
    motion: 'border-amber-400',
    compliance: 'border-red-400',
  }[stats.dominantProgress] || 'border-slate-300'

  const weekBreakdown = [
    { key: 'breakthrough', label: 'Breakthrough', color: 'bg-emerald-500' },
    { key: 'real_progress', label: 'Real Progress', color: 'bg-blue-500' },
    { key: 'motion', label: 'Motion', color: 'bg-amber-500' },
    { key: 'compliance', label: 'Compliance', color: 'bg-red-500' },
  ].filter((b) => stats.progressCounts[b.key] > 0)

  return (
    <motion.div
      key="completion"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        className="text-center py-2"
      >
        <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">12-Week Milestone</h2>
        <p className="text-sm text-slate-500 mt-1">
          {role?.name || 'Your role'} · {stats.weeksCompleted} weeks tracked
        </p>
      </motion.div>

      {/* Week Breakdown Bar */}
      {weekBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Week Breakdown</h3>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            {weekBreakdown.map((b) => (
              <motion.div
                key={b.key}
                initial={{ width: 0 }}
                animate={{ width: `${(stats.progressCounts[b.key] / stats.weeksCompleted) * 100}%` }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className={`${b.color} h-full`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {weekBreakdown.map((b) => (
              <div key={b.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${b.color}`} />
                <span className="text-xs text-slate-600">
                  {b.label} <span className="font-semibold text-slate-900">{stats.progressCounts[b.key]}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Market Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-5"
      >
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Market Performance</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Applications', value: stats.totalApps },
            { label: 'Responses', value: stats.totalResponses },
            { label: 'Interviews', value: stats.totalInterviews },
            { label: 'Response Rate', value: `${stats.responseRate}%` },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Work Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-5"
      >
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Work Output</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Project Tasks', value: stats.totalProject },
            { label: 'Learning Hours', value: stats.totalLearning },
            { label: 'Practice Hours', value: stats.totalPractice },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Adaptive Advice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-white rounded-lg border-l-4 ${accentColor} shadow-sm p-5`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className={`w-4 h-4 ${advice.iconColor}`} />
          <h3 className="text-sm font-bold text-slate-900">{advice.title}</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{advice.description}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-2.5"
      >
        <button
          onClick={onStartNewCycle}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
        >
          {advice.cta}
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={onViewDashboard}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button
            onClick={onExploreRoles}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
          >
            <Target className="w-4 h-4 mr-2" />
            Explore Roles
          </button>
        </div>
        <button
          onClick={onBack}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
        >
          Back to Week 12 Results
        </button>
      </motion.div>
    </motion.div>
  )
}

function WeeklyCheckin() {
  const navigate = useNavigate()
  const [activeRole, setActiveRole] = useState(() =>
    sessionStorage.getItem('selectedRole') || ''
  )
  const role = getRoleById(activeRole)

  const [week, setWeek] = useState(1)
  const [tasks, setTasks] = useState({
    learning: '',
    project: '',
    practice: '',
  })
  const [marketSignals, setMarketSignals] = useState({
    applications: '',
    responses: '',
    interviews: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backendConnected, setBackendConnected] = useState(false)
  const [backendReport, setBackendReport] = useState(null)
  const [savedWeeks, setSavedWeeks] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [toast, setToast] = useState(null)
  const [showCompletion, setShowCompletion] = useState(false)
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsNote, setJobsNote] = useState('')
  const [showJobs, setShowJobs] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [profile, setProfile] = useState(null)

  const availableRoles = getAvailableRoles()

  // Check auth on mount and load profile
  useEffect(() => {
    getSession().then((session) => {
      setIsLoggedIn(!!session)
    })
    async function loadProfile() {
      try {
        const p = await getProfile()
        if (p) setProfile(p)
      } catch (err) {
        console.warn('Failed to load profile:', err)
      }
    }
    loadProfile()
  }, [])

  // Redirect if no role selected
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedRole')
    if (!stored) {
      navigate('/select-role')
    }
  }, [navigate])

  // Load check-ins from Supabase on mount / role change
  const [cycle, setCycle] = useState(1)
  // allCyclesData: { [cycleNum]: { [week]: checkinData } }
  const [allCyclesData, setAllCyclesData] = useState({})
  const [checkinData, setCheckinData] = useState({})

  const reloadCheckins = async ({ resetWeek = false } = {}) => {
    if (!activeRole) return
    try {
      const result = await getCheckins(activeRole)
      const allData = {}
      for (const c of result.checkins || []) {
        const cNum = c.cycle || 1
        if (!allData[cNum]) allData[cNum] = {}
        allData[cNum][c.week] = {
          ...c,
          task_hours: c.task_hours || {
            learning: c.learning_hours || 0,
            project: c.project_hours || 0,
            practice: c.practice_hours || 0,
          },
          market_signals: c.market_signals || {
            applications_sent: c.applications_sent || 0,
            responses_received: c.responses_received || 0,
            interviews_attended: c.interviews_attended || 0,
          },
        }
      }
      setAllCyclesData(allData)

      // If Progress page told us exactly where to land, honour it (and clear the hint)
      const targetCycleStr = sessionStorage.getItem('continueCycle')
      const targetWeekStr = sessionStorage.getItem('continueWeek')
      if (targetCycleStr && targetWeekStr) {
        sessionStorage.removeItem('continueCycle')
        sessionStorage.removeItem('continueWeek')
        const targetCycle = Number(targetCycleStr)
        const targetWeek = Number(targetWeekStr)
        setCycle(targetCycle)
        setCheckinData(allData[targetCycle] || {})
        setSavedWeeks(Object.keys(allData[targetCycle] || {}).map(Number).sort((a, b) => a - b))
        setWeek(targetWeek)
        setShowResults(false)
        return
      }

      const maxCycle = Math.max(...Object.keys(allData).map(Number), 1)
      const cycleWeeks = Object.keys(allData[maxCycle] || {}).map(Number).sort((a, b) => a - b)
      setCycle(maxCycle)
      setCheckinData(allData[maxCycle] || {})
      setSavedWeeks(cycleWeeks)

      // On first load (not a post-submit refresh), jump to the next incomplete week
      if (resetWeek) {
        const completedMax = cycleWeeks.length > 0 ? cycleWeeks[cycleWeeks.length - 1] : 0
        const nextWeek = completedMax >= 12 ? 12 : completedMax + 1
        setWeek(nextWeek)
        // If landing on a completed week, show its results; otherwise show blank form
        if (!allData[maxCycle]?.[nextWeek]) {
          setShowResults(false)
        }
      }
    } catch (err) {
      console.warn('Failed to load check-ins:', err)
    }
  }

  useEffect(() => {
    reloadCheckins({ resetWeek: true })
  }, [activeRole])

  // Load data when week or role changes
  useEffect(() => {
    const weekData = checkinData[week]
    if (weekData) {
      const th = weekData.task_hours || {}
      setTasks({
        learning: th.learning || '',
        project: th.project || '',
        practice: th.practice || '',
      })
      const ms = weekData.market_signals || {}
      setMarketSignals({
        applications: ms.applications_sent || '',
        responses: ms.responses_received || '',
        interviews: ms.interviews_attended || '',
      })
      setBackendReport({
        progress_type: weekData.progress_type,
        recommendation: weekData.recommendation,
        red_flags: weekData.red_flags,
        next_tasks: weekData.next_tasks,
      })
      setBackendConnected(true)
      setShowResults(true)
    } else {
      setTasks({ learning: '', project: '', practice: '' })
      setMarketSignals({ applications: '', responses: '', interviews: '' })
      setBackendReport(null)
      setBackendConnected(false)
      setShowResults(false)
    }
    setShowCompletion(false)
  }, [week, activeRole, checkinData])

  const switchRole = (roleId) => {
    setActiveRole(roleId)
    sessionStorage.setItem('selectedRole', roleId)
    setWeek(1)
    setShowResults(false)
    setShowCompletion(false)
  }

  const fetchJobs = async () => {
    if (!activeRole) return
    setJobsLoading(true)
    setJobsNote('Fetching jobs for this role...')
    setShowJobs(true)

    const userLoc = profile?.location || 'India'
    const locLabel = locationOptions.find((l) => l.value === userLoc)?.label || userLoc
    let location = locLabel

    const fetched = []
    try {
      const result = await getScrapedJobs(activeRole, location, 5, true)
      if (result.jobs) {
        result.jobs.forEach((j) => {
          if (!fetched.find((e) => e.url === j.url)) {
            fetched.push(j)
          }
        })
      }
      if (result.note) setJobsNote(result.note)
      else if (fetched.length === 0) setJobsNote('No jobs found. Try again later.')
      else setJobsNote('')
    } catch (err) {
      setJobsNote('Failed to fetch jobs. Please try again.')
    } finally {
      setJobs(fetched)
      setJobsLoading(false)
    }
  }

  const saveWeekData = (weekNum) => {
    // Week data is persisted via submitCheckin to Supabase.
    // This function now just refreshes the saved weeks list from server state.
    setSavedWeeks((prev) => {
      const next = new Set(prev)
      next.add(weekNum)
      return Array.from(next).sort((a, b) => a - b)
    })
  }

  const validateInputs = () => {
    const empty = []
    if (!tasks.learning || tasks.learning === '') empty.push('Learning Hours')
    if (!tasks.project || tasks.project === '') empty.push('Project Tasks')
    if (!tasks.practice || tasks.practice === '') empty.push('Practice Hours')
    if (!marketSignals.applications || marketSignals.applications === '') empty.push('Applications Submitted')
    if (!marketSignals.responses || marketSignals.responses === '') empty.push('Responses Received')
    if (!marketSignals.interviews || marketSignals.interviews === '') empty.push('Interviews Attended')

    if (empty.length > 0) {
      setToast({
        type: 'error',
        message: `Please fill in all fields. Missing: ${empty.join(', ')}`
      })
      return false
    }
    return true
  }

  const analyzeWeek = async () => {
    if (!validateInputs()) return

    if (!isLoggedIn) {
      setShowAuth(true)
      return
    }
    setLoading(true)
    try {
      const tasksCompleted = []
      if (parseInt(tasks.learning) > 0) tasksCompleted.push('learning')
      if (parseInt(tasks.project) > 0) tasksCompleted.push('project')
      if (parseInt(tasks.practice) > 0) tasksCompleted.push('practice')
      if (parseInt(marketSignals.applications) > 0) tasksCompleted.push('application')

      const result = await submitCheckin(
        week,
        tasksCompleted,
        {
          applications: parseInt(marketSignals.applications) || 0,
          responses: parseInt(marketSignals.responses) || 0,
          interviews: parseInt(marketSignals.interviews) || 0,
        },
        activeRole,
        {
          learning: parseInt(tasks.learning) || 0,
          project: parseInt(tasks.project) || 0,
          practice: parseInt(tasks.practice) || 0,
        },
        cycle
      )
      setBackendReport(result)
      setBackendConnected(true)
      setShowResults(true)
      saveWeekData(week)
      setToast({ type: 'success', message: 'Week analysis saved successfully' })
      // Refresh from server so trend analysis has latest data
      await reloadCheckins()
    } catch (err) {
      if (err.status === 401 || err.message === 'UNAUTHORIZED') {
        setShowAuth(true)
        setIsLoggedIn(false)
      } else {
        const msg = err.message || 'Failed to save check-in. Please try again.'
        setToast({ type: 'error', message: msg })
      }
      setBackendConnected(false)
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  // --- Load previous weeks for trend analysis ---
  const loadPreviousWeeks = () => {
    const weeks = Object.keys(checkinData).map(Number).sort((a, b) => a - b)
    return weeks.filter((w) => w < week).map((w) => {
      const c = checkinData[w] || {}
      const th = c.task_hours || {}
      const ms = c.market_signals || {}
      return {
        week: w,
        tasks: { learning: th.learning, project: th.project, practice: th.practice },
        marketSignals: {
          applications: ms.applications_sent,
          responses: ms.responses_received,
          interviews: ms.interviews_attended,
        },
        report: {
          progress_type: c.progress_type,
          recommendation: c.recommendation,
          red_flags: c.red_flags,
        },
      }
    })
  }

  const previousWeeks = loadPreviousWeeks()
  const prev3 = previousWeeks.slice(-3)

  const t = {
    learning: parseInt(tasks.learning) || 0,
    project: parseInt(tasks.project) || 0,
    practice: parseInt(tasks.practice) || 0,
    application: parseInt(tasks.application) || 0,
  }
  const ms = {
    applications: parseInt(marketSignals.applications) || 0,
    responses: parseInt(marketSignals.responses) || 0,
    interviews: parseInt(marketSignals.interviews) || 0,
  }
  const totalHours = t.learning + t.project + t.practice + ms.applications

  // Trend computations
  const prevLearning = prev3.reduce((sum, w) => sum + (parseInt(w.tasks?.learning) || 0), 0)
  const prevProject = prev3.reduce((sum, w) => sum + (parseInt(w.tasks?.project) || 0), 0)
  const prevApps = prev3.reduce((sum, w) => sum + (parseInt(w.marketSignals?.applications) || 0), 0)
  const prevResponses = prev3.reduce((sum, w) => sum + (parseInt(w.marketSignals?.responses) || 0), 0)
  const prevInterviews = prev3.reduce((sum, w) => sum + (parseInt(w.marketSignals?.interviews) || 0), 0)
  const weeksOfData = previousWeeks.length + 1
  const avgPrevProject = prev3.length > 0 ? prevProject / prev3.length : 0
  const complianceStreak = prev3.filter(
    (w) => (parseInt(w.tasks?.learning) || 0) > 0 && (parseInt(w.tasks?.project) || 0) === 0 && (parseInt(w.tasks?.practice) || 0) === 0
  ).length

  let progressType = 'motion'
  let progressLabel = 'Motion'
  let progressMessage = 'You are active but not building or applying enough.'
  let progressColor = 'bg-amber-50 border-amber-200 text-amber-800'
  let progressIcon = Activity
  let redFlags = []
  let nextTasks = []

  if (backendConnected && backendReport) {
    progressType = backendReport.progress_type || 'motion'
    progressLabel = {
      compliance: 'Compliance',
      motion: 'Motion',
      real_progress: 'Real Progress',
      breakthrough: 'Breakthrough',
    }[progressType] || 'Motion'
    progressMessage = backendReport.recommendation || progressMessage
    progressColor = {
      compliance: 'bg-red-50 border-red-200 text-red-800',
      motion: 'bg-amber-50 border-amber-200 text-amber-800',
      real_progress: 'bg-blue-50 border-blue-200 text-blue-800',
      breakthrough: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    }[progressType] || 'bg-amber-50 border-amber-200 text-amber-800'
    progressIcon = {
      compliance: BookOpen,
      motion: Activity,
      real_progress: Zap,
      breakthrough: Flame,
    }[progressType] || Activity
    redFlags = backendReport.red_flags || []
    // All 3 tasks are now Claude-generated on the backend — display as-is
    nextTasks = (backendReport.next_tasks || []).map((t) => ({
      number: t.number,
      title: t.title,
      description: t.description,
      expected: t.expected,
    }))
  } else {
    // Local fallback: trend-aware, input-driven, role-specific
    const hasProject = t.project >= 1
    const hasPractice = t.practice >= 1
    const hasApplication = ms.applications >= 1
    const onlyLearning = totalHours > 0 && t.project === 0 && t.practice === 0 && ms.applications === 0
    const heavyLearning = t.learning >= 3

    const paragraphs = []

    if (onlyLearning || (heavyLearning && t.project === 0)) {
      progressType = 'compliance'
      progressLabel = 'Compliance'
      progressColor = 'bg-red-50 border-red-200 text-red-800'
      progressIcon = BookOpen
      if (complianceStreak >= 2) {
        paragraphs.push(
          `Your inputs this week show a learning-heavy pattern. You spent ${t.learning} hours learning and shipped ${t.project} project tasks. For ${weeksOfData} consecutive weeks, project work has been at zero. This is the most common trap that stalls progress. Shift your focus from consuming content to building something tangible.`
        )
      } else {
        paragraphs.push(
          `Your week was weighted toward learning. You spent ${t.learning} hours on tutorials and courses but shipped ${t.project} project tasks. Knowledge without application does not show up in interviews. Dedicate at least half your time to building this week.`
        )
      }
    } else if (t.project >= 2 && hasApplication) {
      progressType = 'breakthrough'
      progressLabel = 'Breakthrough'
      progressColor = 'bg-emerald-50 border-emerald-200 text-emerald-800'
      progressIcon = Flame
      const trend = t.project > avgPrevProject ? ` Your project output is up from your ${avgPrevProject.toFixed(1)} weekly average.` : ''
      let p = `Excellent week. You shipped ${t.project} project tasks, practiced for ${t.practice} hours, and applied to ${ms.applications} jobs.${trend} This is the combination that produces results.`
      if (ms.responses > 0) {
        p += ` You received ${ms.responses} responses. The market is validating your work.`
      }
      paragraphs.push(p)
      paragraphs.push("Do not break this streak. Protect your project time above all else.")
    } else if (t.project >= 2 || (t.practice >= 2 && hasApplication)) {
      progressType = 'real_progress'
      progressLabel = 'Real Progress'
      progressColor = 'bg-blue-50 border-blue-200 text-blue-800'
      progressIcon = Zap
      const trend = t.project > avgPrevProject ? ` Your project output is up from your ${avgPrevProject.toFixed(1)} weekly average.` : ''
      let p
      if (ms.applications === 0) {
        // Good project output but no market testing yet
        p = `Good building week. You shipped ${t.project} project tasks.${trend} Your portfolio is growing — now start testing the market. Send at least 3 applications this week to turn this into real progress.`
      } else {
        p = `Strong week. You shipped ${t.project} project tasks and applied to ${ms.applications} jobs.${trend} You are building skills and testing the market in parallel.`
        if (ms.responses === 0) {
          p += " You are applying but not hearing back yet. Keep the volume up and track which roles respond."
        } else {
          p += " Consistency beats intensity. Maintain this cadence."
        }
      }
      paragraphs.push(p)
    } else {
      progressType = 'motion'
      progressLabel = 'Motion'
      progressColor = 'bg-amber-50 border-amber-200 text-amber-800'
      progressIcon = Activity
      let p = `You stayed active this week with ${t.learning} learning hours, ${t.project} project tasks, ${t.practice} practice hours, and ${ms.applications} applications.`
      if (t.project === 0) {
        p += " However, you shipped zero project tasks. Employers need to see what you have built. Pick one feature and ship it."
      } else if (ms.applications === 0) {
        p += " However, you did not apply to any jobs. Building without market testing is guesswork. Send at least 3 applications this week."
      } else {
        p += " To break into real progress, increase your project output to at least 2 tasks per week."
      }
      paragraphs.push(p)
    }

    // Application trend analysis
    const totalApps = ms.applications + prevApps
    const totalResponses = ms.responses + prevResponses
    if (totalApps >= 15 && totalResponses === 0 && ms.applications > 0) {
      redFlags = ['application_black_hole']
      paragraphs.push(
        `Your application pipeline needs attention. You have sent ${totalApps} total applications with zero responses. This signals a resume or portfolio issue, not a volume problem. Stop applying and fix your profile first.`
      )
    } else if (ms.applications >= 5 && ms.responses === 0) {
      redFlags = ['application_stall']
      paragraphs.push(
        `No responses from ${ms.applications} applications this week. If this trend continues, your resume or portfolio is the bottleneck. Get feedback before sending more.`
      )
    } else if (ms.responses > 0) {
      const rate = ((ms.responses / ms.applications) * 100).toFixed(1)
      paragraphs.push(`Response rate this week: ${rate}% (${ms.responses}/${ms.applications}).`)
    }

    // Interview trend
    if (ms.interviews > 0) {
      const totalInt = ms.interviews + prevInterviews
      paragraphs.push(
        `You attended ${ms.interviews} interview(s) this week, ${totalInt} total. Focus on converting these into offers by reviewing your performance after each one.`
      )
    } else if (prevInterviews >= 3 && ms.interviews === 0) {
      paragraphs.push(
        "You had interviews in previous weeks but none scheduled this week. Keep your pipeline full while you prepare for the rounds you have."
      )
    }

    // Compliance streak
    if (onlyLearning && complianceStreak >= 2) {
      redFlags = [...redFlags, 'compliance_loop']
    }

    // Low activity
    if (totalHours < 3 && weeksOfData >= 2) {
      redFlags = [...redFlags, 'low_activity']
      paragraphs.push(
        `Low activity detected: only ${totalHours} hours this week. Commit to at least 10 focused hours next week.`
      )
    }

    progressMessage = paragraphs.join('\n\n')

    // Generate adaptive next tasks using 6-week theme cycle + adaptive tasks 2 & 3
    const nextWeek = week + 1
    const roleSkills = role?.skills || ['core skill', 'problem solving']

    if (progressType === 'compliance' || complianceStreak >= 2) {
      nextTasks = [
        { number: 1, title: `Ship one ${formatLabel(roleSkills[0])} feature`, description: 'Build and commit working code. No tutorials.', expected: 'Code committed to GitHub with README' },
        { number: 2, title: 'Apply to 3 roles', description: 'Reference your project in each application.', expected: '3 applications with project links' },
        { number: 3, title: 'Request a code review', description: 'Ask an industry professional to review your work. Document feedback.', expected: 'Actionable feedback documented' }
      ]
    } else if (redFlags.includes('application_black_hole')) {
      nextTasks = [
        { number: 1, title: 'Fix top 3 GitHub issues', description: 'Focus on README, tests, error handling, and deployment.', expected: 'Repo polished and professional' },
        { number: 2, title: 'Tailor resume to 5 JDs', description: `Align your resume with keywords from real ${role?.name || 'target'} job descriptions.`, expected: 'Resume updated with JD-matched keywords' },
        { number: 3, title: 'Complete 1 mock interview', description: 'Record the session and identify two improvement areas.', expected: 'Recording reviewed, improvement plan made' }
      ]
    } else {
      // Local fallback (no backend): role-specific, week/cycle-aware templates
      const skillA = roleSkills[0] || 'core skill'
      const skillB = roleSkills[1] || skillA
      const skillC = roleSkills[2] || skillB
      const roleName = role?.name || 'target role'
      const complexity = cycle === 1 ? 'working' : 'production-grade'

      // Task 1: role-specific build task
      nextTasks = [{
        number: 1,
        title: `Build a ${complexity} ${formatLabel(skillA)} feature`,
        description: `Implement a ${complexity} ${formatLabel(skillA)} feature for your ${roleName} portfolio. Commit incrementally with clear commit messages.`,
        expected: `${formatLabel(skillA)} feature committed to GitHub with README update`,
      }]

      // Task 2: market signal task
      if (ms.interviews > 0) {
        nextTasks.push({ number: 2, title: `Practice ${formatLabel(skillA)} interview questions`, description: `Focus on ${roleName}-specific ${formatLabel(skillA)} questions. Target areas where you felt least confident.`, expected: '5 questions answered with timed responses' })
      } else if (ms.applications >= 10 && ms.responses === 0) {
        nextTasks.push({ number: 2, title: `Audit your ${roleName} profile`, description: `Have your resume and GitHub reviewed by two professionals with ${roleName} experience. Implement the top feedback.`, expected: 'Top 5 resume and GitHub improvements implemented' })
      } else if (ms.applications === 0) {
        nextTasks.push({ number: 2, title: `Apply to 5 ${roleName} roles`, description: `Send 5 applications to ${roleName} positions on LinkedIn and Naukri. Reference your ${formatLabel(skillB)} project in each.`, expected: `5 ${roleName} applications sent with project links` })
      } else {
        nextTasks.push({ number: 2, title: `Apply to 3–5 ${roleName} roles`, description: `Send 3–5 ${roleName} applications with personalized cover notes highlighting your ${formatLabel(skillB)} work.`, expected: 'Applications sent with role-specific cover notes' })
      }

      // Task 3: learning/practice task
      const depth = cycle === 1 ? 'foundational' : 'advanced'
      nextTasks.push({ number: 3, title: `Study ${formatLabel(skillC)} ${depth} concepts`, description: `Spend 2 hours on ${formatLabel(skillC)} ${depth} concepts using official docs. Build one practical ${roleName} example immediately after.`, expected: `Notes taken, one working ${formatLabel(skillC)} example committed` })
    }
  }

  const responseRate = ms.applications > 0
    ? (ms.responses / ms.applications * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/report')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report
        </button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w} {savedWeeks.includes(w) ? '✓' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={fetchJobs}
            disabled={jobsLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Find jobs for this role"
          >
            {jobsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Search className="w-3 h-3" />
            )}
            Search Jobs
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Check-in</h1>
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
            <Target className="w-3 h-3" />
            {role?.name || formatLabel(activeRole)}
          </span>
        </div>
        <p className="text-sm text-slate-500">Track your progress. Distinguish motion from real progress.</p>

        {/* Cycle switcher */}
        {Object.keys(allCyclesData).length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-slate-400">Cycle:</span>
            {Object.keys(allCyclesData).map(Number).sort((a, b) => a - b).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCycle(c)
                  setCheckinData(allCyclesData[c] || {})
                  setSavedWeeks(Object.keys(allCyclesData[c] || {}).map(Number).sort((a, b) => a - b))
                  setWeek(1)
                  setShowResults(false)
                }}
                className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                  c === cycle
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                C{c}
              </button>
            ))}
          </div>
        )}

        {/* Week pills for current cycle */}
        {savedWeeks.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Completed:</span>
            {savedWeeks.map((w) => (
              <button
                key={w}
                onClick={() => setWeek(w)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  w === week
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                W{w}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <AnimatePresence>
        {showJobs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  {role?.name || formatLabel(activeRole)} Jobs
                </h3>
                <button
                  onClick={() => setShowJobs(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {jobsNote && (
                <p className="text-xs text-slate-500">{jobsNote}</p>
              )}
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-500 ml-2">Loading jobs...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-6">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No jobs found.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={job.url || i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-slate-900 text-sm truncate">{job.title || 'Untitled Position'}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {[job.company, job.location].filter(Boolean).join(' • ') || 'Company not listed'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {job.salary_lpa && (
                              <span className="text-xs text-emerald-700 font-medium">
                                ₹{job.salary_lpa[0]}–{job.salary_lpa[1]} LPA
                              </span>
                            )}
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              {job.source || 'job board'}
                            </span>
                          </div>
                        </div>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Task Inputs */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
                What did you complete this week?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  label="Learning Hours"
                  description="Hours spent on tutorials, videos, documentation, or courses."
                  icon={BookOpen}
                  color="amber"
                  value={tasks.learning}
                  onChange={(v) => setTasks({ ...tasks, learning: v })}
                />
                <NumberInput
                  label="Practice Hours"
                  description="Hours spent on coding problems, exercises, or LeetCode/HackerRank."
                  icon={Zap}
                  color="blue"
                  value={tasks.practice}
                  onChange={(v) => setTasks({ ...tasks, practice: v })}
                />
                <NumberInput
                  label="Project Tasks Completed"
                  description="Features, components, or deliverables shipped this week."
                  icon={Briefcase}
                  color="emerald"
                  value={tasks.project}
                  onChange={(v) => setTasks({ ...tasks, project: v })}
                />

              </div>
            </div>

            {/* Market Signals */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Market Feedback This Week
              </h3>
              <p className="text-xs text-slate-500 -mt-3">
                How the job market responded to your applications this week.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberInput
                  label="Applications Submitted"
                  description="Total applications sent this week."
                  icon={Send}
                  color="slate"
                  value={marketSignals.applications}
                  onChange={(v) => setMarketSignals({ ...marketSignals, applications: v })}
                />
                <NumberInput
                  label="Responses Received"
                  description="Emails, calls, or messages from recruiters."
                  icon={MessageSquare}
                  color="slate"
                  value={marketSignals.responses}
                  onChange={(v) => setMarketSignals({ ...marketSignals, responses: v })}
                />
                <NumberInput
                  label="Interviews Attended"
                  description="Screening calls, technical, or HR rounds."
                  icon={Target}
                  color="slate"
                  value={marketSignals.interviews}
                  onChange={(v) => setMarketSignals({ ...marketSignals, interviews: v })}
                />
              </div>
            </div>

            <button
              onClick={analyzeWeek}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze My Week
                  <Activity className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </motion.div>
        ) : showCompletion ? (
          <CompletionScreen
            role={role}
            activeRole={activeRole}
            checkinData={checkinData}
            onBack={() => setShowCompletion(false)}
            onStartNewCycle={() => setShowInterviewModal(true)}
            onExploreRoles={() => navigate('/select-role')}
            onViewDashboard={() => navigate('/progress')}
          />
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Progress Type */}
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className={`p-5 rounded-lg border ${progressColor}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                {(() => {
                  const Icon = progressIcon
                  return <Icon className="w-5 h-5" />
                })()}
                <h3 className="text-base font-bold">{progressLabel}</h3>
              </div>
              <div className="space-y-2">
                {progressMessage.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed opacity-90">{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Send, value: ms.applications, label: 'Applications', color: 'text-slate-700' },
                { icon: MessageSquare, value: ms.responses, label: 'Responses', color: 'text-slate-700' },
                { icon: TrendingUp, value: `${responseRate}%`, label: 'Response Rate', color: 'text-slate-700' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-lg border border-slate-200 p-4 text-center shadow-sm"
                >
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                  <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Alerts */}
            {redFlags.some((f) => f.includes('BLACK HOLE') || f.includes('application_black_hole')) && (
              <AlertBox type="error" title="Application Black Hole">
                You have sent 15+ applications with zero responses. Your profile is not passing screening.
                <strong> Stop applying. Fix your resume and projects first.</strong>
              </AlertBox>
            )}

            {redFlags.some((f) => f.includes('STAGNATION') || f.includes('compliance_loop')) && (
              <AlertBox type="error" title="Stagnation Alert">
                Multiple weeks of learning without building. You must ship projects NOW.
                <strong> This week: ZERO tutorials. ONE shipped project feature.</strong>
              </AlertBox>
            )}

            {/* Next Tasks */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-slate-600" />
                {week === 12 ? "Week 12 — Final Sprint Tasks" : "Next Week's Tasks"}
              </h3>
              <div className="space-y-2.5">
                {nextTasks.map((task) => (
                  <TaskCard
                    key={task.number}
                    number={task.number}
                    title={task.title}
                    description={task.description}
                    expected={task.expected}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Edit Inputs
              </button>
              {week > 1 && (
                <button
                  onClick={() => setWeek(week - 1)}
                  className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Prev Week
                </button>
              )}
              {week === 12 ? (
                <button
                  onClick={() => {
                    saveWeekData(week)
                    setShowCompletion(true)
                  }}
                  className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View 12-Week Summary
                </button>
              ) : (
                <button
                  onClick={() => {
                    saveWeekData(week)
                    setWeek(week + 1)
                  }}
                  className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
                >
                  Next Week
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Sprint Modal */}
      <AnimatePresence>
        {showInterviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowInterviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200"
            >
              <div className="relative bg-slate-900 px-5 py-5 text-white">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-base font-semibold">12 Weeks Complete</h2>
                <p className="text-white/60 text-xs mt-1">
                  You are ready for the next phase
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <Trophy className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800">
                    You have completed 12 weeks of disciplined tracking. Time to convert your progress into interviews.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInterviewModal(false)
                    fetchJobs()
                  }}
                  disabled={jobsLoading}
                  className="w-full py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {jobsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Find Jobs
                </button>
                <button
                  onClick={() => {
                    const nextCycle = cycle + 1
                    setCycle(nextCycle)
                    setCheckinData(allCyclesData[nextCycle] || {})
                    setSavedWeeks(Object.keys(allCyclesData[nextCycle] || {}).map(Number).sort((a, b) => a - b))
                    setShowInterviewModal(false)
                    setShowCompletion(false)
                    setWeek(1)
                    setShowResults(false)
                  }}
                  className="w-full py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Start Next Cycle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setIsLoggedIn(true)}
      />
    </div>
  )
}

export default WeeklyCheckin
