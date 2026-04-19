import { useState } from 'react';
import { toast } from 'react-toastify';
import { getCompanyNews } from '../services/api';
import Loader from '../components/Loader';
import SkillBadge from '../components/SkillBadge';
import { Search, Building2, Code, Newspaper, TrendingUp, Lightbulb } from 'lucide-react';

const popularCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'];

export default function CompanyNewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);

  const handleSearch = async (name = searchTerm) => {
    if (!name.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    setLoading(true);
    try {
      const response = await getCompanyNews(name);
      setCompany(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Company not found');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Insights</h1>
        <p className="text-gray-600">Research companies, tech stacks, and interview tips.</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Search company..."
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader size="small" /> : 'Search'}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Popular companies:</p>
          <div className="flex flex-wrap gap-2">
            {popularCompanies.map(c => (
              <button
                key={c}
                onClick={() => { setSearchTerm(c); handleSearch(c); }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {company && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                <Building2 className="text-primary-600" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{company.company_name}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Tech Stack</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.tech_stack?.map((tech, idx) => (
                <SkillBadge key={idx} skill={tech} type="primary" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Recent News</h3>
            </div>
            <ul className="space-y-3">
              {company.recent_news?.map((news, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span className="text-gray-700">{news}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Hiring Trends</h3>
              </div>
              <p className="text-gray-700">{company.hiring_trends}</p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Interview Tips</h3>
              </div>
              <p className="text-gray-700">{company.interview_tips}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
