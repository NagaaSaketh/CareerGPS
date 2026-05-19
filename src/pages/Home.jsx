import { Link, useNavigate } from 'react-router-dom'
import { Compass, Target, TrendingUp, Shield, Brain, ArrowRight, Users, BarChart3, Route, Sparkles, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { getSession } from '../services/auth'

function Home() {
  const navigate = useNavigate()

  // Home page is accessible to everyone — no forced redirect
  const features = [
    {
      icon: Brain,
      title: 'Evidence-Based Assessment',
      description: 'Never trusts self-reported ratings. Validates against GitHub, resume, and diagnostic tasks.',
    },
    {
      icon: Target,
      title: 'Real Market Data',
      description: 'Grounded in current job descriptions, salary ranges, and callback rates from top job boards.',
    },
    {
      icon: Route,
      title: 'Three Paths, Not One',
      description: 'Three routes — direct, stepping-stone, and alternative — with honest timelines and success probabilities adjusted for credential bias.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Distinguishes compliance from real progress. Tracks what actually gets you hired.',
    },
    {
      icon: Shield,
      title: 'Honest & Accountable',
      description: 'Brutally honest about gaps, but clear about how to close them. No false reassurance.',
    },
    {
      icon: Users,
      title: 'No College Bias',
      description: 'Honest paths based on your skills, not your college name.',
    }
  ]

  const stats = [
    { value: '10M+', label: 'Graduates/Year' },
    { value: '<50%', label: 'Considered Employable' },
    { value: '~29%', label: 'Graduate Unemployment' },
    { value: '30+', label: 'Career Paths' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-10 md:py-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Career Strategy</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 leading-tight tracking-tight"
          >
            Navigate Your Career
            <br />
            <span className="text-slate-500">With Evidence</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            CareerGPS is an AI-powered career navigation system built for every graduate.
            Honest assessment. Real market data. Accountable execution.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/select-role"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Find Your Path
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/yourusername/careergps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 text-sm font-medium rounded-md border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-colors"
            >
              View on GitHub
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-5 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-slate-900 mb-3"
          >
            Why CareerGPS?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-lg mx-auto"
          >
            Every existing solution fails graduates the same way. Here is how we fix it.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="group"
            >
              <div className="p-5 bg-white rounded-lg border border-slate-200 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center mb-3">
                  <feature.icon className="w-4.5 h-4.5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 md:p-10 shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Three simple steps to get your evidence-based career report.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Choose Your Path', desc: 'Browse 30+ roles, search by name, or use our strength explorer to find your match.' },
            { step: '02', title: 'Build Your Profile', desc: 'Enter your background, rate your skills, and share your GitHub. Be honest — we validate everything.' },
            { step: '03', title: 'Get Your Report', desc: 'Receive an honest assessment, market reality check, and 3 actionable tasks for this week.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-full">
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Supported Roles */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Supported Career Paths</h2>
          <p className="text-slate-500 max-w-lg mx-auto">From Engineering to Design to Business — CareerGPS adapts dynamically.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Backend Engineer', 'Frontend Engineer', 'Data Scientist', 'UX Designer',
            'Product Manager', 'DevOps Engineer', 'ML Engineer', 'QA Automation',
            'Technical Writer', 'Business Analyst', 'Mobile Developer', 'Solutions Engineer'
          ].map((role, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors cursor-default"
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-14 bg-slate-900 rounded-xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Find Your Path?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Choose from 30+ career paths, get an honest assessment, and receive a clear weekly plan.
          </p>
          <Link
            to="/select-role"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
