import { CheckCircle, XCircle, Sparkles, Code } from 'lucide-react';

export default function SkillBadge({ skill, type = 'neutral', showIcon = false }) {
  const typeConfig = {
    matched: {
      classes: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    missing: {
      classes: 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    neutral: {
      classes: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
      icon: Code,
      iconColor: 'text-gray-400'
    },
    primary: {
      classes: 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 border-primary-200',
      icon: Sparkles,
      iconColor: 'text-primary-500'
    },
  };

  const config = typeConfig[type] || typeConfig.neutral;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${config.classes}`}
    >
      {showIcon && <Icon size={14} className={config.iconColor} />}
      {skill}
    </span>
  );
}
