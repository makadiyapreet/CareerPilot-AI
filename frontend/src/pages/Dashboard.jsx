import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileSearch,
  FileText,
  Target,
  MessageSquare,
  Map,
  Building2,
  TrendingUp,
  Award,
  ArrowRight,
  Briefcase,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  BarChart3,
  GraduationCap,
  User,
  ChevronRight
} from 'lucide-react';

const quickActions = [
  {
    path: '/job-analyzer',
    icon: FileSearch,
    label: 'Analyze Job',
    description: 'Extract skills from JD',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    path: '/resume-score',
    icon: FileText,
    label: 'Score Resume',
    description: 'Get ATS compatibility',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    path: '/skill-gap',
    icon: Target,
    label: 'Skill Gap',
    description: 'Find missing skills',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    path: '/interview-prep',
    icon: MessageSquare,
    label: 'Interview Prep',
    description: 'Practice questions',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    path: '/roadmap',
    icon: Map,
    label: 'Career Roadmap',
    description: 'Learning paths',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    path: '/job-tracker',
    icon: Briefcase,
    label: 'Job Tracker',
    description: 'Track applications',
    gradient: 'from-indigo-500 to-purple-500'
  },
];

const StatCard = ({ icon: Icon, label, value, subtext, gradient }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtext && <p className="text-gray-400 text-sm mt-1">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const profileCompletion = () => {
    const fields = ['name', 'phone', 'college', 'degree', 'branch', 'graduation_year', 'interested_role', 'skills', 'experience_level'];
    const filled = fields.filter(f => user?.[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Sparkles size={16} />
            <span>{getGreeting()}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Ready to supercharge your career? Let's continue where you left off.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              to="/job-analyzer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Zap size={18} />
              Quick Analyze
            </Link>
            <Link
              to="/interview-prep"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
            >
              <MessageSquare size={18} />
              Practice Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Profile Complete"
          value={`${profileCompletion()}%`}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={Target}
          label="Skills Tracked"
          value="12"
          subtext="of 20 matched"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Questions Practiced"
          value="45"
          subtext="this month"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Roadmap Progress"
          value="3/8"
          subtext="steps completed"
          gradient="from-blue-500 to-cyan-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-500">Jump into any module to boost your career</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon className="text-white" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-gray-500 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Overview & Tips */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                Edit <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interested Role</p>
                    <p className="font-semibold text-gray-900">{user?.interested_role || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-semibold text-gray-900">{user?.experience_level || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-semibold text-gray-900">
                      {user?.degree ? `${user.degree}${user?.branch ? ` - ${user.branch}` : ''}` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Building2 className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">College</p>
                    <p className="font-semibold text-gray-900">{user?.college || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-pink-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Graduation Year</p>
                    <p className="font-semibold text-gray-900">{user?.graduation_year || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Target className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    <p className="font-semibold text-gray-900 truncate max-w-[200px]">
                      {user?.skills || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-400" size={20} />
            <h3 className="font-bold text-lg">Pro Tips</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-gray-300 text-sm">
                Upload your resume to get personalized job matches and skill recommendations.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-gray-300 text-sm">
                Practice at least 5 interview questions daily to improve confidence.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-gray-300 text-sm">
                Follow your career roadmap step-by-step for structured learning.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-gray-300 text-sm">
                Track all your job applications to stay organized and follow up.
              </p>
            </div>
          </div>

          <Link
            to="/roadmap"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
          >
            View Your Roadmap
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
