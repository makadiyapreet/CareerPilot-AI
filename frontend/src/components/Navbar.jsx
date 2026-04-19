import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Bell,
  ChevronDown,
  Search,
  Settings,
  HelpCircle,
  Mail,
  MessageSquare,
  Zap,
  Moon,
  Sun,
  Command
} from 'lucide-react';
import { useState, useEffect } from 'react';

const mobileNavItems = [
  { path: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  { path: '/job-analyzer', icon: 'FileSearch', label: 'Job Analyzer' },
  { path: '/resume-score', icon: 'FileText', label: 'Resume Score' },
  { path: '/skill-gap', icon: 'Target', label: 'Skill Gap' },
  { path: '/interview-prep', icon: 'MessageSquare', label: 'Interview Prep' },
  { path: '/roadmap', icon: 'Map', label: 'Learning Roadmap' },
  { path: '/company-news', icon: 'Building2', label: 'Company News' },
  { path: '/job-tracker', icon: 'Briefcase', label: 'Job Tracker' },
  { path: '/profile', icon: 'User', label: 'Profile' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Resume Updated', desc: 'Your resume score improved', unread: true },
    { id: 2, title: 'New Job Match', desc: '3 new jobs match your profile', unread: true },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/job-analyzer': 'Job Analyzer',
      '/resume-score': 'Resume Score',
      '/skill-gap': 'Skill Gap Analysis',
      '/interview-prep': 'Interview Preparation',
      '/roadmap': 'Learning Roadmap',
      '/company-news': 'Company News',
      '/job-tracker': 'Job Tracker',
      '/profile': 'Profile Settings',
    };
    return titles[path] || 'CareerBoost AI';
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 lg:left-72 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Page Title & Breadcrumb */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logo (Mobile Only) */}
              <Link to="/" className="flex lg:hidden items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={18} />
                </div>
              </Link>

              {/* Page Title (Desktop) */}
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-xs text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Search Button */}
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm text-gray-600 group"
                  >
                    <Search size={16} className="text-gray-400 group-hover:text-gray-600" />
                    <span>Search</span>
                    <kbd className="hidden lg:inline-block px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-500">
                      ⌘/
                    </kbd>
                  </button>

                  {/* Quick Action Button */}
                  <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative group">
                    <Zap size={20} className="group-hover:text-primary-600" />
                    <span className="absolute -bottom-8 right-0 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Quick Actions
                    </span>
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors group">
                    <Bell size={20} className="group-hover:text-primary-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Help */}
                  <button className="hidden md:block p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors group">
                    <HelpCircle size={20} className="group-hover:text-primary-600" />
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown size={16} className="hidden lg:block text-gray-400 group-hover:text-gray-600" />
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-20 animate-slideDown">
                          {/* User Info */}
                          <div className="px-4 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-blue-600">85%</div>
                                <div className="text-[10px] text-gray-600">Resume Score</div>
                              </div>
                              <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-purple-600">12</div>
                                <div className="text-[10px] text-gray-600">Skills</div>
                              </div>
                              <div className="flex-1 bg-pink-50 rounded-lg p-2 text-center">
                                <div className="text-lg font-bold text-pink-600">7</div>
                                <div className="text-[10px] text-gray-600">Interviews</div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              to="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                <User size={18} className="text-gray-500 group-hover:text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">Profile Settings</div>
                                <div className="text-xs text-gray-500">Update your information</div>
                              </div>
                            </Link>

                            <Link
                              to="/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                <Settings size={18} className="text-gray-500 group-hover:text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">Settings</div>
                                <div className="text-xs text-gray-500">Preferences & privacy</div>
                              </div>
                            </Link>

                            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group">
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <HelpCircle size={18} className="text-gray-500 group-hover:text-blue-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-gray-900">Help & Support</div>
                                <div className="text-xs text-gray-500">Get help anytime</div>
                              </div>
                            </button>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-2"
                              style={{ width: 'calc(100% - 1rem)' }}
                            >
                              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                                <LogOut size={18} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium">Logout</div>
                                <div className="text-xs text-red-500">Sign out of your account</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-5 00/25 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-slideDown">
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-fadeIn" onClick={() => setSearchOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-slideDown" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for features, pages, or actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs font-mono text-gray-600">
                  ESC
                </kbd>
              </div>

              {searchQuery && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase px-2">Quick Results</p>
                  {mobileNavItems
                    .filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Search size={18} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">Navigate to {item.label}</div>
                        </div>
                      </button>
                    ))}
                </div>
              )}

              {!searchQuery && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 font-semibold uppercase px-2 mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Resume Score', 'Job Analyzer', 'Interview Prep', 'Roadmap', 'Skills'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
