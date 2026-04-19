import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadResume, changePassword } from '../services/api';
import Loader from '../components/Loader';
import ResumeUpload from '../components/ResumeUpload';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  Target,
  Code,
  BarChart3,
  FileText,
  Shield,
  Camera,
  Save,
  Upload,
  CheckCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const experienceLevels = [
  { value: 'Beginner', label: 'Beginner', description: '0-1 years' },
  { value: 'Intermediate', label: 'Intermediate', description: '1-3 years' },
  { value: 'Advanced', label: 'Advanced', description: '3-5 years' },
  { value: 'Expert', label: 'Expert', description: '5+ years' }
];

const interestedRoles = [
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Software Engineer', 'Cloud Engineer',
  'Product Manager', 'AI/ML Engineer', 'Cybersecurity Analyst',
  'Mobile Developer', 'QA Engineer', 'Database Administrator',
  'UI/UX Designer', 'Systems Architect', 'Technical Lead',
  'Business Analyst', 'Data Engineer'
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      college: user?.college || '',
      degree: user?.degree || '',
      branch: user?.branch || '',
      graduation_year: user?.graduation_year || '',
      interested_role: user?.interested_role || '',
      skills: user?.skills || '',
      experience_level: user?.experience_level || '',
      linkedin_url: user?.linkedin_url || '',
      github_url: user?.github_url || '',
      portfolio_url: user?.portfolio_url || '',
      bio: user?.bio || ''
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await updateUserProfile(data);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadResume(file);
      updateUser({ resume_path: response.data.file_path });
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const profileCompletion = () => {
    const fields = ['name', 'phone', 'college', 'degree', 'branch', 'graduation_year', 'interested_role', 'skills', 'experience_level'];
    const filled = fields.filter(f => user?.[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-lg hover:scale-110 transition-transform">
              <Camera size={20} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-white/80 mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              {user?.interested_role && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {user.interested_role}
                </span>
              )}
              {user?.experience_level && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {user.experience_level}
                </span>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40" cy="40" r="36"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40" cy="40" r="36"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${profileCompletion() * 2.26} 226`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {profileCompletion()}%
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">Profile Complete</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={20} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-gray-500 mt-1">Update your profile details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="text-gray-400" />
                  Full Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="text-gray-400" />
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 size={16} className="text-gray-400" />
                  College/University
                </label>
                <input
                  {...register('college')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="MIT, Stanford, etc."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap size={16} className="text-gray-400" />
                  Graduation Year
                </label>
                <input
                  type="number"
                  {...register('graduation_year')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap size={16} className="text-gray-400" />
                  Degree
                </label>
                <input
                  {...register('degree')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="B.Tech, M.S., etc."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Code size={16} className="text-gray-400" />
                  Branch/Major
                </label>
                <input
                  {...register('branch')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase size={16} className="text-gray-400" />
                  Interested Role
                </label>
                <select
                  {...register('interested_role')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="">Select a role</option>
                  {interestedRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 size={16} className="text-gray-400" />
                  Experience Level
                </label>
                <select
                  {...register('experience_level')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="">Select level</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} ({level.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Target size={16} className="text-gray-400" />
                Skills (comma separated)
              </label>
              <textarea
                {...register('skills')}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all resize-none"
                placeholder="Python, JavaScript, SQL, Machine Learning, React..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <Loader size="small" />
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Resume Management</h2>
            <p className="text-gray-500 mt-1">Upload and manage your resume</p>
          </div>

          <div className="p-6 space-y-6">
            {user?.resume_path && (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">Resume Uploaded</p>
                  <p className="text-sm text-green-600 truncate">{user.resume_path}</p>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="text-primary-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user?.resume_path ? 'Upload New Resume' : 'Upload Your Resume'}
              </h3>
              <p className="text-gray-500 mb-4">PDF format recommended (max 5MB)</p>
              <ResumeUpload onFileSelect={handleResumeUpload} label="Choose File" />
              {uploading && (
                <div className="mt-4">
                  <Loader size="small" text="Uploading..." />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">Tips for a Great Resume</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use a clean, ATS-friendly format</li>
                <li>• Include relevant keywords from job descriptions</li>
                <li>• Quantify achievements where possible</li>
                <li>• Keep it concise (1-2 pages)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
            <p className="text-gray-500 mt-1">Manage your password and security</p>
          </div>

          <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="p-6 space-y-6">
            <div className="max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="text-gray-400" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword', { required: true })}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="text-gray-400" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword', { required: true, minLength: 6 })}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="text-gray-400" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', { required: true })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {passwordLoading ? (
                  <Loader size="small" />
                ) : (
                  <>
                    <Shield size={20} />
                    Update Password
                  </>
                )}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md">
              <h4 className="font-medium text-amber-800 mb-2">Password Requirements</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Minimum 6 characters</li>
                <li>• Mix of letters and numbers recommended</li>
                <li>• Avoid common passwords</li>
              </ul>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
