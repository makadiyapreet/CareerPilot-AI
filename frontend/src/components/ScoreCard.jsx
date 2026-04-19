export default function ScoreCard({ title, score, total = 100, icon: Icon, gradient = 'from-primary-500 to-purple-500' }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getColorClasses = (pct) => {
    if (pct >= 80) return { text: 'text-green-600', bar: 'from-green-500 to-emerald-500' };
    if (pct >= 60) return { text: 'text-yellow-600', bar: 'from-yellow-500 to-orange-500' };
    if (pct >= 40) return { text: 'text-orange-600', bar: 'from-orange-500 to-red-500' };
    return { text: 'text-red-600', bar: 'from-red-500 to-pink-500' };
  };

  const colors = getColorClasses(percentage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
            {total !== 100 && (
              <span className="text-gray-400 text-sm">/ {total}</span>
            )}
            {total === 100 && percentage && (
              <span className="text-gray-400 text-sm">%</span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${colors.bar} h-2 rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {percentage}% {total !== 100 ? 'completed' : 'score'}
        </p>
      </div>
    </div>
  );
}
