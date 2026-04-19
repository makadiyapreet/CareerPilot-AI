import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FileSearch,
  FileText,
  Target,
  MessageSquare,
  Map,
  Building2,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Star,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Smart Job Analyzer',
    description: 'AI extracts skills, requirements, and key insights from any job description in seconds.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    title: 'Resume Scoring',
    description: 'Get detailed ATS compatibility scores and actionable improvement suggestions.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills with personalized learning resources and courses.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: MessageSquare,
    title: 'AI Interview Prep',
    description: 'Practice with role-specific questions and receive instant AI feedback.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Map,
    title: 'Career Roadmaps',
    description: 'Get personalized learning paths for 20+ tech roles with timelines.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Briefcase,
    title: 'Job Tracker',
    description: 'Track applications, interviews, and manage your job search efficiently.',
    color: 'from-teal-500 to-cyan-500'
  }
];

const stats = [
  { number: '150+', label: 'Skills Tracked' },
  { number: '20+', label: 'Career Paths' },
  { number: '200+', label: 'Interview Questions' },
  { number: '10+', label: 'AI Modules' }
];

const benefits = [
  'AI-powered resume analysis and scoring',
  'Personalized skill gap identification',
  'Role-specific interview preparation',
  'Detailed career roadmaps with resources',
  'Real-time job application tracking',
  'Company insights and interview tips'
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              CareerBoost AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8 animate-bounce">
            <Sparkles size={16} />
            <span>AI-Powered Career Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Land Your Dream Job
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              With AI Assistance
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Analyze job descriptions, optimize your resume, identify skill gaps,
            and ace interviews — all powered by cutting-edge AI technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:-translate-y-1"
            >
              Start Free Today
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Powerful AI tools designed to accelerate your career growth and help you land your dream job.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                Your Career Success
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                  Starts Here
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Join thousands of job seekers who have accelerated their career growth with our AI-powered platform.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle size={18} className="text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-gray-400 text-sm">Interview Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">10,000+</div>
                      <div className="text-gray-400 text-sm">Active Users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">4.9/5</div>
                      <div className="text-gray-400 text-sm">User Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            <Zap size={16} />
            <span>Start for Free - No Credit Card Required</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Supercharge Your Career?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of successful job seekers. Start your journey today.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
          >
            Create Your Free Account
            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">CareerBoost AI</div>
                <div className="text-sm">AI-Powered Career Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>Built with React, FastAPI, and Machine Learning</p>
            <p className="mt-2 text-gray-500">&copy; 2024 CareerBoost AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
