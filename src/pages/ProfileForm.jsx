import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap,
  MapPin,
  Briefcase,
  Github,
  FileText,
  Star,
  CheckCircle2,
  Zap,
  BookOpen,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";
import {
  getRoleById,
  locationOptions,
  internshipTypes,
} from "../data/roleConfig";
import { uploadResume, saveProfile } from "../services/api";
import { getSession } from "../services/auth";
import AuthModal from "../components/AuthModal";

const Toast = memo(function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -12, x: '-50%' }}
      className={`fixed top-4 left-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border text-sm font-medium ${
        type === 'error'
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
})

function ProfileForm() {
  const navigate = useNavigate();
  const selectedRoleId = sessionStorage.getItem("selectedRole");
  const role = getRoleById(selectedRoleId);

  // Redirect if no role selected
  useEffect(() => {
    if (!selectedRoleId) {
      navigate("/select-role");
    }
  }, [selectedRoleId, navigate]);

  const [step, setStep] = useState(1);
  const experienceOptions = [
    { value: "fresher", label: "Fresher / No Prior Experience", months: 0 },
    { value: "less_than_1", label: "Less than 1 year", months: 6 },
    { value: "1_to_2", label: "1–2 years", months: 18 },
    { value: "2_to_4", label: "2–4 years", months: 36 },
    { value: "4_to_6", label: "4–6 years", months: 60 },
    { value: "6_to_8", label: "6–8 years", months: 84 },
    { value: "8_plus", label: "8+ years", months: 96 },
  ];

  const [formData, setFormData] = useState({
    collegeTier: "tier_3",
    location: "chennai",
    experience: "fresher",
    cgpa: 7.2,
    skills: {},
    githubUrl: "",
    hasInternship: false,
    internshipType: "development",
    projects: 2,
    deployed: false,
    resumeText: "",
  });

  // Initialize skill ratings dynamically based on selected role
  useEffect(() => {
    const initialSkills = {};
    role.skills.forEach((s) => (initialSkills[s] = 2));
    setFormData((prev) => ({ ...prev, skills: initialSkills }));
  }, [selectedRoleId]);

  // Check auth state on mount
  useEffect(() => {
    getSession().then((session) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const updateSkill = (skill, value) => {
    setFormData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value },
    }));
  };

  const [loading, setLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // GitHub validation state
  const [githubValidating, setGithubValidating] = useState(false);
  const [githubInfo, setGithubInfo] = useState(null); // { username, public_repos, valid }

  const validateGithubUrl = async (url) => {
    if (!url?.trim()) { setGithubInfo(null); return; }
    const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)/);
    if (!match) { setGithubInfo({ valid: false }); return; }
    const username = match[1];
    setGithubValidating(true);
    setGithubInfo(null);
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) { setGithubInfo({ valid: false }); return; }
      const data = await res.json();
      setGithubInfo({ valid: true, username: data.login, public_repos: data.public_repos });
    } catch {
      setGithubInfo({ valid: false });
    } finally {
      setGithubValidating(false);
    }
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const validateStep = (stepNum) => {
    const missing = [];
    if (stepNum === 1) {
      if (!formData.collegeTier) missing.push('College Tier');
      if (!formData.location) missing.push('Preferred Location');
      if (!formData.experience) missing.push('Work Experience');
      if (formData.cgpa === '' || formData.cgpa === undefined || formData.cgpa === null || formData.cgpa <= 0) missing.push('CGPA / Percentage');
    }
    if (stepNum === 2) {
      const unrated = role.skills.filter((s) => !formData.skills[s] || formData.skills[s] < 1);
      if (unrated.length > 0) missing.push(`${unrated.length} skill rating(s)`);
    }
    if (stepNum === 3) {
      if (!formData.githubUrl.trim() && !formData.resumeText.trim()) {
        missing.push('GitHub URL or Resume upload');
      }
      if (formData.projects === '' || formData.projects === undefined || formData.projects === null || formData.projects < 0) {
        missing.push('Projects on Resume');
      }
    }
    return missing;
  };

  const goToStep = (nextStep) => {
    const missing = validateStep(step);
    if (missing.length > 0) {
      showToast(`Please fill: ${missing.join(', ')}`);
      return;
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    const missing = validateStep(3);
    if (missing.length > 0) {
      showToast(`Please fill: ${missing.join(', ')}`);
      return;
    }

    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Save formData for the Report page to stream the agentic analysis
      sessionStorage.setItem('lastProfileFormData', JSON.stringify(formData))
      // Persist profile to Supabase (fire-and-forget — don't block navigation)
      saveProfile(formData, selectedRoleId).catch(err => {
        console.warn('[ProfileForm] saveProfile failed (non-blocking):', err)
      })
      // Navigate immediately — Report page handles generation
      navigate("/report");
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Basic Info", icon: User },
    { number: 2, label: "Skills", icon: Star },
    { number: 3, label: "Experience", icon: Briefcase },
  ];

  const roleDisplay = role.name;

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <button
        onClick={() => navigate("/select-role")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Role Selection
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-white mb-2">
          <Star className="w-3.5 h-3.5" />
          {roleDisplay}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Be honest. The system validates everything against real market data.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors ${
                step >= s.number ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.number ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className={`text-xs font-semibold ${step >= s.number ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-200 mx-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: step > s.number ? "100%" : "0%" }}
                  className="h-full bg-slate-900"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Education & Background</h3>
                  <p className="text-xs text-slate-500">These factors significantly impact callback rates</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  College Tier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.collegeTier}
                  onChange={(e) =>
                    setFormData({ ...formData, collegeTier: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="tier_3">Tier 3 (Private / Unknown)</option>
                  <option value="tier_2">Tier 2 (State / Recognized Private)</option>
                  <option value="tier_1">Tier 1 (IIT / NIT / BITS)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tier-3 colleges see ~3% callback rates vs 25% for Tier-1.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  Preferred Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  Work Experience <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {experienceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  CGPA / Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={formData.cgpa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cgpa: e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <button
              onClick={() => goToStep(2)}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
            >
              Next: Skills Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> The system validates these against your GitHub and projects.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Skill Ratings for {roleDisplay} <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500">Rate yourself honestly (1-5) on each skill</p>
                </div>
              </div>

              {role.skills.map((skill) => (
                <div key={skill} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 capitalize">
                      {skill.replace(/_/g, " ")}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {formData.skills[skill] || 2}
                      </span>
                      <span className="text-[11px] text-slate-400">/ 5</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.skills[skill] || 2}
                    onChange={(e) => updateSkill(skill, parseInt(e.target.value))}
                    className="w-full accent-slate-900 h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
              >
                Back
              </button>
              <button
                onClick={() => goToStep(3)}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                Next: Experience
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Experience & Projects */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Evidence & Projects</h3>
                  <p className="text-xs text-slate-500">Your proof of skills matters more than claims</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  GitHub Profile URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  onBlur={(e) => validateGithubUrl(e.target.value)}
                  className={`w-full h-10 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    githubInfo?.valid === false ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {githubValidating && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking GitHub profile…
                  </p>
                )}
                {githubInfo?.valid === true && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span><strong>@{githubInfo.username}</strong> verified · {githubInfo.public_repos} public repos found</span>
                  </p>
                )}
                {githubInfo?.valid === false && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Could not find a public GitHub profile at this URL. Check the username.
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                  Upload Your Resume <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.docx"
                    disabled={resumeUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setResumeUploading(true);
                      try {
                        const result = await uploadResume(file);
                        setFormData((prev) => ({
                          ...prev,
                          resumeText: result.resume_text,
                          _resumeFileName: result.filename,
                        }));
                        showToast(`Resume parsed: ${result.word_count} words`, 'success');
                      } catch (err) {
                        if (err.message === 'Failed to fetch') {
                          showToast('Upload failed: Backend not reachable. Make sure the server is running on port 8000.');
                        } else {
                          showToast(`Upload failed: ${err.message}`);
                        }
                      } finally {
                        setResumeUploading(false);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex flex-col items-center justify-center gap-1.5 w-full p-5 rounded-md border-2 border-dashed transition-colors ${
                      resumeUploading
                        ? "border-slate-300 bg-slate-50/50 cursor-wait"
                        : formData.resumeText
                        ? "border-emerald-300 bg-emerald-50/50 cursor-pointer"
                        : "border-slate-300 bg-slate-50/50 hover:border-slate-400 cursor-pointer"
                    }`}
                  >
                    {resumeUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        <span className="text-sm font-medium text-slate-600">Parsing resume…</span>
                        <span className="text-xs text-slate-400">Extracting skills and projects</span>
                      </>
                    ) : formData._resumeFileName ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">{formData._resumeFileName}</span>
                        <span className="text-xs text-emerald-600">
                          {formData.resumeText?.split(/\s+/).filter(Boolean).length} words extracted
                        </span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Click to upload resume</span>
                        <span className="text-xs text-slate-400">PDF or DOCX only</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The system extracts skills, tools, and project signals from your resume.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  id="internship"
                  checked={formData.hasInternship}
                  onChange={(e) =>
                    setFormData({ ...formData, hasInternship: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                />
                <label htmlFor="internship" className="text-sm text-slate-700 font-medium">
                  I have internship experience
                </label>
              </div>

              <AnimatePresence>
                {formData.hasInternship && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                      Internship Type
                    </label>
                    <select
                      value={formData.internshipType}
                      onChange={(e) =>
                        setFormData({ ...formData, internshipType: e.target.value })
                      }
                      className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {internshipTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-0.5 block">
                  Projects on Your Resume <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  How many projects would you show a recruiter? (e.g., projects listed in your resume or GitHub)
                </p>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.projects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projects: e.target.value === '' ? '' : parseInt(e.target.value),
                    })
                  }
                  className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                {githubInfo?.valid === true && (() => {
                  const repos = githubInfo.public_repos;
                  const claimed = parseInt(formData.projects) || 0;
                  if (claimed > repos) {
                    return (
                      <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        You claimed {claimed} projects but only {repos} public repos found on GitHub. Recruiters may notice.
                      </p>
                    );
                  }
                  return (
                    <p className="text-[11px] text-slate-400 mt-1">
                      GitHub shows {repos} public repos — {claimed} selected for resume.
                    </p>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  id="deployed"
                  checked={formData.deployed}
                  onChange={(e) =>
                    setFormData({ ...formData, deployed: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                />
                <label htmlFor="deployed" className="text-sm text-slate-700 font-medium">
                  Any of these projects deployed / live online?
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                <strong>Backend unavailable.</strong> Falling back to local report generation.
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-60 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    Next: Generate Report
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setIsLoggedIn(true)}
      />
    </div>
  );
}

export default ProfileForm;
