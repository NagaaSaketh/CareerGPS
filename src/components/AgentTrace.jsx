import { memo } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * AgentTrace — minimal step-by-step progress indicator during report generation.
 * Neutral language only. No AI/model branding.
 *
 * Props:
 *   events      {Array}   SSE event objects from backend stream
 *   isStreaming  {boolean} true while stream is open
 */
function AgentTrace({ events = [], isStreaming = false }) {
  // Build ordered step list from tool events
  const steps = []
  const seen = new Set()
  for (const e of events) {
    if (e.type === 'tool_start' && !seen.has(e.tool)) {
      seen.add(e.tool)
      const endEvent = events.find(x => x.type === 'tool_end' && x.tool === e.tool)
      steps.push({
        tool: e.tool,
        label: e.label,
        done: !!endEvent,
        summary: endEvent?.summary,
      })
    }
  }

  const isDone = events.some(e => e.type === 'done')
  const hasText = events.some(e => e.type === 'text_delta')

  if (steps.length === 0 && !isStreaming) return null

  return (
    <div className="py-10 flex flex-col items-center gap-6">
      {/* Step list */}
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.tool}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3"
          >
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0 animate-spin" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${step.done ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                {step.label}
              </p>
              {step.done && step.summary && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{step.summary}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Writing report step */}
        {hasText && !isDone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <Loader2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0 animate-spin" />
            <p className="text-sm text-slate-700 font-medium">Writing your report</p>
          </motion.div>
        )}
      </div>

      {/* Status label */}
      <p className="text-xs text-slate-400 tracking-wide">
        {isDone ? 'Report ready' : 'Generating your report\u2026'}
      </p>
    </div>
  )
}

export default memo(AgentTrace)
