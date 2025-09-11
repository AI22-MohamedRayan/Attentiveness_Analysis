import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`} 
      />
      {text && (
        <span className={`${textSizes[size]} text-gray-600 font-medium`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;