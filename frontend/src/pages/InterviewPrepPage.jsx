import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getInterviewQuestions,
  evaluateAnswer,
  getInterviewRoles,
  getInterviewDifficulties,
  getInterviewCategories,
  getInterviewHistory,
  deleteInterviewHistory,
  getInterviewTips
} from '../services/api';
import Loader from '../components/Loader';

export default function InterviewPrepPage() {
  const [tab, setTab] = useState('generate');
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [saveToHistory, setSaveToHistory] = useState(true);

  const [roles, setRoles] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [history, setHistory] = useState([]);
  const [tips, setTips] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab]);

  useEffect(() => {
    if (jobRole && tab === 'tips') {
      fetchTips();
    }
  }, [jobRole, tab]);

  const fetchMetaData = async () => {
    setLoadingMeta(true);
    try {
      const [rolesRes, diffRes, catRes] = await Promise.all([
        getInterviewRoles(),
        getInterviewDifficulties(),
        getInterviewCategories()
      ]);
      setRoles(rolesRes.data?.roles || []);
      setDifficulties(diffRes.data?.levels || []);
      setCategories(catRes.data?.categories || []);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    } finally {
      setLoadingMeta(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await getInterviewHistory(null, 20);
      setHistory(response.data?.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTips = async () => {
    if (!jobRole) return;
    setLoadingTips(true);
    try {
      const response = await getInterviewTips(jobRole);
      setTips(response.data);
    } catch (error) {
      console.error('Failed to load tips:', error);
    } finally {
      setLoadingTips(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteInterviewHistory(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success('History item deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleGenerate = async () => {
    if (!jobRole) {
      toast.error('Please select a job role');
      return;
    }
    setLoading(true);
    try {
      const response = await getInterviewQuestions(jobRole, difficulty, 10, category || null);
      setQuestions(response.data?.questions || []);
      setCurrentQ(0);
      setAnswer('');
      setEvaluation(null);
      setTab('practice');
      toast.success('Questions generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      toast.error('Please enter your answer');
      return;
    }
    setEvaluating(true);
    try {
      const response = await evaluateAnswer(
        questions[currentQ]?.question,
        answer,
        jobRole,
        saveToHistory
      );
      setEvaluation(response.data);
      if (saveToHistory) {
        toast.success('Answer saved to history');
      }
    } catch (error) {
      toast.error('Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer('');
      setEvaluation(null);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setAnswer('');
      setEvaluation(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
        <p className="text-gray-600">Practice with AI-generated questions and get instant feedback.</p>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto pb-px">
        {['generate', 'practice', 'history', 'tips'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 font-medium whitespace-nowrap capitalize ${
              tab === t
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={t === 'practice' && questions.length === 0}
          >
            {t === 'generate' ? 'Generate Questions' : t === 'practice' ? 'Practice Mode' : t}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setJobRole(role.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    jobRole === role.value
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                      difficulty === d.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="saveHistory"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <label htmlFor="saveHistory" className="text-sm text-gray-700">
              Save answers to history for tracking progress
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobRole}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader size="small" /> : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Questions
              </>
            )}
          </button>
        </div>
      )}

      {tab === 'practice' && questions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentQ(i);
                        setAnswer('');
                        setEvaluation(null);
                      }}
                      className={`w-2 h-2 rounded-full ${
                        i === currentQ ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                {questions[currentQ]?.category || 'General'}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQ]?.question}
            </h2>

            {questions[currentQ]?.hint && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Hint:</span> {questions[currentQ].hint}
                </p>
              </div>
            )}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Type your answer here..."
            />

            <div className="flex gap-4 mt-4">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {evaluating ? <Loader size="small" /> : 'Evaluate Answer'}
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentQ >= questions.length - 1}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {evaluation && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Results</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className={`text-center p-4 rounded-lg ${getScoreColor(evaluation.relevance_score)}`}>
                  <p className="text-3xl font-bold">{evaluation.relevance_score}/10</p>
                  <p className="text-sm">Relevance Score</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${getScoreColor(evaluation.confidence_score)}`}>
                  <p className="text-3xl font-bold">{evaluation.confidence_score}/10</p>
                  <p className="text-sm">Confidence</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-700">{evaluation.length_feedback}</p>
                  <p className="text-sm text-gray-600">Length</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Feedback</h4>
                <p className="text-gray-700">{evaluation.feedback_text}</p>
              </div>
              {evaluation.saved_to_history && (
                <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved to your history
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'practice' && questions.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Generated</h3>
          <p className="text-gray-500 mb-4">Go to "Generate Questions" tab to create practice questions.</p>
          <button
            onClick={() => setTab('generate')}
            className="text-primary-600 hover:underline font-medium"
          >
            Generate Questions
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {item.job_role}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteHistory(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="font-medium text-gray-900 mb-2">{item.question}</p>
                <p className="text-sm text-gray-600 mb-3">{item.user_answer}</p>
                <div className="flex gap-4">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(item.relevance_score)}`}>
                    Relevance: {item.relevance_score}/10
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(item.confidence_score)}`}>
                    Confidence: {item.confidence_score}/10
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice History</h3>
              <p className="text-gray-500">Start practicing to build your history.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'tips' && (
        <div className="space-y-4">
          {!jobRole ? (
            <div className="bg-white rounded-xl border p-6">
              <p className="text-gray-600">Select a job role in the "Generate Questions" tab to see tips.</p>
            </div>
          ) : loadingTips ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : tips ? (
            <>
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Interview Tips</h3>
                <ul className="space-y-3">
                  {tips.general_tips?.map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tips.role_specific_tips?.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tips for {tips.role}
                  </h3>
                  <ul className="space-y-3">
                    {tips.role_specific_tips.map((tip, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border p-6">
              <p className="text-gray-600">No tips available for this role.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
