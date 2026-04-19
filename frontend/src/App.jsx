import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import ResumeScorePage from './pages/ResumeScorePage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import RoadmapPage from './pages/RoadmapPage';
import CompanyNewsPage from './pages/CompanyNewsPage';
import JobTrackerPage from './pages/JobTrackerPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <Navbar />
      <main className="lg:ml-72 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-analyzer"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JobAnalyzerPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-score"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumeScorePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SkillGapPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-prep"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InterviewPrepPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RoadmapPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-news"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CompanyNewsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-tracker"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JobTrackerPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
