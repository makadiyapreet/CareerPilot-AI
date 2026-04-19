import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

export default function ResumeUpload({ onFileSelect, accept = '.pdf', label = 'Upload Resume' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError('');

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-3">
            <File className="text-primary-600" size={24} />
            <span className="text-gray-700">{selectedFile.name}</span>
            <button
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">
              Drag and drop your PDF here, or{' '}
              <button
                onClick={() => inputRef.current?.click()}
                className="text-primary-600 hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-gray-400 text-sm mt-1">PDF only, max 5MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
