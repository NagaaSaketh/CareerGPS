/**
 * CareerGPS API Service
 * Connects the React frontend to the FastAPI backend.
 * Includes JWT auth headers and falls back to local computation if backend is unreachable.
 */

import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function apiRequest(method, endpoint, body = null, requireAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (requireAuth) {
    const token = await getAccessToken()
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    if (response.status === 401) {
      // Auth expired or missing
      const err = new Error('UNAUTHORIZED')
      err.status = 401
      throw err
    }
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API ${response.status}: ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(`[API] ${method} ${endpoint} failed:`, error.message)
    throw error
  }
}

/**
 * Transform frontend formData into backend ProfileRequest format
 */
function buildProfilePayload(formData, targetRole) {
  const skills = formData.skills || {}

  // Map experience dropdown to months
  const experienceMap = {
    fresher: 0,
    less_than_1: 6,
    '1_to_2': 18,
    '2_to_4': 36,
    '4_to_6': 60,
    '6_to_8': 84,
    '8_plus': 96,
  }

  const resumeProjects = []
  if (formData.projects > 0) {
    for (let i = 0; i < formData.projects; i++) {
      resumeProjects.push({
        technologies_used: [],
        deployed: formData.deployed,
      })
    }
  }

  const githubUrl = formData.githubUrl || ''

  return {
    target_role: targetRole,
    college_tier: formData.collegeTier || 'tier_3',
    location: formData.location || 'pune',
    experience_months: experienceMap[formData.experience] || 0,
    current_state: formData.hasInternship
      ? formData.internshipType === 'testing'
        ? 'qa_manual'
        : 'basic_python'
      : 'no_coding',
    self_assessment: skills,
    github: {
      url: githubUrl,
      accessible: githubUrl.length > 0,
      num_repos: formData.projects || 0,
      total_commits: formData.projects * 10,
      // Do NOT populate languages from self-ratings — that creates fake evidence.
      // Real languages come from actual GitHub API analysis on the backend.
      languages: {},
      has_readme: false,
      has_tests: false,
      has_error_handling: false,
    },
    resume: {
      internship: {
        has_internship: formData.hasInternship || false,
        type: formData.internshipType || 'none',
        duration_months: formData.hasInternship ? 3 : 0,
      },
      projects: resumeProjects,
      skills: Object.keys(skills),
      cgpa: parseFloat(formData.cgpa) || 7.0,
      college_tier: formData.collegeTier || 'tier_3',
      resume_text: formData.resumeText || '',
    },
    diagnostics: {},
  }
}

/**
 * Analyze a user profile via the backend agent pipeline.
 * Returns { report: string, structured_data: object, target_role: string, role_known: boolean }
 */
export async function analyzeProfile(formData, targetRole) {
  const payload = buildProfilePayload(formData, targetRole)
  return await apiRequest('POST', '/api/v1/analyze', payload)
}

/**
 * Submit a weekly check-in and get next week's tasks.
 * Returns { checkin_report, week, progress_type, recommendation, red_flags, next_tasks }
 */
export async function submitCheckin(week, tasksCompleted, marketSignals, targetRole, taskHours = {}) {
  const payload = {
    week,
    tasks_completed: tasksCompleted,
    applications_sent: marketSignals.applications || 0,
    responses_received: marketSignals.responses || 0,
    interviews_attended: marketSignals.interviews || 0,
    target_role: targetRole,
    task_hours: taskHours,
  }
  return await apiRequest('POST', '/api/v1/checkin', payload)
}

/**
 * Fetch all check-ins for the authenticated user. Optionally filter by target_role.
 */
export async function getCheckins(targetRole = null) {
  const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : ''
  return await apiRequest('GET', `/api/v1/checkins${query}`)
}

/**
 * Fetch all distinct target_roles the user has check-ins for.
 */
export async function getUserCheckinRoles() {
  return await apiRequest('GET', '/api/v1/checkins/roles')
}

/**
 * Fetch all distinct target_roles the user has reports for.
 */
export async function getUserReportRoles() {
  return await apiRequest('GET', '/api/v1/reports/roles')
}

/**
 * Delete all check-ins for a specific target role.
 */
export async function deleteCheckins(targetRole) {
  return await apiRequest('DELETE', `/api/v1/checkins/${encodeURIComponent(targetRole)}`)
}

/**
 * Fetch the latest report for the authenticated user.
 * Optionally filter by target_role.
 */
export async function getLatestReport(targetRole = null) {
  const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : ''
  return await apiRequest('GET', `/api/v1/reports/latest${query}`)
}

/**
 * Fetch the authenticated user's profile.
 */
export async function getProfile() {
  return await apiRequest('GET', '/api/v1/profile')
}

/**
 * Save profile form data to Supabase (called after form submission).
 */
export async function saveProfile(formData, targetRole) {
  const experienceMap = {
    fresher: 0, less_than_1: 6, '1_to_2': 18, '2_to_4': 36,
    '4_to_6': 60, '6_to_8': 84, '8_plus': 96,
  }
  return await apiRequest('POST', '/api/v1/profile', {
    target_role: targetRole,
    college_tier: formData.collegeTier || 'tier_3',
    location: formData.location || 'pune',
    experience_months: experienceMap[formData.experience] || 0,
    current_state: formData.hasInternship ? 'basic_python' : 'no_coding',
    self_assessment: formData.skills || {},
    github_url: formData.githubUrl || '',
  })
}

/**
 * Save a completed AI-generated (agentic) report to Supabase.
 */
export async function saveAgenticReport(targetRole, reportText, structuredData = {}) {
  return await apiRequest('POST', '/api/v1/reports/save', {
    target_role: targetRole,
    report_text: reportText,
    structured_data: structuredData,
  })
}

/**
 * Fetch data provenance for a role (shows where market data came from).
 */
export async function getMarketProvenance(roleName, location = 'India') {
  return await apiRequest('GET', `/api/v1/market/${roleName}/provenance?location=${encodeURIComponent(location)}`)
}

/**
 * List all configured market data sources.
 */
export async function getMarketSources() {
  return await apiRequest('GET', '/api/v1/market/sources')
}

/**
 * Force refresh live market data for a role.
 */
export async function refreshMarketData(roleName, location = 'India') {
  return await apiRequest('POST', `/api/v1/market/${roleName}/refresh?location=${encodeURIComponent(location)}`)
}

/**
 * Fetch job listings from the backend for a specific role+location.
 * By default reads from cache. Set live=true to trigger real-time scraping.
 */
export async function getScrapedJobs(roleName, location = 'India', limit = 5, live = false) {
  return await apiRequest('GET', `/api/v1/market/${roleName}/jobs?location=${encodeURIComponent(location)}&limit=${limit}&live=${live}`)
}

/**
 * Fetch ALL cached jobs from every market snapshot.
 * This is what 'Get Cached Jobs' calls.
 */
export async function getAllCachedJobs(limit = 50) {
  return await apiRequest('GET', `/api/v1/market/jobs/all?limit=${limit}`)
}

/**
 * Health check.
 */
export async function getHealth() {
  return await apiRequest('GET', '/health')
}

/**
 * Upload a resume PDF or DOCX file.
 * Returns { filename, resume_text, word_count, extracted_skills, message }
 */
export async function uploadResume(file) {
  const url = `${API_BASE_URL}/api/v1/upload-resume`
  const token = await getAccessToken()
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (response.status === 401) {
    const err = new Error('UNAUTHORIZED')
    err.status = 401
    throw err
  }
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upload failed: ${errorText}`)
  }

  return await response.json()
}

/**
 * Analyze a user profile using Claude with tool calling (agentic mode).
 * Streams SSE events to the onEvent callback in real time.
 *
 * Event shapes:
 *   { type: 'tool_start', tool: string, label: string }
 *   { type: 'tool_end',   tool: string, summary: string }
 *   { type: 'text_delta', text: string }
 *   { type: 'done',       structured_data: object }
 *   { type: 'error',      message: string }
 */
export async function analyzeProfileAgentic(formData, targetRole, onEvent) {
  const payload = buildProfilePayload(formData, targetRole)
  const url = `${API_BASE_URL}/api/v1/analyze-agentic`
  const token = await getAccessToken()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 401) {
    const err = new Error('UNAUTHORIZED')
    err.status = 401
    throw err
  }
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Agentic analysis failed: ${response.status} ${text}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep any incomplete line for the next chunk

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6))
          onEvent(event)
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }
}

export { API_BASE_URL }
