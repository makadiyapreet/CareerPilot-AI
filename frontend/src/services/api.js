import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const sendOTP = async (email) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (formData) => {
  const response = await api.post('/auth/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    email,
    otp,
    new_password: newPassword,
  });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const formData = new FormData();
  formData.append('current_password', currentPassword);
  formData.append('new_password', newPassword);
  const response = await api.post('/auth/change-password', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  const response = await api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============ JOB ANALYZER ============
export const analyzeJob = async (jobDescription) => {
  const response = await api.post('/job/analyze', { job_description: jobDescription });
  return response.data;
};

// ============ RESUME ============
export const scoreResume = async (resumeFile, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescription);
  const response = await api.post('/resume/score', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const parseResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  const response = await api.post('/resume/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const checkATS = async (resumeFile, jobDescription = null) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }
  const response = await api.post('/resume/ats-check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeResume = async (resumeFile, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescription);
  const response = await api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============ SKILL GAP ============
export const getSkillGap = async (resumeFile, jobDescription, targetRole = null) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescription);
  if (targetRole) {
    formData.append('target_role', targetRole);
  }
  const response = await api.post('/skills/gap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeSkills = async (skills) => {
  const response = await api.post('/skills/analyze', { skills });
  return response.data;
};

export const getSkillResources = async (skill) => {
  const response = await api.get(`/skills/resources/${encodeURIComponent(skill)}`);
  return response.data;
};

export const getSkillTaxonomy = async () => {
  const response = await api.get('/skills/taxonomy');
  return response.data;
};

// ============ INTERVIEW ============
export const getInterviewRoles = async () => {
  const response = await api.get('/interview/roles');
  return response.data;
};

export const getInterviewDifficulties = async () => {
  const response = await api.get('/interview/difficulties');
  return response.data;
};

export const getInterviewCategories = async () => {
  const response = await api.get('/interview/categories');
  return response.data;
};

export const getInterviewQuestions = async (jobRole, difficulty, count = 10, category = null) => {
  const payload = {
    job_role: jobRole,
    difficulty,
    count,
  };
  if (category) {
    payload.category = category;
  }
  const response = await api.post('/interview/questions', payload);
  return response.data;
};

export const evaluateAnswer = async (question, userAnswer, jobRole = null, saveHistory = false) => {
  const response = await api.post('/interview/evaluate', {
    question,
    user_answer: userAnswer,
    job_role: jobRole,
    save_history: saveHistory,
  });
  return response.data;
};

export const getInterviewHistory = async (jobRole = null, limit = 20) => {
  let url = `/interview/history?limit=${limit}`;
  if (jobRole) {
    url += `&job_role=${encodeURIComponent(jobRole)}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const deleteInterviewHistory = async (historyId) => {
  const response = await api.delete(`/interview/history/${historyId}`);
  return response.data;
};

export const getInterviewTips = async (role) => {
  const response = await api.get(`/interview/tips/${encodeURIComponent(role)}`);
  return response.data;
};

// ============ ROADMAP ============
export const generateRoadmap = async (targetRole, missingSkills = [], experienceLevel = 'beginner') => {
  const response = await api.post('/roadmap/generate', {
    target_role: targetRole,
    missing_skills: missingSkills,
    experience_level: experienceLevel,
  });
  return response.data;
};

export const getAvailableRoles = async () => {
  const response = await api.get('/roadmap/roles');
  return response.data;
};

export const getRoadmapPreview = async (role) => {
  const response = await api.get(`/roadmap/preview/${encodeURIComponent(role)}`);
  return response.data;
};

export const compareRoles = async (roles) => {
  const response = await api.post('/roadmap/compare', { roles });
  return response.data;
};

export const getRelatedRoles = async (role) => {
  const response = await api.get(`/roadmap/related/${encodeURIComponent(role)}`);
  return response.data;
};

// ============ COMPANY NEWS ============
export const getCompanyNews = async (companyName) => {
  const response = await api.get(`/news/company?name=${encodeURIComponent(companyName)}`);
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/news/companies');
  return response.data;
};

// ============ JOB TRACKER ============
export const createJobApplication = async (application) => {
  const response = await api.post('/tracker/applications', application);
  return response.data;
};

export const getJobApplications = async (statusFilter = null) => {
  let url = '/tracker/applications';
  if (statusFilter) {
    url += `?status_filter=${encodeURIComponent(statusFilter)}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getJobApplication = async (id) => {
  const response = await api.get(`/tracker/applications/${id}`);
  return response.data;
};

export const updateJobApplication = async (id, data) => {
  const response = await api.put(`/tracker/applications/${id}`, data);
  return response.data;
};

export const deleteJobApplication = async (id) => {
  const response = await api.delete(`/tracker/applications/${id}`);
  return response.data;
};

export const getTrackerStats = async () => {
  const response = await api.get('/tracker/stats');
  return response.data;
};

export const getStatusOptions = async () => {
  const response = await api.get('/tracker/status-options');
  return response.data;
};

export default api;
