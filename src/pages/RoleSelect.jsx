import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Grid3X3, Lightbulb, ArrowRight, Code, Database,
  Palette, Megaphone, Headphones, BarChart3, CheckCircle2,
  Cpu, FlaskConical, Globe, Layers, PenTool, FileText,
  Settings, Smartphone, TestTube, Users, Wrench, Compass,
  Sparkles, Zap, Terminal, MessageSquare, Eye, GitBranch
} from 'lucide-react'
import RoleCard from '../components/RoleCard'
import {
  roleCategories,
  getRolesByCategory,
  searchRoles,
  suggestRolesByStrengths,
  strengthQuestions,
} from '../data/roleConfig'

const iconMap = {
  Code, Database, Palette, Megaphone, Headphones, BarChart3,
  Cpu, FlaskConical, Globe, Layers, PenTool, FileText,
  Settings, Smartphone, TestTube, Users, Wrench, CheckCircle2,
  Compass, Sparkles, Zap, Terminal, MessageSquare, Eye, GitBranch
}

function RoleSelect() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('browse')
  const [selectedCategory, setSelectedCategory] = useState('engineering')
  const [selectedRole, setSelectedRole] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [strengths, setStrengths] = useState([])
  const [suggestedRoles, setSuggestedRoles] = useState([])

  const handleRoleSelect = useCallback((roleId) => {
    setSelectedRole(roleId)
    sessionStorage.setItem('selectedRole', roleId)
    // Clear stale report data so the next report is generated fresh for this role
    sessionStorage.removeItem('apiReport')
    setTimeout(() => {
      navigate('/profile')
    }, 300)
  }, [navigate])

  const toggleStrength = (id) => {
    setStrengths((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const generateSuggestions = () => {
    setSuggestedRoles(suggestRolesByStrengths(strengths))
  }

  const filteredRoles = searchQuery ? searchRoles(searchQuery) : []

  const categoryList = Object.entries(roleCategories)
  const currentRoles = getRolesByCategory(selectedCategory)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-white mb-3">
          <Compass className="w-3.5 h-3.5" />
          30+ Career Paths
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Choose Your Career Path</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Select how you want to find your target role. CareerGPS adapts to any path you choose.
        </p>
      </motion.div>

      {/* Method Tabs */}
      <div className="flex p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
        {[
          { id: 'browse', label: 'Browse by Category', icon: Grid3X3 },
          { id: 'search', label: 'Search by Name', icon: Search },
          { id: 'explore', label: 'Strength Explorer', icon: Lightbulb },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMethod(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
              method === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Browse by Category */}
        {method === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap gap-2">
              {categoryList.map(([key, cat]) => {
                const Icon = iconMap[cat.icon] || Code
                const isActive = selectedCategory === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {currentRoles.map((role) => {
                  const Icon = iconMap[role.icon] || Code
                  return (
                    <motion.div
                      key={role.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <RoleCard
                        role={role.name}
                        icon={Icon}
                        description={role.description}
                        difficulty={role.difficulty}
                        salary={role.salary}
                        isSelected={selectedRole === role.id}
                        onClick={() => handleRoleSelect(role.id)}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Search by Name */}
        {method === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Type any role: 'Data Scientist', 'PM', 'Backend Dev'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            {searchQuery && (
              <div className="space-y-3">
                {filteredRoles.length > 0 ? (
                  <>
                    <p className="text-xs text-slate-500 font-medium">{filteredRoles.length} roles found</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRoles.map((role) => {
                        const Icon = iconMap[role.icon] || Code
                        return (
                          <RoleCard
                            key={role.id}
                            role={role.name}
                            icon={Icon}
                            description={role.description}
                            difficulty={role.difficulty}
                            salary={role.salary}
                            isSelected={selectedRole === role.id}
                            onClick={() => handleRoleSelect(role.id)}
                          />
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
                    <Search className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="font-medium text-amber-800 text-sm mb-1">No exact match found</h3>
                    <p className="text-xs text-amber-700">
                      Try searching for: Backend, Frontend, Data, Design, Product, QA, DevOps, etc.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-14 bg-white rounded-lg border border-slate-200">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Start typing to search for roles</p>
                <p className="text-xs text-slate-400 mt-1">Try &quot;Data Scientist&quot;, &quot;UX Designer&quot;, &quot;DevOps&quot;...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Strength Explorer */}
        {method === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">What do you enjoy?</h3>
                  <p className="text-xs text-slate-500">Select all that apply. We&apos;ll suggest roles dynamically.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {strengthQuestions.map((q) => {
                  const isSelected = strengths.includes(q.id)
                  return (
                    <button
                      key={q.id}
                      onClick={() => toggleStrength(q.id)}
                      className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {q.id === 'coding' && <Code className="w-4 h-4" />}
                        {q.id === 'data' && <Database className="w-4 h-4" />}
                        {q.id === 'design' && <Palette className="w-4 h-4" />}
                        {q.id === 'writing' && <FileText className="w-4 h-4" />}
                        {q.id === 'people' && <Users className="w-4 h-4" />}
                        {q.id === 'systems' && <Settings className="w-4 h-4" />}
                        {q.id === 'problems' && <Zap className="w-4 h-4" />}
                        {q.id === 'leading' && <BarChart3 className="w-4 h-4" />}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {q.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900 ml-auto" />}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={generateSuggestions}
                disabled={strengths.length === 0}
                className="mt-5 w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Suggest Roles for Me
                <Sparkles className="w-4 h-4 ml-2" />
              </button>
            </div>

            <AnimatePresence>
              {suggestedRoles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-600" />
                    Suggested Roles Based on Your Strengths
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedRoles.map((role) => {
                      const Icon = iconMap[role.icon] || Code
                      return (
                        <RoleCard
                          key={role.id}
                          role={role.name}
                          icon={Icon}
                          description={role.description}
                          difficulty={role.difficulty}
                          salary={role.salary}
                          isSelected={selectedRole === role.id}
                          onClick={() => handleRoleSelect(role.id)}
                        />
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoleSelect
