import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Target, TrendingUp, Zap, CheckCircle2, AlertTriangle, Wrench, BookOpen, Send, Code2, Users, Search, Rocket, FlaskConical } from 'lucide-react'

// ─── Task type badge config ──────────────────────────────────────────────────

const TASK_TAGS = {
  BUILD:    { label: 'Build',    icon: Wrench,       bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  CODE:     { label: 'Code',     icon: Code2,        bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  DEPLOY:   { label: 'Deploy',   icon: Rocket,       bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  LEARN:    { label: 'Learn',    icon: BookOpen,     bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
  READ:     { label: 'Read',     icon: BookOpen,     bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
  RESEARCH: { label: 'Research', icon: Search,       bg: 'bg-zinc-100',   text: 'text-zinc-600',    border: 'border-zinc-200'    },
  PRACTICE: { label: 'Practice', icon: Zap,          bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  SOLVE:    { label: 'Solve',    icon: FlaskConical, bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  APPLY:    { label: 'Apply',    icon: Send,         bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  NETWORK:  { label: 'Network',  icon: Users,        bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'    },
}

function TaskBadge({ tag }) {
  const cfg = TASK_TAGS[tag.toUpperCase()]
  if (!cfg) return null
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold mr-1.5 align-middle border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {cfg.label}
    </span>
  )
}

// ─── Section display config ─────────────────────────────────────────────────

const SECTION_CONFIG = {
  'WHERE YOU ARE': {
    label: 'Profile Analysis',
    sublabel: 'Skill evidence vs self-assessment',
    icon: Target,
    number: '01',
    headerClass: 'bg-indigo-600',
    pillClass: 'bg-indigo-100 text-indigo-700',
    accentClass: 'border-l-indigo-500',
  },
  'WHERE YOU CAN GO': {
    label: 'Career Pathways',
    sublabel: 'Strategic options & timelines',
    icon: TrendingUp,
    number: '02',
    headerClass: 'bg-emerald-600',
    pillClass: 'bg-emerald-100 text-emerald-700',
    accentClass: 'border-l-emerald-500',
  },
  'YOUR 3 TASKS THIS WEEK': {
    label: 'Action Plan',
    sublabel: 'Highest-leverage moves this week',
    icon: Zap,
    number: '03',
    headerClass: 'bg-amber-500',
    pillClass: 'bg-amber-100 text-amber-700',
    accentClass: 'border-l-amber-500',
  },
}

// ─── Section parser ─────────────────────────────────────────────────────────

function stripCodeFences(text) {
  return text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
}

/**
 * Robust line-by-line parser.
 * Handles three LLM formats:
 *   1. ════════ WHERE YOU ARE     (inline title after divider)
 *   2. ════════\nWHERE YOU ARE\n════════  (title between dividers)
 *   3. WHERE YOU ARE\n════════    (title then underline)
 * Preamble before first section is silently dropped.
 */
function splitSections(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const sections = []
  let currentTitle = null
  let contentLines = []

  const isSeparatorLine = (l) => /^[═─=\-]{3,}\s*$/.test(l.trim())
  const separatorInlineTitle = (l) => {
    const m = l.trim().match(/^[═─=\-]{3,}\s+([A-Z0-9][A-Z0-9\s:]+?)\s*$/)
    return m ? m[1].trim() : null
  }
  const isAllCapsTitle = (l) => {
    const t = l.trim()
    return t.length > 3 && t.length < 70 && /^[A-Z0-9][A-Z0-9\s:]+$/.test(t) && !t.includes('.')
  }

  const saveSection = () => {
    if (currentTitle !== null) {
      const content = contentLines.join('\n').trim()
      if (content) sections.push({ title: currentTitle, content: stripCodeFences(content) })
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ── Case 1: "════ WHERE YOU ARE" ──────────────────────────────────────
    const inlineTitle = separatorInlineTitle(line)
    if (inlineTitle) {
      saveSection()
      currentTitle = inlineTitle
      contentLines = []
      // Skip any following pure separator
      while (i + 1 < lines.length && isSeparatorLine(lines[i + 1])) i++
      continue
    }

    // ── Case 2: pure separator — peek next non-empty line for title ───────
    if (isSeparatorLine(line)) {
      // Look ahead for a title line
      let j = i + 1
      while (j < lines.length && !lines[j].trim()) j++ // skip blanks
      if (j < lines.length && isAllCapsTitle(lines[j])) {
        saveSection()
        currentTitle = lines[j].trim()
        contentLines = []
        i = j // skip to title line
        // Skip any following separators
        while (i + 1 < lines.length && isSeparatorLine(lines[i + 1])) i++
        continue
      }
      // Pure separator inside content — skip it
      continue
    }

    // ── Case 3: ALL CAPS line followed by a separator ─────────────────────
    if (isAllCapsTitle(line) && currentTitle === null) {
      // Preamble-level title (before any section is open)
      const next = lines[i + 1]?.trim() || ''
      if (isSeparatorLine(next) || next === '') {
        saveSection()
        currentTitle = line.trim()
        contentLines = []
        if (isSeparatorLine(next)) i++ // skip separator
        continue
      }
    }

    // ── Regular content ───────────────────────────────────────────────────
    if (currentTitle !== null) {
      contentLines.push(line)
    }
    // else: still in preamble — silently drop
  }

  saveSection()
  return sections
}

// ─── Smart table cell renderer ───────────────────────────────────────────────

/**
 * Detect rating cells ("4 / 5"), contradiction cells ("Yes", "Acceptable"),
 * and render them with visual treatments.
 */
function SmartTd({ children }) {
  const raw = typeof children === 'string' ? children : String(children ?? '')
  const text = raw.trim()

  // Rating: "4/5" or "4 / 5" or "2/5"
  const ratingMatch = text.match(/^(\d)\s*\/\s*5$/)
  if (ratingMatch) {
    const val = parseInt(ratingMatch[1])
    const color =
      val >= 4 ? 'bg-emerald-500' : val === 3 ? 'bg-amber-400' : val === 2 ? 'bg-orange-400' : 'bg-red-400'
    return (
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-sm ${i <= val ? color : 'bg-zinc-100'}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-500">{val}/5</span>
        </div>
      </td>
    )
  }

  // Contradiction — positive (yes / flagged)
  if (/^(⚠️\s*)?yes\b/i.test(text) || text.startsWith('⚠')) {
    const label = text.replace(/^⚠️?\s*/i, '')
    return (
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{label || 'Flagged'}</span>
        </span>
      </td>
    )
  }

  // Contradiction — acceptable / no
  if (/^(✓\s*)?acceptable\b/i.test(text) || /^no\b/i.test(text)) {
    return (
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          {text.replace(/^✓\s*/i, '')}
        </span>
      </td>
    )
  }

  return <td className="px-4 py-3 text-sm text-zinc-600">{children}</td>
}

// ─── Markdown component map ──────────────────────────────────────────────────

function buildComponents() {
  return {
    h1: ({ children }) => (
      <h1 className="text-sm font-semibold text-zinc-900 mt-5 mb-2 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mt-4 mb-2 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold text-zinc-800 mt-3 mb-1.5 first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mt-3 mb-1">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="text-sm text-zinc-600 leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    strong: ({ children }) => {
      // Flatten children to a plain string so we can inspect the content
      const flatten = (node) => {
        if (typeof node === 'string') return node
        if (Array.isArray(node)) return node.map(flatten).join('')
        if (node?.props?.children) return flatten(node.props.children)
        return ''
      }
      const raw = flatten(children).trim()

      // Case 1: entire bold = "[BUILD] Task title here"
      const leadMatch = raw.match(/^\[([A-Z]+)\]\s+(.+)$/s)
      if (leadMatch && TASK_TAGS[leadMatch[1]]) {
        return (
          <span>
            <TaskBadge tag={leadMatch[1]} />
            <strong className="font-semibold text-zinc-900">{leadMatch[2]}</strong>
          </span>
        )
      }

      // Case 2: entire bold = "[BUILD]" alone
      const exactMatch = raw.match(/^\[([A-Z]+)\]$/)
      if (exactMatch && TASK_TAGS[exactMatch[1]]) {
        return <TaskBadge tag={exactMatch[1]} />
      }

      return <strong className="font-semibold text-zinc-900">{children}</strong>
    },
    em: ({ children }) => (
      <em className="italic text-zinc-500">{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2.5 mb-3">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2.5 mb-3">{children}</ol>
    ),
    li: ({ children }) => {
      // Check if any child is a TaskBadge (strong rendered as badge)
      const hasTag = Array.isArray(children)
        ? children.some(c => c?.props?.tag || (typeof c === 'object' && c?.props?.className?.includes('rounded-md')))
        : false
      if (hasTag) {
        return (
          <li className="flex items-start gap-0 text-sm text-zinc-700 rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2.5 leading-relaxed">
            {children}
          </li>
        )
      }
      return (
        <li className="flex items-start gap-2.5 text-sm text-zinc-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
          <span className="leading-relaxed">{children}</span>
        </li>
      )
    },
    code: ({ inline, children }) =>
      inline ? (
        <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-xs border border-zinc-200">
          {children}
        </code>
      ) : (
        <span className="font-mono text-xs text-zinc-600">{children}</span>
      ),
    pre: ({ children }) => <div className="mb-3">{children}</div>,
    blockquote: ({ children }) => (
      <div className="my-3 pl-4 border-l-2 border-zinc-200 py-1">
        <div className="text-sm text-zinc-500 italic">{children}</div>
      </div>
    ),
    hr: () => <div className="border-t border-zinc-100 my-4" />,
    // ── Tables ─────────────────────────────────────────────────────────────
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4 rounded-lg border border-zinc-200 shadow-sm">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-zinc-900 text-white">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-zinc-100">{children}</tbody>,
    tr: ({ children }) => (
      <tr className="hover:bg-zinc-50/70 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
        {children}
      </th>
    ),
    td: ({ children }) => <SmartTd>{children}</SmartTd>,
  }
}

// ─── Markdown component map (module-level — built once at import time) ────────

const MARKDOWN_COMPONENTS = buildComponents()

// ─── Main component ──────────────────────────────────────────────────────────

function StreamedReport({ text, isStreaming }) {
  if (!text) return null

  const sections = useMemo(() => splitSections(text), [text])

  // Still accumulating — no sections parsed yet, show streaming preview
  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">Generating analysis…</p>
        <div className="text-sm text-zinc-500 leading-relaxed">
          {text.split('\n').slice(-4).join(' ')}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const cfg = SECTION_CONFIG[section.title] ?? {
          label: section.title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
          sublabel: '',
          icon: Target,
          number: String(i + 1).padStart(2, '0'),
          headerClass: 'bg-zinc-800',
          pillClass: 'bg-zinc-100 text-zinc-600',
          accentClass: 'border-l-zinc-400',
        }
        const Icon = cfg.icon

        return (
          <div
            key={i}
            id={`report-section-${i}`}
            className={`rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm border-l-4 ${cfg.accentClass}`}
          >
            {/* Section header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.pillClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${cfg.pillClass}`}>
                      {cfg.number}
                    </span>
                    <h2 className="text-sm font-semibold text-zinc-900">{cfg.label}</h2>
                  </div>
                  {cfg.sublabel && (
                    <p className="text-[11px] text-zinc-400 mt-0.5">{cfg.sublabel}</p>
                  )}
                </div>
              </div>
              {isStreaming && i === sections.length - 1 && (
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Generating
                </span>
              )}
            </div>

            {/* Section content */}
            <div className="px-5 py-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {section.content}
              </ReactMarkdown>
              {isStreaming && i === sections.length - 1 && (
                <span className="inline-block w-0.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(StreamedReport)
