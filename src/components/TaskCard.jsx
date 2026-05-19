import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Circle } from 'lucide-react'

function TaskCard({ number, title, description, expected, completed = false }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
        completed
          ? 'border-accent-green bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
          : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-primary-300 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          completed ? 'bg-gradient-to-br from-accent-green to-emerald-500 text-white' : 'bg-gradient-to-br from-primary-100 to-indigo-100 text-primary-600'
        }`}>
          {completed ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold">{number}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold mb-1 ${completed ? 'text-green-800' : 'text-slate-900'}`}>
            {title}
          </h4>
          <p className="text-sm text-slate-500 mb-2">{description}</p>
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 font-medium">{expected}</span>
          </div>
        </div>
        {!completed && (
          <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.div>
  )
}

export default memo(TaskCard)
