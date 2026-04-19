import { useState } from 'react';
import { toast } from 'react-toastify';
import { analyzeJob } from '../services/api';
import Loader from '../components/Loader';
import SkillBadge from '../components/SkillBadge';
import {
  FileSearch,
  Sparkles,
  Briefcase,
  Code,
  Users,
  BarChart3,
  Tag,
  FileText,
  Clipboard,
  CheckCircle,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';

export default function JobAnalyzerPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeJob(jobDescription);
      setResult(response.data);
      toast.success('Job analyzed successfully!');
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

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <FileSearch className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Analyzer</h1>
              <p className="text-gray-500">Extract skills, requirements, and insights from any job description</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <span className="font-semibold text-gray-900">Job Description</span>
            </div>
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Clipboard size={16} />
              Paste from Clipboard
            </button>
          </div>
        </div>

        <div className="p-6">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none text-gray-700"
            placeholder="Paste the full job description here...

Example:
We are looking for a Senior Software Engineer to join our team. You will be responsible for designing and implementing scalable solutions using Python, AWS, and microservices architecture.

Requirements:
- 5+ years of experience in software development
- Strong knowledge of Python, Django, or Flask
- Experience with cloud services (AWS, GCP)
- Understanding of CI/CD pipelines
- Excellent communication skills"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <p className="text-sm text-gray-500">
              {jobDescription.length > 0 ? `${jobDescription.split(/\s+/).length} words` : 'Paste a job description to analyze'}
            </p>

            <button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size="small" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analyze Job
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Job Role</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{result.job_role || 'Not specified'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Domain</p>
                  <p className="text-xl font-bold text-primary-600 mt-1">{result.domain || 'General'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Experience</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{result.experience_level || 'Any level'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Skills Found</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {(result.technical_skills?.length || 0) + (result.soft_skills?.length || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Code className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Technical Skills</h3>
                  <p className="text-sm text-gray-500">{result.technical_skills?.length || 0} skills identified</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {result.technical_skills?.length > 0 ? (
                  result.technical_skills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} type="primary" />
                  ))
                ) : (
                  <p className="text-gray-500">No technical skills detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Soft Skills</h3>
                  <p className="text-sm text-gray-500">{result.soft_skills?.length || 0} skills identified</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {result.soft_skills?.length > 0 ? (
                  result.soft_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No soft skills detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {result.keywords?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Tag className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Key Terms & Keywords</h3>
                    <p className="text-sm text-gray-500">Important terms to include in your resume</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {result.keywords.slice(0, 20).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Job Summary */}
          {result.job_summary && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold">AI Summary</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{result.job_summary}</p>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-sm mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/resume-score"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle size={16} />
                    Score Your Resume
                  </a>
                  <a
                    href="/skill-gap"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <BarChart3 size={16} />
                    Check Skill Gap
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileSearch className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Analyze</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Paste any job description above and our AI will extract all the skills, requirements, and key insights you need to land the job.
          </p>
        </div>
      )}
    </div>
  );
}
