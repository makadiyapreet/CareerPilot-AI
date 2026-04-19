import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  FileText,
  Target,
  MessageSquare,
  Map,
  Building2,
  Briefcase,
  User,
  LogOut,
  Sparkles,
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  Zap,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Command,
  Keyboard,
  X,
  Plus,
  BookOpen,
  Calendar,
  BarChart3
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500', shortcut: '⌘D' },
  { path: '/job-analyzer', icon: FileSearch, label: 'Job Analyzer', color: 'from-violet-500 to-purple-500', shortcut: '⌘J' },
  { path: '/resume-score', icon: FileText, label: 'Resume Score', color: 'from-green-500 to-emerald-500', shortcut: '⌘R' },
  { path: '/skill-gap', icon: Target, label: 'Skill Gap', color: 'from-purple-500 to-pink-500', shortcut: '⌘S' },
  { path: '/interview-prep', icon: MessageSquare, label: 'Interview Prep', color: 'from-orange-500 to-red-500', shortcut: '⌘I' },
  { path: '/roadmap', icon: Map, label: 'Learning Roadmap', color: 'from-pink-500 to-rose-500', shortcut: '⌘L' },
  { path: '/company-news', icon: Building2, label: 'Company News', color: 'from-indigo-500 to-blue-500', shortcut: '⌘N' },
  { path: '/job-tracker', icon: Briefcase, label: 'Job Tracker', color: 'from-teal-500 to-cyan-500', shortcut: '⌘T' },
];

const quickActions = [
  { label: 'Analyze Resume', icon: FileText, action: '/resume-score', color: 'from-green-500 to-emerald-500' },
  { label: 'Find Jobs', icon: FileSearch, action: '/job-analyzer', color: 'from-violet-500 to-purple-500' },
  { label: 'Practice Interview', icon: MessageSquare, action: '/interview-prep', color: 'from-orange-500 to-red-500' },
  { label: 'View Roadmap', icon: Map, action: '/roadmap', color: 'from-pink-500 to-rose-500' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, title: 'Resume score improved!', desc: 'Your ATS score increased to 85%', time: '5 min ago', unread: true, icon: TrendingUp },
    { id: 2, title: 'New job match found', desc: '3 jobs match your profile', time: '1 hour ago', unread: true, icon: Briefcase },
    { id: 3, title: 'Interview scheduled', desc: 'Mock interview on Friday', time: '2 hours ago', unread: false, icon: Calendar },
  ]);

  // Progress stats
  const stats = {
    resumeScore: 85,
    skillsLearned: 12,
    interviewsCompleted: 7,
    jobsApplied: 23
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase();
        const shortcuts = {
          'd': '/dashboard',
          'j': '/job-analyzer',
          'r': '/resume-score',
          's': '/skill-gap',
          'i': '/interview-prep',
          'l': '/roadmap',
          'n': '/company-news',
          't': '/job-tracker',
          'k': () => setShowShortcuts(true),
        };

        if (shortcuts[key]) {
          e.preventDefault();
          if (typeof shortcuts[key] === 'function') {
            shortcuts[key]();
          } else {
            navigate(shortcuts[key]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-br from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-xl z-40">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CareerBoost
            </h1>
            <p className="text-xs text-gray-500">AI Career Assistant</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="relative group">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-100 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Quick Actions & Search - Fixed */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
          >
            <Zap size={16} />
            <span>Quick Actions</span>
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Keyboard size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1.5">
          {filteredNavItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                }`
              }
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-purple-500 rounded-r-full"></div>
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-md shadow-primary-500/30`
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} />
                  </div>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {isActive && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                    </div>
                  )}
                  {!isActive && (
                    <span className="text-[10px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.shortcut}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Progress Stats */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Your Progress</h3>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Resume Score</span>
                <span className="text-xs font-semibold text-blue-600">{stats.resumeScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.resumeScore}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.skillsLearned}</div>
                <div className="text-[10px] text-gray-500">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.interviewsCompleted}</div>
                <div className="text-[10px] text-gray-500">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.jobsApplied}</div>
                <div className="text-[10px] text-gray-500">Applied</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Award size={14} className="text-purple-500" />
              <span>Completed SQL course</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <BookOpen size={14} className="text-pink-500" />
              <span>Started React learning path</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Actions - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-2 bg-white/80 backdrop-blur-sm">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings size={16} className="text-gray-500" />
          </div>
          <span className="text-sm">Settings</span>
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
            <LogOut size={16} />
          </div>
          <span className="text-sm">Logout</span>
        </button>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowQuickActions(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="text-primary-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              <button onClick={() => setShowQuickActions(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(action.action);
                    setShowQuickActions(false);
                  }}
                  className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowNotifications(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="text-primary-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
                  notif.unread
                    ? 'bg-primary-50/50 border-primary-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notif.unread ? 'bg-primary-100' : 'bg-gray-200'
                    }`}>
                      <notif.icon size={18} className={notif.unread ? 'text-primary-600' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                        {notif.unread && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{notif.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Keyboard className="text-primary-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                      <item.icon size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600 shadow-sm">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl border border-primary-200">
                <span className="text-sm text-gray-700">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600 shadow-sm">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </aside>
  );
}
