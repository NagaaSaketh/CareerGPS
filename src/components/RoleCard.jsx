import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'

const difficultyConfig = {
  easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  hard: { label: 'Hard', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  very_hard: { label: 'Very Hard', color: 'bg-purple-100 text-purple-700 border-purple-200' },
}

function RoleCard({ role, icon: Icon, description, difficulty, salary, isSelected, onClick }) {
  const diff = difficultyConfig[difficulty] || difficultyConfig.medium

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full h-full text-left rounded-2xl border-2 p-5 transition-all duration-300 group flex flex-col ${
        isSelected
          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-indigo-50 shadow-xl shadow-primary-500/20'
          : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-primary-300 hover:shadow-lg hover:shadow-slate-200/50'
      }`}
    >
      {isSelected && (
        <motion.div
          layoutId="selectedRing"
          className="absolute inset-0 rounded-2xl ring-2 ring-primary-500 ring-offset-2"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
          isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
          {role}
        </h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
          {salary}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium transition-all ${
          isSelected ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'
        }`}>
          Select
          <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
        </div>
      </div>
    </motion.button>
  )
}

export default RoleCard
