import { Check, Circle } from 'lucide-react';

export default function RoadmapStep({ stepNumber, skill, duration, resources, isCompleted, onToggle }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <button
          onClick={onToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-300 text-gray-500 hover:border-primary-500'
          }`}
        >
          {isCompleted ? <Check size={20} /> : <span>{stepNumber}</span>}
        </button>
        <div className="w-0.5 h-full bg-gray-200 mt-2" />
      </div>
      <div className={`flex-1 pb-8 ${isCompleted ? 'opacity-60' : ''}`}>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {skill}
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {duration}
            </span>
          </div>
          {resources && resources.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Resources:</p>
              <ul className="space-y-1">
                {resources.map((resource, idx) => (
                  <li key={idx} className="text-sm text-primary-600 hover:underline cursor-pointer">
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
