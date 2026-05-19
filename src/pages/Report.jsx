import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, AlertTriangle,
  Sparkles, Award, ExternalLink, Loader2
} from 'lucide-react'
import AgentTrace from '../components/AgentTrace'
import StreamedReport from '../components/StreamedReport'
import { getDynamicReport, getRoleById, locationOptions } from '../data/roleConfig'
import { getScrapedJobs, getProfile, analyzeProfileAgentic, saveAgenticReport, getLatestReport } from '../services/api'
import { getSession } from '../services/auth'
import AuthModal from '../components/AuthModal'

function formatExpBadge(months) {
  if (!months || months <= 12) return '0–1 yr'
  if (months <= 24) return '1–2 yrs'
  if (months <= 48) return '2–4 yrs'
  if (months <= 72) return '4–6 yrs'
  if (months <= 96) return '6–8 yrs'
  return '8+ yrs'
}

function monthsToExperience(months) {
  if (months <= 12) return 'fresher'
  if (months <= 24) return '1_to_2'
  if (months <= 48) return '2_to_4'
  if (months <= 72) return '4_to_6'
  if (months <= 96) return '6_to_8'
  return '8_plus'
}

function formatLabel(str) {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Return a direct-apply URL for a job.
 * LinkedIn sometimes stores company page URLs (/company/...) instead of job listing URLs.
 * When that happens, fall back to a LinkedIn job search for title+company.
 */
function getApplyUrl(job) {
  const url = job.url || ''
  if (!url) return ''
  // LinkedIn company page — not a job listing
  if (/linkedin\.com\/company\b/.test(url)) {
    const q = encodeURIComponent(`${job.title || ''} ${job.company || ''}`.trim())
    return `https://www.linkedin.com/jobs/search/?keywords=${q}`
  }
  return url
}

function JobCard({ job, index }) {
  const expMonths = job.experience_months || [0, 0]
  const hasExpData = expMonths[1] > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
    >
      <h4 className="font-semibold text-slate-900 text-sm truncate">{job.title || 'Untitled Position'}</h4>
      <p className="text-xs text-slate-500 mt-0.5">
        {[job.company, job.location].filter(Boolean).join(' • ') || 'Company not listed'}
      </p>
      {(job.salary_lpa || hasExpData) && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {job.salary_lpa && (
            <span className="text-xs text-emerald-700 font-medium">
              ₹{job.salary_lpa[0]}–{job.salary_lpa[1]} LPA
            </span>
          )}
          {hasExpData && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-100">
              {formatExpBadge(expMonths[1])}
            </span>
          )}
          {!hasExpData && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 font-medium border border-slate-100" title="Experience requirement not specified on listing">
              Exp: N/A
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {job.source || 'job board'}
          </span>
          {job.matchedRole && job.matchedRole !== job.source && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {getRoleById(job.matchedRole)?.name || job.matchedRole.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        {getApplyUrl(job) && (
          <a
            href={getApplyUrl(job)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Apply
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

function JobsSection({ profile, report, preferredJobs, otherJobs, internshipJobs, jobsLoading, jobsNote, onFetchJobs }) {
  const hasPreferred = preferredJobs.length > 0
  const hasOther = otherJobs.length > 0
  const hasInternships = internshipJobs.length > 0
  const hasAny = hasPreferred || hasOther || hasInternships
  const fetched = hasAny || (jobsNote && !jobsLoading)

  return (
    <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Open Positions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {profile?.selectedRole
              ? `${getRoleById(profile.selectedRole)?.name || profile.selectedRole.replace(/_/g, ' ')} roles`
              : 'Relevant roles'}{' '}
            {profile?.location ? `· ${profile.location}` : ''}
          </p>
        </div>
        {!fetched && (
          <button
            onClick={() => onFetchJobs(false)}
            disabled={jobsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {jobsLoading ? (
              <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Fetching…</>
            ) : (
              <>Get Jobs</>
            )}
          </button>
        )}
        {fetched && !jobsLoading && (
          <button
            onClick={() => onFetchJobs(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Refresh Live
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Loading */}
        {jobsLoading && (
          <div className="py-8 flex flex-col items-center gap-3">
            <span className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">{jobsNote || 'Fetching jobs…'}</p>
          </div>
        )}

        {/* Empty state */}
        {!jobsLoading && !hasAny && !fetched && (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-400">Click "Get Jobs" to find matching positions</p>
          </div>
        )}

        {/* No results after fetch */}
        {!jobsLoading && fetched && !hasAny && (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500 font-medium">No jobs found right now</p>
            <p className="text-xs text-zinc-400 mt-1">No listings matched your role and experience level. Try "Refresh Live" to check for new postings.</p>
          </div>
        )}

        {/* Preferred location jobs */}
        {!jobsLoading && hasPreferred && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Matching your location
            </p>
            {preferredJobs.slice(0, 5).map((job, i) => (
              <JobRow key={i} job={job} />
            ))}
          </div>
        )}

        {/* Other location jobs */}
        {!jobsLoading && hasOther && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
              {hasPreferred ? 'Other locations' : 'Available across India'}
            </p>
            {otherJobs.slice(0, 5).map((job, i) => (
              <JobRow key={i} job={job} />
            ))}
          </div>
        )}

        {/* Internships fallback */}
        {!jobsLoading && !hasPreferred && !hasOther && hasInternships && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Internships — build your profile first
            </p>
            {internshipJobs.slice(0, 5).map((job, i) => (
              <JobRow key={i} job={job} />
            ))}
          </div>
        )}

        {jobsNote && fetched && !jobsLoading && (
          <p className="text-[11px] text-zinc-400 mt-4 pt-3 border-t border-zinc-50">{jobsNote}</p>
        )}
      </div>
    </div>
  )
}

function JobRow({ job }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-zinc-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-zinc-800 truncate">{job.title || 'Position'}</span>
          {job.salary_lpa && (
            <span className="text-xs text-emerald-600 font-medium shrink-0">
              ₹{job.salary_lpa[0]}–{job.salary_lpa[1]} LPA
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          {[job.company, job.location].filter(Boolean).join(' · ')}
        </p>
        {job.skills_found?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {job.skills_found.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-100 text-zinc-400 font-medium uppercase">
          {job.source || 'job board'}
        </span>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-0.5"
          >
            Apply
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Module-level constants (stable across renders) ──────────────────────────

const EXPERIENCE_MAP = {
  fresher:    { label: '0–1 years', maxMonths: 12 },
  less_than_1: { label: '0–1 years', maxMonths: 12 },
  '1_to_2':   { label: '1–2 years', maxMonths: 24 },
  '2_to_4':   { label: '2–4 years', maxMonths: 48 },
  '4_to_6':   { label: '4–6 years', maxMonths: 72 },
  '6_to_8':   { label: '6–8 years', maxMonths: 96 },
  '8_plus':   { label: '8+ years',  maxMonths: 999 },
}

const ROLE_KEYWORDS = {
  devops_engineer:          ['devops', 'dev ops', 'infrastructure', 'platform engineer', 'sre', 'reliability', 'cloud engineer', 'ci/cd', 'site reliability', 'devsecops'],
  site_reliability_engineer:['sre', 'site reliability', 'reliability engineer', 'devops', 'infrastructure', 'platform engineer', 'cloud engineer'],
  backend_engineer:         ['backend', 'back-end', 'back end', 'server-side', 'api developer', 'software engineer', 'software developer', 'sde', 'java developer', 'python developer', 'node.js', 'golang', 'microservices'],
  frontend_engineer:        ['frontend', 'front-end', 'front end', 'ui developer', 'react developer', 'angular developer', 'vue developer', 'web developer', 'software engineer'],
  fullstack_engineer:       ['fullstack', 'full-stack', 'full stack', 'software engineer', 'software developer', 'sde', 'web developer'],
  mobile_developer:         ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin developer', 'swift developer', 'app developer'],
  qa_automation:            ['qa', 'quality', 'test', 'automation', 'sdet', 'qe'],
  sdet:                     ['sdet', 'test engineer', 'automation engineer', 'qa engineer', 'software development engineer in test', 'quality engineer'],
  data_analyst:             ['data analyst', 'analytics', 'business analyst', 'bi analyst', 'data engineer'],
  data_scientist:           ['data scientist', 'machine learning', 'ml engineer', 'ai engineer', 'data science'],
  data_engineer:            ['data engineer', 'etl', 'pipeline', 'spark', 'airflow', 'data platform'],
  ml_engineer:              ['machine learning', 'ml engineer', 'ai engineer', 'mlops', 'deep learning'],
  product_manager:          ['product manager', 'product owner', 'pm ', 'product management'],
  ux_designer:              ['ux', 'user experience', 'product designer', 'ux researcher'],
  ui_designer:              ['ui designer', 'visual designer', 'graphic designer', 'product designer'],
  support_engineer:         ['support engineer', 'technical support', 'customer success', 'solutions engineer', 'cloud support'],
  solutions_engineer:       ['solutions engineer', 'presales', 'pre-sales', 'technical account', 'customer engineer'],
}

const SECTION_PILLS = [
  { n: '01', label: 'Profile', activeClass: 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' },
  { n: '02', label: 'Paths',   activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' },
  { n: '03', label: 'Tasks',   activeClass: 'bg-amber-500 text-white shadow-sm shadow-amber-200' },
]

function matchesRole(job, roleId) {
  const keywords = ROLE_KEYWORDS[roleId]
  if (!keywords) return true  // unknown role: let everything through
  const haystack = [job.title || '', ...(job.skills_found || [])].join(' ').toLowerCase()
  return keywords.some(k => haystack.includes(k))
}

// ─── Report component ─────────────────────────────────────────────────────────

function Report() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [report, setReport] = useState(null)


  const [backendConnected, setBackendConnected] = useState(false)
  const [preferredJobs, setPreferredJobs] = useState([])
  const [otherJobs, setOtherJobs] = useState([])
  const [internshipJobs, setInternshipJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // AI-powered agentic mode state — restored from sessionStorage if available
  const _cachedRole = sessionStorage.getItem('selectedRole')
  const _cachedReport = _cachedRole ? sessionStorage.getItem(`cachedReport_${_cachedRole}`) : null
  const _cachedEvents = _cachedRole ? sessionStorage.getItem(`cachedEvents_${_cachedRole}`) : null
  const [aiMode, setAiMode] = useState(!!_cachedReport)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [agentEvents, setAgentEvents] = useState(() => {
    try { return _cachedEvents ? JSON.parse(_cachedEvents) : [] } catch { return [] }
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedReport, setStreamedReport] = useState(_cachedReport || '')

  // Check auth on mount
  useEffect(() => {
    getSession().then((session) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  // Active section tracking — only wire up after streaming finishes and all section DOM nodes exist
  const [activeSection, setActiveSection] = useState(0)
  useEffect(() => {
    // Don't observe while streaming; sections may not be in the DOM yet
    if (isStreaming || !streamedReport) return

    let obs = null

    // Small delay to let React flush the section cards to the DOM
    const timer = setTimeout(() => {
      const els = [0, 1, 2]
        .map((i) => document.getElementById(`report-section-${i}`))
        .filter(Boolean)
      if (els.length === 0) return

      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = parseInt(entry.target.id.split('-').pop(), 10)
              setActiveSection(idx)
            }
          })
        },
        { rootMargin: '-10% 0px -55% 0px', threshold: 0 }
      )
      els.forEach((el) => obs.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      obs?.disconnect()
    }
  }, [isStreaming, streamedReport])

  // Job fetching logic — called on button click, not auto-run
  const [jobsNote, setJobsNote] = useState('')

  const getRolesToSearch = useCallback(() => {
    const selectedRole = profile?.selectedRole || sessionStorage.getItem('selectedRole')
    if (!selectedRole) return new Set()
    const roles = new Set()
    const roleConfig = getRoleById(selectedRole)
    if (roleConfig) {
      roles.add(selectedRole)
      if (roleConfig.steppingStone && getRoleById(roleConfig.steppingStone)) {
        roles.add(roleConfig.steppingStone)
      }
    } else {
      roles.add(selectedRole)
    }
    return roles
  }, [profile?.selectedRole])

  const getUserLocation = useCallback(() => {
    if (profile?.location) return profile.location
    try {
      const saved = sessionStorage.getItem('lastProfileFormData')
      if (saved) return JSON.parse(saved)?.location || 'pune'
    } catch { /* ignore */ }
    return 'pune'
  }, [profile?.location])

  const matchesExperience = useCallback((job) => {
    const userExp = EXPERIENCE_MAP[profile?.experience] || EXPERIENCE_MAP.fresher
    const exp = job.experience_months || [0, 0]
    const maxRequired = exp[1] || 0
    const userMax = userExp.maxMonths
    if (maxRequired > 0) return maxRequired <= userMax + 12
    if (userMax <= 24) return false
    return true
  }, [profile?.experience])

  const fetchJobs = useCallback(async (live = false) => {
    setJobsLoading(true)
    setPreferredJobs([])
    setOtherJobs([])
    setInternshipJobs([])

    const userLoc = getUserLocation()
    const locLabel = locationOptions.find((l) => l.value === userLoc)?.label || userLoc
    const rolesToSearch = getRolesToSearch()
    const preferred = []
    const others = []
    const seen = new Set()

    const addUnique = (arr, job, role) => {
      const key = job.url || `${job.title}-${job.company}`
      if (seen.has(key)) return
      seen.add(key)
      arr.push({ ...job, matchedRole: role })
    }

    setJobsNote(live ? 'Fetching live jobs…' : 'Loading cached jobs…')

    // Step 1: Fetch for user's preferred location (role + experience match required)
    for (const role of rolesToSearch) {
      try {
        const res = await getScrapedJobs(role, locLabel, 12, live)
        res.jobs?.forEach(j => {
          if (matchesRole(j, role) && matchesExperience(j)) addUnique(preferred, j, role)
        })
      } catch { /* ignore */ }
    }

    // Step 2: Fetch India-wide if preferred location returned nothing (role + experience match required)
    if (preferred.length === 0) {
      for (const role of rolesToSearch) {
        try {
          const res = await getScrapedJobs(role, 'India', 12, live)
          res.jobs?.forEach(j => {
            if (matchesRole(j, role) && matchesExperience(j)) addUnique(others, j, role)
          })
        } catch { /* ignore */ }
      }
    }

    setPreferredJobs(preferred)
    setOtherJobs(others)
    setInternshipJobs([])
    const total = preferred.length + others.length
    setJobsNote(
      total > 0
        ? `${total} matching position${total !== 1 ? 's' : ''} found · ${live ? 'live' : 'cached'}`
        : 'No jobs found right now for your role and experience level'
    )
    setJobsLoading(false)
  }, [getUserLocation, getRolesToSearch, matchesExperience, profile])

  async function runAgenticAnalysis() {
    const formDataStr = sessionStorage.getItem('lastProfileFormData')
    const targetRole = sessionStorage.getItem('selectedRole')
    if (!formDataStr || !targetRole) return
    const formData = JSON.parse(formDataStr)

    setAiMode(true)
    setAgentEvents([])
    setStreamedReport('')
    setIsStreaming(true)
    setReportGenerating(true)

    let firstEvent = true
    let reportAccumulator = ''
    let eventsAccumulator = []
    try {
      await analyzeProfileAgentic(formData, targetRole, (event) => {
        if (firstEvent) {
          firstEvent = false
          setReportGenerating(false)
        }
        if (event.type === 'text_delta') {
          reportAccumulator += event.text
          setStreamedReport(prev => prev + event.text)
        } else if (event.type === 'done') {
          setIsStreaming(false)
          // Persist completed report to sessionStorage for back-navigation
          sessionStorage.setItem(`cachedReport_${targetRole}`, reportAccumulator)
          sessionStorage.setItem(`cachedEvents_${targetRole}`, JSON.stringify(eventsAccumulator))
          // Save to Supabase for cross-session persistence
          saveAgenticReport(targetRole, reportAccumulator, event.structured_data || {}).catch(err => {
            console.warn('[Report] saveAgenticReport failed (non-blocking):', err)
          })
        } else if (event.type === 'error') {
          setIsStreaming(false)
        } else {
          eventsAccumulator = [...eventsAccumulator, event]
          setAgentEvents(prev => [...prev, event])
        }
      })
    } catch {
      setIsStreaming(false)
      setReportGenerating(false)
    }
  }

  useEffect(() => {
    const role = sessionStorage.getItem('selectedRole')

    if (!role) {
      navigate('/select-role')
      return
    }

    const savedFormData = sessionStorage.getItem('lastProfileFormData')

    if (savedFormData) {
      // Fresh form submission — build classic report from the submitted ratings
      const formData = JSON.parse(savedFormData)
      const profileData = {
        selectedRole: role,
        location: formData.location || 'pune',
        experience: formData.experience || 'fresher',
      }
      setProfile(profileData)
      setReport(getDynamicReport(role, formData))
    } else {
      // Returning visit — load profile + AI report from backend
      async function loadReport() {
        let profileData = { selectedRole: role }
        try {
          const profileResult = await getProfile()
          if (profileResult) {
            profileData = {
              selectedRole: role,
              location: profileResult.location || 'pune',
              experience: monthsToExperience(profileResult.experience_months || 0),
            }
          }
        } catch { /* use defaults */ }
        setProfile(profileData)
        setReport(getDynamicReport(role, {}))

        // Try to restore the last AI report from Supabase
        // (sessionStorage was already checked above and was empty)
        try {
          const saved = await getLatestReport(role)
          if (saved?.report_text) {
            setStreamedReport(saved.report_text)
            setAiMode(true)
            // Cache it locally so navigating away and back is instant
            sessionStorage.setItem(`cachedReport_${role}`, saved.report_text)
          }
        } catch { /* no saved report — show Generate Report button */ }
      }
      loadReport()
    }
  }, [])

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium mb-2">No report data found</p>
        <p className="text-sm text-slate-400 mb-6 text-center max-w-xs">
          You need to complete your profile first to generate a career report.
        </p>
        <button
          onClick={() => navigate('/select-role')}
          className="px-5 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Choose a Career Path
        </button>
      </div>
    )
  }

  const role = getRoleById(profile?.selectedRole)

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Sparkles className="w-4 h-4" />
          CareerGPS Report
        </div>
      </div>

      {/* Auth banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-amber-800">
            <strong>Guest mode:</strong> Your report is not saved.{' '}
            <span className="text-amber-700">Sign in to save reports and track weekly progress.</span>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="px-3 py-1.5 rounded-md bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Sticky title / section nav — sits just below the site navbar (h-14 = 56px + 1px border) */}
      <div className="sticky top-[57px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-1 bg-slate-50">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3.5 shadow-sm flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 truncate">
                Career Intelligence Report
              </span>
            </div>
            <h1 className="text-base font-bold text-zinc-900 tracking-tight truncate">
              {role?.name || 'Career'} Assessment
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">Evidence-based · Real market data · AI-powered</p>
          </div>

          {/* Section nav pills — visible when report is ready */}
          {streamedReport && (
            <div className="flex items-center gap-1 shrink-0">
              {SECTION_PILLS.map(({ n, label, activeClass }, i) => (
                <button
                  key={n}
                  onClick={() =>
                    document
                      .getElementById(`report-section-${i}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    activeSection === i
                      ? activeClass
                      : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'
                  }`}
                >
                  <span>{n}</span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Not yet generated — show CTA */}
      {!aiMode && !isStreaming && !streamedReport && (
        <div className="rounded-xl border border-zinc-200 bg-white px-8 py-12 flex flex-col items-center gap-5 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 mb-1">Run AI Analysis</p>
            <p className="text-xs text-zinc-400 max-w-xs">
              Claude will assess your skills against market evidence and generate a 3-section intelligence report.
            </p>
          </div>
          <button
            onClick={runAgenticAnalysis}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Generate Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Spinner — waiting for first SSE event */}
      {reportGenerating && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-100" />
            <div className="absolute inset-0 rounded-full border-2 border-t-zinc-700 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-800">Generating Report</p>
            <p className="text-xs text-zinc-400 mt-1">Analysing your profile…</p>
          </div>
        </div>
      )}

      {/* Step trace while tools are running */}
      {!reportGenerating && (isStreaming || agentEvents.length > 0) && !streamedReport && (
        <AgentTrace events={agentEvents} isStreaming={isStreaming} />
      )}

      {/* Streamed report */}
      {streamedReport && (
        <StreamedReport text={streamedReport} isStreaming={isStreaming} />
      )}

      {/* Jobs section — after report finishes */}
      {streamedReport && !isStreaming && (
        <JobsSection
          profile={profile}
          report={report}
          preferredJobs={preferredJobs}
          otherJobs={otherJobs}
          internshipJobs={internshipJobs}
          jobsLoading={jobsLoading}
          jobsNote={jobsNote}
          onFetchJobs={fetchJobs}
        />
      )}

      {/* CTA */}
      {streamedReport && !isStreaming && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/checkin')}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 h-9 px-4 transition-colors"
          >
            Start Week 1
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
          <button
            onClick={() => navigate('/select-role')}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-9 px-4 transition-colors"
          >
            Try Different Role
          </button>
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setIsLoggedIn(true)}
      />
    </div>
  )
}

export default Report
