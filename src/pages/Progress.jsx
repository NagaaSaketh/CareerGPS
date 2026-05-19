import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Target, TrendingUp, Calendar, Zap,
  BookOpen, Activity, Flame, AlertTriangle, BarChart3,
  Plus, Trash2, X
} from 'lucide-react'
import { getRoleById, roleCategories } from '../data/roleConfig'
import { getUserCheckinRoles, getUserReportRoles, getCheckins, deleteCheckins } from '../services/api'


const progressIcons = {
  compliance: BookOpen,
  motion: Activity,
  real_progress: Zap,
  breakthrough: Flame,
}

const progressLabels = {
  compliance: 'Compliance',
  motion: 'Motion',
  real_progress: 'Real Progress',
  breakthrough: 'Breakthrough',
}

function formatLabel(str) {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const progressColors = {
  compliance: 'bg-red-50 text-red-700 border-red-200',
  motion: 'bg-amber-50 text-amber-700 border-amber-200',
  real_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  breakthrough: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

async function getBackendCheckinSummary(roleId) {
  try {
    const result = await getCheckins(roleId)
    const checkins = result.checkins || []

    // Find the max cycle and the latest week within that cycle
    const maxCycle = checkins.reduce((m, c) => Math.max(m, c.cycle || 1), 1)
    const currentCycleCheckins = checkins.filter((c) => (c.cycle || 1) === maxCycle)
    const weeksInCycle = currentCycleCheckins.map((c) => c.week).sort((a, b) => a - b)
    const latestWeek = weeksInCycle[weeksInCycle.length - 1] || null
    const latest = latestWeek ? currentCycleCheckins.find((c) => c.week === latestWeek) : null

    // Compute the next week/cycle the user should be on
    let nextWeek = (latestWeek || 0) + 1
    let nextCycle = maxCycle
    if (nextWeek > 12) {
      nextWeek = 1
      nextCycle = maxCycle + 1
    }

    return {
      totalWeeks: checkins.length,
      latestWeek,
      latestCycle: maxCycle,
      nextWeek,
      nextCycle,
      progressType: latest?.progress_type || 'motion',
      applications: checkins.reduce((sum, c) => sum + (c.applications_sent || 0), 0),
      responses: checkins.reduce((sum, c) => sum + (c.responses_received || 0), 0),
    }
  } catch {
    return { totalWeeks: 0, latestWeek: null, progressType: 'motion', applications: 0, responses: 0 }
  }
}

function Progress() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Fetch both checkin roles and report roles in parallel
        const [checkinResult, reportResult] = await Promise.allSettled([
          getUserCheckinRoles(),
          getUserReportRoles(),
        ])
        const checkinRoleIds = new Set(checkinResult.status === 'fulfilled' ? (checkinResult.value.roles || []) : [])
        const reportRoleIds = new Set(reportResult.status === 'fulfilled' ? (reportResult.value.roles || []) : [])

        // Union: all roles that have either a check-in or a report
        const allRoleIds = new Set([...checkinRoleIds, ...reportRoleIds])

        // Also include the current session role
        const sessionRole = sessionStorage.getItem('selectedRole')
        if (sessionRole && getRoleById(sessionRole)) {
          allRoleIds.add(sessionRole)
        }

        const enriched = await Promise.all(
          Array.from(allRoleIds).map(async (roleId) => {
            const role = getRoleById(roleId)
            if (checkinRoleIds.has(roleId)) {
              const summary = await getBackendCheckinSummary(roleId)
              return {
                roleId,
                name: role?.name || formatLabel(roleId),
                category: role?.category || 'engineering',
                ...summary,
              }
            }
            return {
              roleId,
              name: role?.name || formatLabel(roleId),
              category: role?.category || 'engineering',
              totalWeeks: 0,
              latestWeek: null,
              progressType: 'motion',
              applications: 0,
              responses: 0,
            }
          })
        )

        enriched.sort((a, b) => (b.latestWeek || 0) - (a.latestWeek || 0))
        setRoles(enriched)
      } catch {
        setRoles([])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleContinue = (roleId) => {
    sessionStorage.setItem('selectedRole', roleId)
    const roleData = roles.find((r) => r.roleId === roleId)
    if (roleData?.nextWeek) {
      sessionStorage.setItem('continueWeek', String(roleData.nextWeek))
      sessionStorage.setItem('continueCycle', String(roleData.nextCycle || 1))
    } else {
      sessionStorage.removeItem('continueWeek')
      sessionStorage.removeItem('continueCycle')
    }
    navigate('/checkin')
  }

  const handleDelete = (roleId) => {
    setConfirmDelete(roleId)
  }

  const executeDelete = async () => {
    if (!confirmDelete) return
    const roleId = confirmDelete
    setConfirmDelete(null)
    setDeleting(roleId)
    try {
      await deleteCheckins(roleId)
      if (sessionStorage.getItem('selectedRole') === roleId) {
        sessionStorage.removeItem('selectedRole')
      }
      setRoles((prev) => prev.filter((r) => r.roleId !== roleId))
    } catch (err) {
      console.warn('Delete failed:', err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Progress</h1>
        <p className="text-sm text-slate-500">
          Track your weekly check-ins across all career paths.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-1">No progress yet</p>
          <p className="text-sm text-slate-400 mb-5">
            Complete your first weekly check-in to start tracking.
          </p>
          <button
            onClick={() => navigate('/select-role')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Choose a Career Path
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((r, i) => {
            const Icon = progressIcons[r.progressType] || Activity
            const label = progressLabels[r.progressType] || 'Motion'
            const colorClass = progressColors[r.progressType] || progressColors.motion
            const responseRate = r.applications > 0 ? ((r.responses / r.applications) * 100).toFixed(1) : 0

            return (
              <motion.div
                key={r.roleId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm capitalize mb-0.5">
                      {r.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xs text-slate-500 capitalize">
                        {formatLabel(r.category)}
                      </p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Weeks</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{r.totalWeeks}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Response</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{responseRate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                          <Target className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Latest</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {r.latestCycle > 1 ? `C${r.latestCycle} ` : ''}W{r.latestWeek || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(r.roleId)}
                      disabled={deleting === r.roleId}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete this path"
                    >
                      {deleting === r.roleId ? (
                        <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                    <button
                      onClick={() => handleContinue(r.roleId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      Continue
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          <div className="pt-2">
            <button
              onClick={() => navigate('/select-role')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Track a New Role
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmDelete(null)}
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
                  onClick={() => setConfirmDelete(null)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-base font-semibold">Delete Progress</h2>
                <p className="text-white/60 text-xs mt-1">
                  This action cannot be undone
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    Are you sure you want to delete all progress for <strong>{formatLabel(confirmDelete)}</strong>? All weekly check-ins and local data for this role will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleting === confirmDelete}
                    className="flex-1 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleting === confirmDelete ? (
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Progress
