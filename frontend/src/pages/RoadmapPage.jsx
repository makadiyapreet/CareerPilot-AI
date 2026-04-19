import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { generateRoadmap } from '../services/api';
import Loader from '../components/Loader';
import {
  Map,
  Sparkles,
  Clock,
  Trophy,
  ExternalLink,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Target,
  BookOpen,
  Code,
  Award,
  TrendingUp,
  Rocket,
  Download,
  RotateCcw,
  Save
} from 'lucide-react';

const roles = [
  { value: 'Data Analyst', icon: '📊' },
  { value: 'Data Scientist', icon: '🔬' },
  { value: 'Machine Learning Engineer', icon: '🤖' },
  { value: 'Frontend Developer', icon: '🎨' },
  { value: 'Backend Developer', icon: '⚙️' },
  { value: 'Full Stack Developer', icon: '💻' },
  { value: 'DevOps Engineer', icon: '🚀' },
  { value: 'Cloud Engineer', icon: '☁️' },
  { value: 'Mobile Developer', icon: '📱' },
  { value: 'Data Engineer', icon: '🔧' },
  { value: 'Product Manager', icon: '📋' },
  { value: 'UI/UX Designer', icon: '✨' },
  { value: 'QA Engineer', icon: '🔍' },
  { value: 'Cybersecurity Analyst', icon: '🔒' },
  { value: 'Database Administrator', icon: '🗄️' },
  { value: 'Technical Lead', icon: '👨‍💼' },
  { value: 'Systems Architect', icon: '🏗️' },
  { value: 'Business Analyst', icon: '📈' },
  { value: 'AI/ML Engineer', icon: '🧠' },
  { value: 'Software Engineer', icon: '💡' }
];

const RoadmapStepCard = ({ step, isCompleted, onToggle, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  // Normalize resources to handle both string and object formats
  const resources = step.resources || [];
  const normalizedResources = resources.map(r => {
    if (typeof r === 'string') {
      return { name: r, url: '#', type: 'resource' };
    }
    return { name: r.name, url: r.url || '#', type: r.type || 'resource' };
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-6 top-16 w-0.5 h-full -bottom-4 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
      )}

      <div className={`relative bg-white rounded-2xl border ${isCompleted ? 'border-green-200 bg-green-50/50' : 'border-gray-100'} p-6 transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-start gap-4">
          {/* Step indicator */}
          <button
            onClick={onToggle}
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isCompleted
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                  Step {step.step}
                  {step.priority && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      step.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      step.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {step.priority}
                    </span>
                  )}
                </span>
                <h3 className={`text-lg font-bold mt-1 ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                  {step.skill}
                </h3>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Clock size={16} />
                  <span>{step.duration}</span>
                </div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {/* Milestones */}
            {expanded && step.milestones && step.milestones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Milestones</h4>
                <ul className="space-y-1">
                  {step.milestones.map((milestone, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {expanded && normalizedResources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen size={16} />
                  Learning Resources ({normalizedResources.length})
                </h4>
                <div className="grid gap-2">
                  {normalizedResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Code className="text-primary-600" size={16} />
                        </div>
                        <div>
                          <span className="text-gray-700 group-hover:text-primary-700 font-medium">{resource.name}</span>
                          {resource.type && (
                            <span className="text-xs text-gray-500 ml-2 px-2 py-0.5 bg-gray-200 rounded">
                              {resource.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-gray-400 group-hover:text-primary-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Learning tip */}
            {expanded && step.learning_tip && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                  <p className="text-sm text-primary-900">
                    <span className="font-semibold">💡 Tip:</span> {step.learning_tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState('');
  const [missingSkills, setMissingSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [completed, setCompleted] = useState({});

  // Load saved progress on mount or when targetRole changes
  useEffect(() => {
    if (targetRole) {
      const saved = localStorage.getItem(`roadmap_${targetRole}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setRoadmap(data.roadmap);
          setCompleted(data.completed || {});
          toast.info(`Loaded saved progress for ${targetRole}`);
        } catch (error) {
          console.error('Failed to load saved roadmap', error);
        }
      }
    }
  }, [targetRole]);

  const exportRoadmap = () => {
    if (!roadmap) {
      toast.error('No roadmap to export');
      return;
    }

    const exportData = {
      role: roadmap.target_role,
      description: roadmap.description,
      salary_range: roadmap.salary_range,
      total_duration: roadmap.total_estimated_weeks + ' weeks',
      progress: `${completedCount}/${totalSteps} steps completed`,
      steps: roadmap.steps.map(step => ({
        step: step.step,
        skill: step.skill,
        duration: step.duration,
        priority: step.priority,
        completed: completed[step.step] || false,
        resources: step.resources?.map(r => ({
          name: r.name || r,
          url: r.url || '#'
        })) || []
      })),
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap_${roadmap.target_role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Roadmap exported successfully!');
  };

  const clearProgress = () => {
    if (window.confirm('Are you sure you want to clear your progress?')) {
      setCompleted({});
      if (targetRole) {
        localStorage.removeItem(`roadmap_${targetRole}`);
      }
      toast.success('Progress cleared');
    }
  };

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      toast.error('Please select a target role');
      return;
    }

    setLoading(true);
    try {
      const skills = missingSkills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await generateRoadmap(targetRole, skills);

      // Check if roadmap has steps
      if (!response.data || !response.data.steps || response.data.steps.length === 0) {
        toast.warning('No roadmap available for this role. Try a different role or check available roles.');
        setRoadmap(null);
        return;
      }

      setRoadmap(response.data);
      setCompleted({});

      // Save progress to localStorage
      localStorage.setItem(`roadmap_${targetRole}`, JSON.stringify({
        roadmap: response.data,
        completed: {},
        lastUpdated: new Date().toISOString()
      }));

      toast.success(`🎉 Your ${targetRole} roadmap is ready with ${response.data.steps.length} steps!`);
    } catch (error) {
      console.error('Roadmap generation error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Generation failed';
      toast.error(errorMessage);
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (stepNum) => {
    setCompleted(prev => {
      const newCompleted = { ...prev, [stepNum]: !prev[stepNum] };

      // Save progress to localStorage
      if (roadmap && targetRole) {
        localStorage.setItem(`roadmap_${targetRole}`, JSON.stringify({
          roadmap: roadmap,
          completed: newCompleted,
          lastUpdated: new Date().toISOString()
        }));
      }

      return newCompleted;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalSteps = roadmap?.steps?.length || 0;
  const progressPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
          <Map className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Roadmap</h1>
          <p className="text-gray-500">Get a personalized learning path for your dream role</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-3">
            <Briefcase className="text-pink-600" size={20} />
            <span className="font-semibold text-gray-900">Choose Your Path</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {roles.map(role => (
                <button
                  key={role.value}
                  onClick={() => setTargetRole(role.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    targetRole === role.value
                      ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-500/10'
                      : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{role.icon}</span>
                  <span className={`text-sm font-medium ${targetRole === role.value ? 'text-pink-700' : 'text-gray-700'}`}>
                    {role.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Target size={16} className="text-gray-400" />
              Focus Skills (Optional)
            </label>
            <input
              value={missingSkills}
              onChange={(e) => setMissingSkills(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="e.g., SQL, Python, Tableau (comma-separated)"
            />
            <p className="text-sm text-gray-500 mt-2">Leave empty for a complete roadmap, or specify skills to focus on</p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !targetRole}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size="small" />
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>Generate My Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roadmap Results */}
      {roadmap && (
        <div className="space-y-6 animate-fadeIn">
          {/* Progress Header */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            {/* Action buttons */}
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={exportRoadmap}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                Export Roadmap
              </button>
              <button
                onClick={clearProgress}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                <RotateCcw size={16} />
                Clear Progress
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-pink-400" size={20} />
                  <span className="text-pink-400 text-sm font-medium">Your Learning Journey</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{roadmap.target_role}</h2>
                <div className="flex items-center gap-4 mt-3 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{roadmap.total_estimated_weeks} weeks total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target size={16} />
                    <span>{totalSteps} steps</span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="relative w-32 h-32 mx-auto md:mx-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${progressPercentage * 3.52} 352`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{progressPercentage}%</span>
                    <span className="text-xs text-gray-400">Complete</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-2">{completedCount} of {totalSteps} steps done</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {roadmap.steps?.map((step, idx) => (
              <RoadmapStepCard
                key={idx}
                step={{ ...step, step: step.step || idx + 1 }}
                isCompleted={completed[step.step || idx + 1]}
                onToggle={() => toggleComplete(step.step || idx + 1)}
                isLast={idx === roadmap.steps.length - 1}
              />
            ))}
          </div>

          {/* Completion Celebration */}
          {progressPercentage === 100 && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
              <Trophy className="mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-green-100">You've completed your learning roadmap for {roadmap.target_role}!</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-pink-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Continue Your Journey</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/interview-prep"
                className="bg-white rounded-xl p-5 border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all group"
              >
                <TrendingUp className="text-pink-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-semibold text-gray-900">Practice Interviews</h4>
                <p className="text-sm text-gray-600 mt-1">Prepare for your {roadmap.target_role} interviews</p>
              </a>
              <a
                href="/job-tracker"
                className="bg-white rounded-xl p-5 border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all group"
              >
                <Briefcase className="text-pink-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-semibold text-gray-900">Track Applications</h4>
                <p className="text-sm text-gray-600 mt-1">Manage your job applications</p>
              </a>
              <a
                href="/resume-score"
                className="bg-white rounded-xl p-5 border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all group"
              >
                <Target className="text-pink-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-semibold text-gray-900">Optimize Resume</h4>
                <p className="text-sm text-gray-600 mt-1">Score your resume for {roadmap.target_role}</p>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!roadmap && !loading && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-12 text-center border border-pink-100">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Map className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Chart Your Career Path</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Select your target role above and we'll create a personalized learning roadmap with resources, timelines, and milestones.
          </p>
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto mt-8 text-left">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-pink-600" />
              How it works
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">1.</span>
                <span>Choose from {roles.length} popular tech roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">2.</span>
                <span>Optionally specify skills you want to focus on</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">3.</span>
                <span>Get a detailed step-by-step learning path with curated resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">4.</span>
                <span>Track your progress and export your roadmap</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
