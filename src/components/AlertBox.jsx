import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

function AlertBox({ type = 'warning', title, children }) {
  const styles = {
    warning: 'bg-amber-50/80 border-amber-200/60 text-amber-800',
    error: 'bg-red-50/80 border-red-200/60 text-red-800',
    success: 'bg-emerald-50/80 border-emerald-200/60 text-emerald-800',
    info: 'bg-blue-50/80 border-blue-200/60 text-blue-800'
  }

  const iconBg = {
    warning: 'bg-amber-100 text-amber-600',
    error: 'bg-red-100 text-red-600',
    success: 'bg-emerald-100 text-emerald-600',
    info: 'bg-blue-100 text-blue-600'
  }

  const icons = {
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
    info: Info
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border backdrop-blur-sm ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg[type]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm opacity-90 leading-relaxed">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(AlertBox)
