import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signupUser, sendOTP, verifyOTP } from '../services/api';
import Loader from '../components/Loader';
import ResumeUpload from '../components/ResumeUpload';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  Code,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Target
} from 'lucide-react';

const degrees = ['B.Tech', 'B.E.', 'BCA', 'MCA', 'M.Tech', 'BSc', 'MSc', 'PhD', 'Diploma', 'Other'];
const branches = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Data Science', 'AI/ML', 'Other'];
const expLevels = ['Fresher', 'Beginner (0-1 years)', 'Intermediate (1-3 years)', 'Advanced (3-5 years)', 'Expert (5+ years)'];

const roles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer',
  'DevOps Engineer', 'Cloud Engineer', 'Software Engineer',
  'Mobile Developer', 'QA Engineer', 'Product Manager',
  'UI/UX Designer', 'Cybersecurity Analyst', 'Database Administrator',
  'Technical Lead', 'Systems Architect', 'Business Analyst', 'Data Engineer'
];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm();

  const password = watch('password');
  const email = watch('email');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    const emailValue = getValues('email');
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      toast.error('Please enter a valid email');
      return;
    }
    setOtpLoading(true);
    try {
      await sendOTP(emailValue);
      setOtpSent(true);
      setCountdown(60);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const emailValue = getValues('email');
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      await verifyOTP(emailValue, otp);
      setOtpVerified(true);
      toast.success('Email verified successfully!');
      setStep(1);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const skipVerification = () => {
    setStep(1);
    toast.info('You can verify your email later');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== 'confirmPassword' && data[key]) {
          formData.append(key, data[key]);
        }
      });
      if (otpVerified) {
        formData.append('otp', otp);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await signupUser(formData);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    { title: 'Verify Email', subtitle: 'Secure your account' },
    { title: 'Account Details', subtitle: 'Basic information' },
    { title: 'Profile Setup', subtitle: 'Complete your profile' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full filter blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-bold text-center mb-4">CareerBoost AI</h2>
          <p className="text-xl text-white/80 text-center max-w-md mb-12">
            Join thousands of professionals who landed their dream jobs with AI assistance.
          </p>

          {/* Steps Progress */}
          <div className="w-full max-w-sm space-y-4">
            {stepTitles.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${step === i ? 'bg-white/20 backdrop-blur-sm' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step > i ? 'bg-green-400 text-white' : step === i ? 'bg-white text-primary-600' : 'bg-white/20 text-white/60'
                }`}>
                  {step > i ? <CheckCircle size={20} /> : i + 1}
                </div>
                <div>
                  <p className={`font-semibold ${step >= i ? 'text-white' : 'text-white/60'}`}>{s.title}</p>
                  <p className={`text-sm ${step >= i ? 'text-white/80' : 'text-white/40'}`}>{s.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              CareerBoost AI
            </h1>
          </div>

          {/* Mobile Progress */}
          <div className="lg:hidden flex gap-2 justify-center mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 w-16 rounded-full transition-all ${
                  step >= i ? 'bg-gradient-to-r from-primary-500 to-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{stepTitles[step].title}</h1>
            <p className="text-gray-600 mt-2">{stepTitles[step].subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Step 0: Email Verification */}
              {step === 0 && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="text-white" size={32} />
                    </div>
                    <p className="text-gray-500">We'll send you a verification code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                        })}
                        disabled={otpSent}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>}
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {otpLoading ? <Loader size="small" /> : (
                        <>
                          Send Verification Code
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-[0.5em] font-mono"
                          placeholder="000000"
                        />
                        <p className="text-center text-gray-500 text-sm mt-3">
                          {countdown > 0 ? (
                            <span>Resend OTP in <span className="font-semibold text-primary-600">{countdown}s</span></span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                              className="text-primary-600 hover:underline font-medium"
                            >
                              Resend OTP
                            </button>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length < 6}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {otpLoading ? <Loader size="small" /> : (
                          <>
                            <CheckCircle size={20} />
                            Verify OTP
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={skipVerification}
                    className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Skip for Now
                  </button>

                  {otpVerified && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">Email Verified</span>
                    </div>
                  )}
                </>
              )}

              {/* Step 1: Account Details */}
              {step === 1 && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="text-gray-400" />
                      Full Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name.message}</p>}
                  </div>

                  {!otpVerified && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="text-gray-400" />
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                        })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>}
                    </div>
                  )}

                  {otpVerified && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-green-800">{email}</p>
                        <p className="text-sm text-green-600">Verified email address</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} className="text-gray-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' }
                        })}
                        className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Shield size={16} className="text-gray-400" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword', {
                        required: 'Please confirm password',
                        validate: (value) => value === password || 'Passwords do not match'
                      })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1.5">{errors.confirmPassword.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="text-gray-400" />
                      Phone (Optional)
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Next
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Profile Setup */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building2 size={16} className="text-gray-400" />
                        College
                      </label>
                      <input
                        {...register('college')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Your College"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <GraduationCap size={16} className="text-gray-400" />
                        Grad Year
                      </label>
                      <input
                        type="number"
                        {...register('graduation_year')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <select
                        {...register('degree')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      >
                        <option value="">Select</option>
                        {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <select
                        {...register('branch')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      >
                        <option value="">Select</option>
                        {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
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
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Code size={16} className="text-gray-400" />
                      Skills (comma separated)
                    </label>
                    <input
                      {...register('skills')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Python, React, SQL, JavaScript"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Target size={16} className="text-gray-400" />
                      Experience Level
                    </label>
                    <select
                      {...register('experience_level')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="">Select</option>
                      {expLevels.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-500 mb-2">Upload Resume (Optional)</p>
                    <ResumeUpload onFileSelect={setResumeFile} />
                    {resumeFile && (
                      <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                        <CheckCircle size={16} />
                        {resumeFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size="small" /> : (
                        <>
                          Create Account
                          <CheckCircle size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
