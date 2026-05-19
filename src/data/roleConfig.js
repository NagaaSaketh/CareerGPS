export const roles = [
  {
    id: 'backend_engineer',
    name: 'Backend Engineer',
    category: 'engineering',
    icon: 'Server',
    description: 'Build APIs, databases, and server-side logic',
    color: 'from-blue-500 to-cyan-500',
    skills: ['python', 'java', 'sql', 'rest_apis', 'git', 'docker'],
    timeline: '10-14 months',
    salary: '₹5.5 - 9 LPA',
    difficulty: 'Hard',
    callbackRate: '~3% (tier-3)',
    gaps: ['no_framework_experience', 'no_production_project', 'weak_system_design'],
    steppingStone: 'qa_automation',
  },
  {
    id: 'frontend_engineer',
    name: 'Frontend Engineer',
    category: 'engineering',
    icon: 'Layout',
    description: 'Build user interfaces and client-side experiences',
    color: 'from-cyan-500 to-blue-500',
    skills: ['javascript', 'react_or_vue', 'html_css', 'responsive_design', 'git', 'typescript'],
    timeline: '6-10 months',
    salary: '₹5 - 8.5 LPA',
    difficulty: 'Medium',
    callbackRate: '~5% (tier-3)',
    gaps: ['weak_javascript_fundamentals', 'no_component_design', 'poor_css_skills'],
    steppingStone: 'ui_designer',
  },
  {
    id: 'fullstack_engineer',
    name: 'Fullstack Engineer',
    category: 'engineering',
    icon: 'Layers',
    description: 'Build both frontend and backend systems',
    color: 'from-indigo-500 to-blue-500',
    skills: ['javascript', 'react_or_vue', 'nodejs_or_python', 'sql', 'html_css', 'git'],
    timeline: '8-12 months',
    salary: '₹6 - 8.5 LPA',
    difficulty: 'Medium',
    callbackRate: '~5% (tier-3)',
    gaps: ['frontend_weak', 'backend_weak', 'no_full_project'],
    steppingStone: 'frontend_engineer',
  },
  {
    id: 'devops_engineer',
    name: 'DevOps Engineer',
    category: 'engineering',
    icon: 'Cloud',
    description: 'Manage infrastructure, CI/CD, and cloud systems',
    color: 'from-sky-500 to-blue-500',
    skills: ['linux', 'docker', 'kubernetes', 'ci_cd', 'cloud_platforms', 'terraform'],
    timeline: '8-14 months',
    salary: '₹6 - 9 LPA',
    difficulty: 'Hard',
    callbackRate: '~4% (tier-3)',
    gaps: ['no_cloud_experience', 'weak_linux', 'no_ci_cd_practice'],
    steppingStone: 'support_engineer',
  },
  {
    id: 'mobile_developer',
    name: 'Mobile Developer',
    category: 'engineering',
    icon: 'Smartphone',
    description: 'Build iOS and Android applications',
    color: 'from-violet-500 to-purple-500',
    skills: ['kotlin_or_swift', 'flutter', 'mobile_ui', 'rest_apis', 'git', 'app_lifecycle'],
    timeline: '6-10 months',
    salary: '₹5.5 - 8.5 LPA',
    difficulty: 'Medium',
    callbackRate: '~5% (tier-3)',
    gaps: ['no_app_store_deployment', 'weak_ui_implementation', 'no_api_integration'],
    steppingStone: 'frontend_engineer',
  },
  {
    id: 'site_reliability_engineer',
    name: 'Site Reliability Engineer',
    category: 'engineering',
    icon: 'Activity',
    description: 'Ensure systems are reliable, scalable, and performant',
    color: 'from-orange-500 to-red-500',
    skills: ['linux', 'python_or_go', 'monitoring', 'cloud_platforms', 'ci_cd', 'automation'],
    timeline: '12-18 months',
    salary: '₹8 - 14 LPA',
    difficulty: 'Very Hard',
    callbackRate: '~3% (tier-3)',
    gaps: ['no_oncall_experience', 'weak_automation', 'no_incident_management'],
    steppingStone: 'devops_engineer',
  },
  // QA
  {
    id: 'qa_automation',
    name: 'QA Automation',
    category: 'qa',
    icon: 'TestTube',
    description: 'Write automated tests and ensure software quality',
    color: 'from-orange-500 to-amber-500',
    skills: ['manual_testing', 'selenium_or_playwright', 'api_testing', 'basic_programming', 'agile', 'jira'],
    timeline: '3-6 months',
    salary: '₹4.5 - 6 LPA',
    difficulty: 'Medium',
    callbackRate: '~8% (tier-3)',
    gaps: ['only_manual_testing_no_automation', 'no_programming_for_automation', 'weak_test_case_documentation'],
    steppingStone: 'support_engineer',
  },
  {
    id: 'sdet',
    name: 'SDET',
    category: 'qa',
    icon: 'Code',
    description: 'Software Development Engineer in Test',
    color: 'from-amber-500 to-yellow-500',
    skills: ['java_or_python', 'test_automation', 'api_testing', 'ci_cd', 'git', 'framework_design'],
    timeline: '6-10 months',
    salary: '₹6 - 9 LPA',
    difficulty: 'Hard',
    callbackRate: '~6% (tier-3)',
    gaps: ['weak_programming', 'no_framework_design', 'no_ci_cd_integration'],
    steppingStone: 'qa_automation',
  },
  // Data
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    category: 'data',
    icon: 'BarChart3',
    description: 'Analyze data and create business insights',
    color: 'from-emerald-500 to-teal-500',
    skills: ['sql', 'excel', 'python_or_r', 'data_visualization', 'statistics', 'business_understanding'],
    timeline: '3-6 months',
    salary: '₹4.5 - 7 LPA',
    difficulty: 'Medium',
    callbackRate: '~8% (tier-3)',
    gaps: ['weak_sql', 'no_business_context', 'poor_visualization'],
    steppingStone: 'business_analyst',
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    category: 'data',
    icon: 'Brain',
    description: 'Build ML models and solve complex data problems',
    color: 'from-teal-500 to-emerald-500',
    skills: ['python', 'statistics', 'machine_learning', 'sql', 'feature_engineering', 'git'],
    timeline: '10-18 months',
    salary: '₹7 - 12 LPA',
    difficulty: 'Hard',
    callbackRate: '~4% (tier-3)',
    gaps: ['weak_math_stats', 'no_ml_project_end_to_end', 'no_business_impact'],
    steppingStone: 'data_analyst',
  },
  {
    id: 'data_engineer',
    name: 'Data Engineer',
    category: 'data',
    icon: 'Database',
    description: 'Build data pipelines and infrastructure',
    color: 'from-green-500 to-emerald-500',
    skills: ['python', 'sql', 'etl_pipelines', 'data_warehousing', 'cloud_platforms', 'git'],
    timeline: '6-12 months',
    salary: '₹6 - 10 LPA',
    difficulty: 'Hard',
    callbackRate: '~5% (tier-3)',
    gaps: ['no_pipeline_experience', 'weak_sql', 'no_cloud_data_tools'],
    steppingStone: 'data_analyst',
  },
  {
    id: 'ml_engineer',
    name: 'ML Engineer',
    category: 'data',
    icon: 'Cpu',
    description: 'Deploy and scale machine learning systems',
    color: 'from-emerald-600 to-green-600',
    skills: ['python', 'machine_learning', 'mlops', 'docker', 'kubernetes', 'cloud'],
    timeline: '14-20 months',
    salary: '₹8 - 14 LPA',
    difficulty: 'Very Hard',
    callbackRate: '~3% (tier-3)',
    gaps: ['no_mlops_experience', 'no_model_deployment', 'weak_software_engineering'],
    steppingStone: 'data_scientist',
  },
  {
    id: 'generative_ai_engineer',
    name: 'Generative AI Engineer',
    category: 'data',
    icon: 'Sparkles',
    description: 'Build and fine-tune LLMs, diffusion models, and generative AI systems',
    color: 'from-violet-500 to-fuchsia-500',
    skills: ['python', 'transformers', 'pytorch', 'llm_fine_tuning', 'rag', 'vector_databases'],
    timeline: '14-20 months',
    salary: '₹10 - 25 LPA',
    difficulty: 'Very Hard',
    callbackRate: '~1.5% (tier-3)',
    gaps: ['weak_math', 'no_llm_project', 'no_fine_tuning_experience'],
    steppingStone: 'ml_engineer',
  },
  {
    id: 'nlp_engineer',
    name: 'NLP Engineer',
    category: 'data',
    icon: 'MessageSquare',
    description: 'Build text-processing, sentiment analysis, and language understanding systems',
    color: 'from-teal-500 to-cyan-500',
    skills: ['python', 'nlp_libraries', 'transformers', 'text_processing', 'sentiment_analysis', 'sequence_models'],
    timeline: '14-20 months',
    salary: '₹8 - 20 LPA',
    difficulty: 'Hard',
    callbackRate: '~2% (tier-3)',
    gaps: ['weak_math', 'no_nlp_project', 'no_deep_learning'],
    steppingStone: 'data_scientist',
  },
  {
    id: 'computer_vision_engineer',
    name: 'Computer Vision Engineer',
    category: 'data',
    icon: 'Eye',
    description: 'Build image recognition, object detection, and visual understanding systems',
    color: 'from-cyan-500 to-blue-500',
    skills: ['python', 'opencv', 'cnn', 'image_processing', 'pytorch', 'object_detection'],
    timeline: '14-20 months',
    salary: '₹8 - 20 LPA',
    difficulty: 'Hard',
    callbackRate: '~2% (tier-3)',
    gaps: ['weak_math', 'no_cv_project', 'no_deep_learning'],
    steppingStone: 'data_scientist',
  },
  {
    id: 'ai_research_scientist',
    name: 'AI/ML Research Scientist',
    category: 'data',
    icon: 'FlaskConical',
    description: 'Publish novel research and advance AI/ML frontiers',
    color: 'from-fuchsia-600 to-purple-700',
    skills: ['python', 'advanced_math', 'deep_learning', 'research_methodology', 'pytorch', 'statistics'],
    timeline: '18-24 months',
    salary: '₹12 - 30 LPA',
    difficulty: 'Very Hard',
    callbackRate: '~1.5% (tier-3)',
    gaps: ['weak_research_background', 'no_publications', 'weak_math_stats'],
    steppingStone: 'ml_engineer',
  },
  {
    id: 'mlops_engineer',
    name: 'MLOps Engineer',
    category: 'data',
    icon: 'GitBranch',
    description: 'Deploy, monitor, and scale ML systems in production',
    color: 'from-green-600 to-emerald-700',
    skills: ['python', 'docker', 'kubernetes', 'ci_cd', 'cloud_platforms', 'monitoring', 'model_serving'],
    timeline: '14-20 months',
    salary: '₹10 - 22 LPA',
    difficulty: 'Hard',
    callbackRate: '~2.5% (tier-3)',
    gaps: ['no_mlops_experience', 'no_cloud_experience', 'weak_devops'],
    steppingStone: 'devops_engineer',
  },
  // Engineering (Generalist + SDE)
  {
    id: 'software_developer',
    name: 'Software Developer',
    category: 'engineering',
    icon: 'Code',
    description: 'Generalist builder who ships features across the stack',
    color: 'from-blue-400 to-indigo-500',
    skills: ['javascript', 'python', 'git', 'sql', 'rest_apis', 'problem_solving'],
    timeline: '6-12 months',
    salary: '₹3.5 - 8 LPA',
    difficulty: 'Medium',
    callbackRate: '~5% (tier-3)',
    gaps: ['no_framework_experience', 'no_production_project', 'weak_system_design'],
    steppingStone: 'support_engineer',
  },
  {
    id: 'sde',
    name: 'SDE',
    category: 'engineering',
    icon: 'Terminal',
    description: 'DSA-heavy product engineer focused on scalable systems and algorithms',
    color: 'from-indigo-600 to-blue-700',
    skills: ['dsa', 'system_design', 'cpp_or_java', 'operating_systems', 'dbms', 'computer_networks'],
    timeline: '12-18 months',
    salary: '₹8 - 25 LPA',
    difficulty: 'Very Hard',
    callbackRate: '~2% (tier-3)',
    gaps: ['weak_dsa', 'no_system_design', 'no_production_code'],
    steppingStone: 'backend_engineer',
  },
  // DevRel / Content
  {
    id: 'prompt_engineer',
    name: 'Prompt Engineer',
    category: 'devrel',
    icon: 'PenTool',
    description: 'Design and optimize prompts for LLM-powered applications',
    color: 'from-pink-400 to-rose-500',
    skills: ['prompt_engineering', 'llm_basics', 'communication', 'python_basics', 'content_creation', 'critical_thinking'],
    timeline: '3-6 months',
    salary: '₹5 - 12 LPA',
    difficulty: 'Easy',
    callbackRate: '~7% (tier-3)',
    gaps: ['weak_communication', 'no_llm_experience', 'no_optimization_skills'],
    steppingStone: 'support_engineer',
  },
  // Product
  {
    id: 'product_manager',
    name: 'Product Manager',
    category: 'product',
    icon: 'Target',
    description: 'Define product strategy and drive execution',
    color: 'from-violet-500 to-purple-500',
    skills: ['communication', 'stakeholder_management', 'data_analysis', 'user_research', 'roadmapping', 'prioritization'],
    timeline: '6-10 months',
    salary: '₹6 - 10 LPA',
    difficulty: 'Medium',
    callbackRate: '~7% (tier-3)',
    gaps: ['no_ownership_examples', 'weak_data_skills', 'no_user_research'],
    steppingStone: 'business_analyst',
  },
  // Design
  {
    id: 'ux_designer',
    name: 'UX Designer',
    category: 'design',
    icon: 'Palette',
    description: 'Design user experiences and conduct research',
    color: 'from-pink-500 to-rose-500',
    skills: ['user_research', 'wireframing', 'prototyping', 'usability_testing', 'design_tools', 'communication'],
    timeline: '4-8 months',
    salary: '₹4.5 - 7.5 LPA',
    difficulty: 'Medium',
    callbackRate: '~6% (tier-3)',
    gaps: ['weak_portfolio', 'no_research_process', 'no_usability_testing'],
    steppingStone: 'ui_designer',
  },
  {
    id: 'ui_designer',
    name: 'UI Designer',
    category: 'design',
    icon: 'Paintbrush',
    description: 'Design visual interfaces and design systems',
    color: 'from-rose-500 to-pink-500',
    skills: ['visual_design', 'design_tools', 'typography', 'color_theory', 'layout', 'design_systems'],
    timeline: '3-6 months',
    salary: '₹4 - 6.5 LPA',
    difficulty: 'Easy',
    callbackRate: '~10% (tier-3)',
    gaps: ['weak_portfolio', 'no_design_system_knowledge', 'poor_typography'],
    steppingStone: 'ux_designer',
  },
  // DevRel
  {
    id: 'devrel',
    name: 'DevRel',
    category: 'devrel',
    icon: 'Mic',
    description: 'Build developer communities and create content',
    color: 'from-amber-500 to-yellow-500',
    skills: ['strong_communication', 'technical_writing', 'developer_community', 'content_creation', 'basic_coding', 'public_speaking'],
    timeline: '2-4 months',
    salary: '₹5 - 8 LPA',
    difficulty: 'Medium',
    callbackRate: '~7% (tier-3)',
    gaps: ['no_content_portfolio', 'weak_technical_depth', 'no_community_engagement'],
    steppingStone: 'technical_writer',
  },
  {
    id: 'technical_writer',
    name: 'Technical Writer',
    category: 'devrel',
    icon: 'FileText',
    description: 'Write documentation and technical content',
    color: 'from-yellow-500 to-amber-500',
    skills: ['technical_writing', 'documentation', 'communication', 'research', 'markdown', 'basic_technical_knowledge'],
    timeline: '2-3 months',
    salary: '₹4.5 - 7 LPA',
    difficulty: 'Easy',
    callbackRate: '~9% (tier-3)',
    gaps: ['weak_writing_samples', 'no_technical_understanding', 'poor_structure'],
    steppingStone: 'support_engineer',
  },
  {
    id: 'solutions_engineer',
    name: 'Solutions Engineer',
    category: 'devrel',
    icon: 'Handshake',
    description: 'Bridge technical and sales teams',
    color: 'from-yellow-600 to-amber-600',
    skills: ['communication', 'technical_presales', 'api_knowledge', 'problem_solving', 'client_management', 'demo_building'],
    timeline: '6-8 months',
    salary: '₹6 - 10 LPA',
    difficulty: 'Medium',
    callbackRate: '~6% (tier-3)',
    gaps: ['weak_technical_depth', 'poor_communication', 'no_client_facing_experience'],
    steppingStone: 'support_engineer',
  },
  // Support
  {
    id: 'support_engineer',
    name: 'Support Engineer',
    category: 'support',
    icon: 'Headphones',
    description: 'Help customers solve technical problems',
    color: 'from-cyan-500 to-sky-500',
    skills: ['basic_troubleshooting', 'communication', 'sql_basics', 'api_basics', 'ticket_management', 'customer_empathy'],
    timeline: '1-2 months',
    salary: '₹3.5 - 5.5 LPA',
    difficulty: 'Easy',
    callbackRate: '~12% (tier-3)',
    gaps: ['poor_communication', 'no_technical_aptitude', 'no_empathy'],
    steppingStone: 'business_analyst',
  },
  // Business
  {
    id: 'business_analyst',
    name: 'Business Analyst',
    category: 'business',
    icon: 'Briefcase',
    description: 'Analyze business processes and requirements',
    color: 'from-indigo-500 to-blue-500',
    skills: ['communication', 'requirements_gathering', 'data_analysis', 'process_modeling', 'stakeholder_management', 'excel'],
    timeline: '2-4 months',
    salary: '₹4.5 - 7 LPA',
    difficulty: 'Easy',
    callbackRate: '~10% (tier-3)',
    gaps: ['weak_communication', 'no_analytical_thinking', 'poor_documentation'],
    steppingStone: 'data_analyst',
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    category: 'business',
    icon: 'ClipboardList',
    description: 'Plan and execute projects across teams',
    color: 'from-blue-600 to-indigo-600',
    skills: ['communication', 'stakeholder_management', 'risk_management', 'scheduling', 'budgeting', 'agile'],
    timeline: '6-10 months',
    salary: '₹6 - 10 LPA',
    difficulty: 'Medium',
    callbackRate: '~7% (tier-3)',
    gaps: ['no_ownership_examples', 'weak_leadership', 'no_risk_management'],
    steppingStone: 'business_analyst',
  },
]

export const categories = [
  { id: 'engineering', name: 'Engineering', icon: 'Code', color: 'from-blue-500 to-cyan-500' },
  { id: 'qa', name: 'QA / Testing', icon: 'TestTube', color: 'from-orange-500 to-amber-500' },
  { id: 'data', name: 'Data', icon: 'Database', color: 'from-emerald-500 to-teal-500' },
  { id: 'product', name: 'Product', icon: 'Target', color: 'from-violet-500 to-purple-500' },
  { id: 'design', name: 'Design', icon: 'Palette', color: 'from-pink-500 to-rose-500' },
  { id: 'devrel', name: 'DevRel / Content', icon: 'Mic', color: 'from-amber-500 to-yellow-500' },
  { id: 'support', name: 'Support', icon: 'Headphones', color: 'from-cyan-500 to-sky-500' },
  { id: 'business', name: 'Business', icon: 'Briefcase', color: 'from-indigo-500 to-blue-500' },
]

export const roleCategories = {
  engineering: { label: 'Engineering', icon: 'Code', color: 'bg-blue-500' },
  qa: { label: 'QA / Testing', icon: 'TestTube', color: 'bg-orange-500' },
  data: { label: 'Data', icon: 'Database', color: 'bg-emerald-500' },
  product: { label: 'Product', icon: 'Target', color: 'bg-violet-500' },
  design: { label: 'Design', icon: 'Palette', color: 'bg-pink-500' },
  devrel: { label: 'DevRel / Content', icon: 'Mic', color: 'bg-amber-500' },
  support: { label: 'Support', icon: 'Headphones', color: 'bg-cyan-500' },
  business: { label: 'Business', icon: 'Briefcase', color: 'bg-indigo-500' },
}

export const locationOptions = [
  { value: 'pune', label: 'Pune' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi_ncr', label: 'Delhi NCR' },
  { value: 'remote', label: 'Remote' },
  { value: 'tier_2', label: 'Tier 2 City' },
]

export const internshipTypes = [
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing / QA' },
  { value: 'support', label: 'Support' },
  { value: 'data', label: 'Data / Analytics' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
]

export const getRoleById = (id) => roles.find((r) => r.id === id)

export const getRolesByCategory = (categoryId) =>
  roles.filter((r) => r.category === categoryId)

export const getSuggestedRoles = (strengths) => {
  const suggestions = new Set()

  if (strengths.coding && strengths.systems) {
    suggestions.add('backend_engineer')
    suggestions.add('devops_engineer')
    suggestions.add('site_reliability_engineer')
    suggestions.add('sde')
  }
  if (strengths.coding && strengths.design) {
    suggestions.add('frontend_engineer')
    suggestions.add('mobile_developer')
    suggestions.add('fullstack_engineer')
    suggestions.add('software_developer')
  }
  if (strengths.data && strengths.coding) {
    suggestions.add('data_scientist')
    suggestions.add('data_engineer')
    suggestions.add('ml_engineer')
    suggestions.add('generative_ai_engineer')
    suggestions.add('nlp_engineer')
    suggestions.add('computer_vision_engineer')
    suggestions.add('mlops_engineer')
    suggestions.add('ai_research_scientist')
  }
  if (strengths.data && !strengths.coding) {
    suggestions.add('data_analyst')
    suggestions.add('business_analyst')
  }
  if (strengths.design && !strengths.coding) {
    suggestions.add('ux_designer')
    suggestions.add('ui_designer')
  }
  if (strengths.writing && strengths.coding) {
    suggestions.add('devrel')
    suggestions.add('technical_writer')
    suggestions.add('prompt_engineer')
  }
  if (strengths.coding && !strengths.systems && !strengths.design && !strengths.data) {
    suggestions.add('software_developer')
  }
  if (strengths.people && strengths.problems && !strengths.coding) {
    suggestions.add('product_manager')
    suggestions.add('solutions_engineer')
    suggestions.add('project_manager')
  }
  if (strengths.people && !strengths.coding && !strengths.problems) {
    suggestions.add('support_engineer')
    suggestions.add('business_analyst')
  }
  if (strengths.coding && strengths.problems && !strengths.systems) {
    suggestions.add('qa_automation')
    suggestions.add('sdet')
  }

  return Array.from(suggestions).slice(0, 6)
}

export const searchRoles = (query) => {
  if (!query) return []
  const q = query.toLowerCase()
  return roles.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
  )
}

export const suggestRolesByStrengths = (strengths) => {
  const strengthsObj = {}
  strengths.forEach((s) => (strengthsObj[s] = true))
  const ids = getSuggestedRoles(strengthsObj)
  return ids.map((id) => getRoleById(id))
}

export const strengthQuestions = [
  { id: 'coding', label: 'Building things with code' },
  { id: 'data', label: 'Working with data & insights' },
  { id: 'design', label: 'Designing interfaces & experiences' },
  { id: 'writing', label: 'Writing & communicating ideas' },
  { id: 'people', label: 'Helping & working with people' },
  { id: 'systems', label: 'Setting up systems & infrastructure' },
  { id: 'problems', label: 'Solving complex problems' },
  { id: 'leading', label: 'Leading projects & teams' },
]

export const getDynamicReport = (roleId, profileData) => {
  const role = getRoleById(roleId)
  let { collegeTier, cgpa, experience, skills = {}, projects = 0, deployed = false } = profileData

  // Fallback: if no skills were rated, seed with the role's skills at default value 1
  // so the skill assessment table always has data to show
  if (Object.keys(skills).length === 0 && role) {
    skills = Object.fromEntries(role.skills.map((s) => [s, 1]))
  }

  // Calculate readiness score
  const skillValues = Object.values(skills)
  const avgSkill = skillValues.length > 0 ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length : 2
  const projectBonus = deployed ? 1.5 : projects > 0 ? 0.5 : 0
  const tierPenalty = collegeTier === 'tier_3' ? -0.5 : collegeTier === 'tier_2' ? -0.2 : 0
  const cgpaBonus = cgpa >= 8 ? 0.5 : cgpa >= 7 ? 0.2 : -0.3
  const experienceBonus = experience > 6 ? 0.5 : 0

  const readiness = Math.min(5, Math.max(1, avgSkill + projectBonus + tierPenalty + cgpaBonus + experienceBonus))

  // Determine path type and message
  let pathType = 'direct'
  let pathLabel = 'Direct Path'
  let pathColor = 'bg-emerald-50 border-emerald-200 text-emerald-800'
  let pathMessage = `Your profile shows strong potential for ${role.name}. Focus on closing specific skill gaps.`

  if (readiness < 2) {
    pathType = 'stepping_stone'
    pathLabel = 'Stepping Stone Recommended'
    pathColor = 'bg-amber-50 border-amber-200 text-amber-800'
    const ssRole = getRoleById(role.steppingStone)
    pathMessage = `Your current profile needs building. Consider ${ssRole.name} first (higher callback rate: ${ssRole.callbackRate}), then transition to ${role.name}.`
  } else if (readiness < 3 && role.category === 'data') {
    pathType = 'stepping_stone'
    pathLabel = 'Stepping Stone Recommended'
    pathColor = 'bg-amber-50 border-amber-200 text-amber-800'
    const ssRole = getRoleById(role.steppingStone)
    pathMessage = `Data roles require strong foundations. ${ssRole.name} is a strategic entry point with faster hiring.`
  }

  // Parse market data
  const callbackMatch = role.callbackRate.match(/~?(\d+(?:\.\d+)?)%/)
  const callbackRateNum = callbackMatch ? parseFloat(callbackMatch[1]) / 100 : 0.05

  const timelineMatch = role.timeline.match(/(\d+)(?:-(\d+))?/)
  const timelineNum = timelineMatch
    ? Math.round((parseInt(timelineMatch[1]) + parseInt(timelineMatch[2] || timelineMatch[1])) / 2)
    : 12

  // Build skills report
  const reportSkills = {}
  Object.entries(skills).forEach(([skill, val]) => {
    let evidence = val
    if (projects === 0) evidence = Math.max(1, val - 2)
    else if (!deployed) evidence = Math.max(1, val - 1)

    const gaps = []
    if (val <= 2) gaps.push(`Weak ${skill.replace(/_/g, ' ')}`)
    if (val <= 1) gaps.push(`No ${skill.replace(/_/g, ' ')} demonstrated`)

    reportSkills[skill] = { self: val, evidence, gaps }
  })

  // Find contradictions
  const contradictions = []
  Object.entries(skills).forEach(([skill, val]) => {
    if (val >= 4 && projects === 0) {
      contradictions.push({
        skill,
        self: val,
        evidence: 1,
        message: `You rated ${skill.replace(/_/g, ' ')} ${val}/5 but have no projects to prove it.`,
      })
    }
  })

  // Critical gaps
  const criticalGaps = readiness < 2.5
    ? role.gaps.slice(0, 3).map((g) => g.replace(/_/g, ' '))
    : []

  // Weak skills for tasks
  const weakSkills = Object.entries(skills)
    .filter(([_, val]) => val <= 2)
    .map(([skill]) => skill)
    .slice(0, 2)

  const tasks = [
    {
      number: 1,
      title: weakSkills.length > 0 ? `Master ${weakSkills[0].replace(/_/g, ' ')}` : 'Build core fundamentals',
      description: weakSkills.length > 0
        ? `Focus on ${weakSkills[0].replace(/_/g, ' ')} - it's your biggest gap for ${role.name}.`
        : 'Strengthen your weakest skill area.',
      expected: 'Working example + notes',
      completed: false,
    },
    {
      number: 2,
      title: 'Build portfolio evidence',
      description: `Create a project that demonstrates core ${role.name} skills`,
      expected: 'GitHub repo + README',
      completed: false,
    },
    {
      number: 3,
      title: 'Apply to 3 roles',
      description: `Even if not 100% ready, apply to ${role.name} positions for real feedback.`,
      expected: '3 applications sent',
      completed: false,
    },
  ]

  // Build paths
  const paths = [
    {
      type: role.name,
      timeline: timelineNum,
      salary: role.salary,
      probability: Math.min(0.95, callbackRateNum + readiness / 10),
      reasoning: pathMessage,
      risks: role.gaps.slice(0, 3).map((g) => g.replace(/_/g, ' ')),
    },
  ]

  if (readiness < 2 || (readiness < 3 && role.category === 'data')) {
    const ssRole = getRoleById(role.steppingStone)
    const ssCallbackMatch = ssRole.callbackRate.match(/~?(\d+(?:\.\d+)?)%/)
    const ssCallbackRate = ssCallbackMatch ? parseFloat(ssCallbackMatch[1]) / 100 : 0.05
    const ssTimelineMatch = ssRole.timeline.match(/(\d+)(?:-(\d+))?/)
    const ssTimelineNum = ssTimelineMatch
      ? Math.round((parseInt(ssTimelineMatch[1]) + parseInt(ssTimelineMatch[2] || ssTimelineMatch[1])) / 2)
      : 12

    paths.push({
      type: ssRole.name,
      timeline: ssTimelineNum,
      salary: ssRole.salary,
      probability: Math.min(0.95, ssCallbackRate + readiness / 10),
      reasoning: `Start with ${ssRole.name} to build foundational skills and gain market credibility before transitioning to ${role.name}.`,
      risks: ssRole.gaps.slice(0, 3).map((g) => g.replace(/_/g, ' ')),
    })
  }

  return {
    title: role.name,
    skills: reportSkills,
    contradictions,
    criticalGaps,
    salary: role.salary,
    callbackRate: callbackRateNum,
    timeline: timelineNum,
    difficulty: role.difficulty,
    paths,
    tasks,
  }
}
