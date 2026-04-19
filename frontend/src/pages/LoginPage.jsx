import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { loginUser, forgotPassword, resetPassword } from '../services/api';
import Loader from '../components/Loader';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: email, 1: otp+password
  const [resetEmail, setResetEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await loginUser(data.email, data.password);
      login(response.user, response.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setResetEmail(data.email);
      setResetStep(1);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      await resetPassword(resetEmail, data.otp, data.newPassword);
      toast.success('Password reset successful!');
      setForgotMode(false);
      setResetStep(0);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        {/* Animated blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full filter blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-bold text-center mb-4">CareerBoost AI</h2>
          <p className="text-xl text-white/80 text-center max-w-md">
            Your AI-powered career companion for landing your dream job.
          </p>

          <div className="mt-12 space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <span>AI Resume Analysis & Scoring</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <span>Personalized Skill Gap Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <span>Interview Preparation with AI</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} />
              <span>Career Roadmaps & Learning Paths</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              CareerBoost AI
            </h1>
          </div>

          {!forgotMode ? (
            // Login Form
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader size="small" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary-600 hover:underline font-semibold">
                      Sign up free
                    </Link>
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Forgot Password Form
            <>
              <button
                onClick={() => { setForgotMode(false); setResetStep(0); }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
              >
                <ArrowLeft size={20} />
                Back to login
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {resetStep === 0 ? 'Reset Password' : 'Enter OTP'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {resetStep === 0
                    ? 'Enter your email to receive a reset code'
                    : `We sent a code to ${resetEmail}`}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                {resetStep === 0 ? (
                  <form onSubmit={handleResetSubmit(handleForgotPassword)} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          {...registerReset('email', { required: 'Email is required' })}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                          placeholder="you@example.com"
                        />
                      </div>
                      {resetErrors.email && (
                        <p className="text-red-500 text-sm mt-1.5">{resetErrors.email.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size="small" /> : 'Send Reset Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        {...registerReset('otp', { required: 'OTP is required' })}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-[0.5em] font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...registerReset('newPassword', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Min 6 characters' }
                          })}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size="small" /> : 'Reset Password'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
