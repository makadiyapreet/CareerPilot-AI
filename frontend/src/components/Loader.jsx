export default function Loader({ size = 'medium', text = '', variant = 'primary' }) {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
        />
        {size === 'large' && (
          <div className="absolute inset-0 w-full h-full rounded-full animate-ping opacity-30 border-4 border-primary-400" />
        )}
      </div>
      {text && (
        <p className="text-gray-500 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}
