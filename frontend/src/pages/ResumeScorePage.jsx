import { useState } from 'react';
import { toast } from 'react-toastify';
import { scoreResume } from '../services/api';
import Loader from '../components/Loader';
import ResumeUpload from '../components/ResumeUpload';
import SkillBadge from '../components/SkillBadge';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Clipboard,
  Award
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResumeScorePage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScore = async () => {
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
      const response = await scoreResume(resumeFile, jobDescription);
      setResult(response.data);
      toast.success('Resume scored!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Scoring failed');
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

  const getScoreColor = (score) => {
    if (score >= 70) return { bg: '#22c55e', text: 'text-green-600', label: 'Excellent' };
    if (score >= 50) return { bg: '#eab308', text: 'text-yellow-600', label: 'Good' };
    return { bg: '#ef4444', text: 'text-red-600', label: 'Needs Work' };
  };

  const chartData = result ? {
    labels: ['Score', 'Gap'],
    datasets: [{
      data: [result.resume_score, 100 - result.resume_score],
      backgroundColor: [getScoreColor(result.resume_score).bg, '#e5e7eb'],
      borderWidth: 0
    }]
  } : null;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
          <FileText className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Scorer</h1>
          <p className="text-gray-500">Get instant ATS compatibility score and improvement suggestions</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <Upload className="text-green-600" size={20} />
              <span className="font-semibold text-gray-900">Upload Resume</span>
            </div>
          </div>
          <div className="p-6">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${resumeFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400'}`}>
              {resumeFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-500 mb-3" size={48} />
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
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-green-600" size={28} />
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
                <span className="font-semibold text-gray-900">Job Description</span>
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
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
              placeholder="Paste the job description to compare against your resume..."
            />
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleScore}
        disabled={loading || !resumeFile || !jobDescription.trim()}
        className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader size="small" />
            <span>Analyzing Resume...</span>
          </>
        ) : (
          <>
            <Sparkles size={22} />
            <span>Score My Resume</span>
          </>
        )}
      </button>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Score Cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Score */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Score</h3>
              <div className="relative w-48 h-48">
                <Doughnut
                  data={chartData}
                  options={{
                    cutout: '75%',
                    plugins: { legend: { display: false } }
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className={`text-5xl font-bold ${getScoreColor(result.resume_score).text}`}>
                    {result.resume_score}
                  </p>
                  <p className="text-gray-500 text-sm">out of 100</p>
                </div>
              </div>
              <div className={`mt-6 px-4 py-2 rounded-full text-sm font-medium ${
                result.resume_score >= 70 ? 'bg-green-100 text-green-700' :
                result.resume_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getScoreColor(result.resume_score).label}
              </div>
            </div>

            {/* Match Metrics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Match Metrics</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Job Match</span>
                    <span className="font-semibold text-purple-600">{result.job_match_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.job_match_percentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Keyword Match</span>
                    <span className="font-semibold text-green-600">{result.keyword_match_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.keyword_match_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Skills Summary</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{result.matched_skills?.length || 0}</p>
                  <p className="text-xs text-gray-600">Matched</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <XCircle className="text-red-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{result.missing_skills?.length || 0}</p>
                  <p className="text-xs text-gray-600">Missing</p>
                </div>
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
                  <span className="font-semibold text-gray-900">Matched Skills</span>
                  <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {result.matched_skills?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills?.length > 0 ? (
                    result.matched_skills.map((skill, idx) => (
                      <SkillBadge key={idx} skill={skill} type="matched" />
                    ))
                  ) : (
                    <p className="text-gray-500">No matched skills found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-600" size={20} />
                  <span className="font-semibold text-gray-900">Missing Skills</span>
                  <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {result.missing_skills?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills?.length > 0 ? (
                    result.missing_skills.map((skill, idx) => (
                      <SkillBadge key={idx} skill={skill} type="missing" />
                    ))
                  ) : (
                    <p className="text-gray-500">Great! No missing skills</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          {result.improvement_suggestions?.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
              <div className="p-6 border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
                    <p className="text-sm text-gray-600">Actions to boost your resume score</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {result.improvement_suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <a
              href="/skill-gap"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Target size={20} />
              Analyze Skill Gap
              <ArrowRight size={18} />
            </a>
            <a
              href="/roadmap"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <Award size={20} />
              Get Learning Roadmap
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Optimize Your Resume</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Upload your resume and paste a job description to see how well they match. Get actionable insights to improve your chances.
          </p>
        </div>
      )}
    </div>
  );
}
