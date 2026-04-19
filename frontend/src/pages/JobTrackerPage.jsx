import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  createJobApplication,
  getJobApplications,
  updateJobApplication,
  deleteJobApplication,
  getTrackerStats,
  getStatusOptions
} from '../services/api';
import Loader from '../components/Loader';

const statusColors = {
  'Applied': 'bg-blue-100 text-blue-700',
  'In Review': 'bg-yellow-100 text-yellow-700',
  'Phone Screen': 'bg-purple-100 text-purple-700',
  'Interview': 'bg-indigo-100 text-indigo-700',
  'Technical': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-green-100 text-green-700',
  'Accepted': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Withdrawn': 'bg-gray-100 text-gray-700'
};

export default function JobTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    status: 'Applied',
    salary_range: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes, optionsRes] = await Promise.all([
        getJobApplications(statusFilter || null),
        getTrackerStats(),
        getStatusOptions()
      ]);
      setApplications(appsRes.data?.applications || []);
      setStats(statsRes.data);
      setStatusOptions(optionsRes.data?.statuses || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.job_title) {
      toast.error('Company and job title are required');
      return;
    }

    setSaving(true);
    try {
      if (editingApp) {
        await updateJobApplication(editingApp.id, formData);
        toast.success('Application updated');
      } else {
        await createJobApplication(formData);
        toast.success('Application added');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await deleteJobApplication(id);
      toast.success('Application deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateJobApplication(id, { status: newStatus });
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openModal = (app = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        company_name: app.company_name,
        job_title: app.job_title,
        job_url: app.job_url || '',
        status: app.status,
        salary_range: app.salary_range || '',
        location: app.location || '',
        notes: app.notes || ''
      });
    } else {
      setEditingApp(null);
      setFormData({
        company_name: '',
        job_title: '',
        job_url: '',
        status: 'Applied',
        salary_range: '',
        location: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingApp(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
          <p className="text-gray-600">Track and manage your job applications.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Application
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-blue-600">{stats.by_status?.['Applied'] || 0}</p>
            <p className="text-sm text-gray-600">Applied</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-purple-600">{stats.by_status?.['Interview'] || 0}</p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-green-600">{stats.by_status?.['Offer'] || 0}</p>
            <p className="text-sm text-gray-600">Offers</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-gray-600">
              {stats.response_rate ? `${Math.round(stats.response_rate)}%` : '0%'}
            </p>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Position</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applied</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.company_name}</p>
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline"
                          >
                            View Posting
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{app.job_title}</p>
                      {app.salary_range && (
                        <p className="text-xs text-gray-500">{app.salary_range}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{app.location || '-'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(app)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your job applications.</p>
            <button
              onClick={() => openModal()}
              className="text-primary-600 hover:underline font-medium"
            >
              Add Your First Application
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingApp ? 'Edit Application' : 'Add Application'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Google"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
                <input
                  type="url"
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Remote, NYC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., $80k - $100k"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? <Loader size="small" /> : (editingApp ? 'Update' : 'Add Application')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
