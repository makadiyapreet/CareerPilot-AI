import { useState } from 'react';
import { toast } from 'react-toastify';
import { getSkillGap } from '../services/api';
import Loader from '../components/Loader';
import ResumeUpload from '../components/ResumeUpload';
import SkillBadge from '../components/SkillBadge';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  Target,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Clipboard,
  AlertTriangle,
  Award,
  Zap
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SkillGapPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const response = await getSkillGap(resumeFile, jobDescription);
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(text);
      toast.success('Job description pasted!');
    } catch (error) {
      toast.error('Failed to paste. Please paste manually.');
    }
  };

  const chartData = result ? {
    labels: ['Matched Skills', 'Missing Skills'],
    datasets: [{
      label: 'Skills',
      data: [result.matched_skills?.length || 0, result.missing_skills?.length || 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null;

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Target className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skill Gap Analysis</h1>
          <p className="text-gray-500">Identify skills you need to learn for your target job</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <Upload className="text-purple-600" size={20} />
              <span className="font-semibold text-gray-900">Your Resume</span>
            </div>
          </div>
          <div className="p-6">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${resumeFile ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-400'}`}>
              {resumeFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-purple-500 mb-3" size={48} />
                  <p className="font-medium text-gray-900">{resumeFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Ready to analyze</p>
                  <button
                    onClick={() => setResumeFile(null)}
                    className="mt-4 text-sm text-red-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-purple-600" size={28} />
                  </div>
                  <p className="text-gray-600 mb-4">Drop your resume here or click to browse</p>
                  <ResumeUpload onFileSelect={setResumeFile} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={20} />
                <span className="font-semibold text-gray-900">Target Job Description</span>
              </div>
              <button
                onClick={handlePaste}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <Clipboard size={14} />
                Paste
              </button>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all resize-none"
              placeholder="Paste the job description for your dream role..."
            />
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !resumeFile || !jobDescription.trim()}
        className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader size="small" />
            <span>Analyzing Skills...</span>
          </>
        ) : (
          <>
            <Sparkles size={22} />
            <span>Analyze Skill Gap</span>
          </>
        )}
      </button>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {result.match_percentage}%
              </h3>
              <p className="text-gray-500 mt-2">Skills Match</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-green-600">
                {result.matched_skills?.length || 0}
              </h3>
              <p className="text-gray-500 mt-2">Skills Matched</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="text-white" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-red-600">
                {result.missing_skills?.length || 0}
              </h3>
              <p className="text-gray-500 mt-2">Skills to Learn</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Skill Coverage Comparison</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Skills Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-semibold text-gray-900">Your Matched Skills</span>
                  <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {result.matched_skills?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {result.matched_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.matched_skills.map((skill, idx) => (
                      <SkillBadge key={idx} skill={typeof skill === 'string' ? skill : skill.skill} type="matched" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No matched skills found</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-600" size={20} />
                  <span className="font-semibold text-gray-900">Skills to Learn</span>
                  <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {result.missing_skills?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {result.missing_skills?.length > 0 ? (
                  <div className="space-y-3">
                    {result.missing_skills.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Zap className="text-red-600" size={16} />
                          </div>
                          <span className="font-medium text-gray-900">{item.skill}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="mx-auto text-green-500 mb-3" size={48} />
                    <p className="text-green-600 font-medium">Perfect match! No missing skills</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Recommendations */}
          {result.course_recommendations?.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-6 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Learning Resources</h3>
                    <p className="text-sm text-gray-600">Courses and resources to bridge your skill gap</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {result.course_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-5 border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {rec.skill}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.course}</p>
                        </div>
                        <ExternalLink className="text-gray-400 group-hover:text-blue-500 transition-colors" size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-yellow-400" size={24} />
              <h3 className="text-xl font-bold">What's Next?</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/roadmap"
                className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-medium">Get Roadmap</p>
                  <p className="text-sm text-white/60">Personalized learning path</p>
                </div>
              </a>
              <a
                href="/interview-prep"
                className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target size={20} />
                </div>
                <div>
                  <p className="font-medium">Practice Interview</p>
                  <p className="text-sm text-white/60">Role-specific questions</p>
                </div>
              </a>
              <a
                href="/job-tracker"
                className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
                <div>
                  <p className="font-medium">Track Jobs</p>
                  <p className="text-sm text-white/60">Manage applications</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Target className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Your Skill Gaps</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Upload your resume and paste a job description to discover which skills you need to develop for your dream role.
          </p>
        </div>
      )}
    </div>
  );
}
