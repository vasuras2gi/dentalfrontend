import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error,
  className = '',
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Premium Label */}
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-5 py-3.5 border rounded-2xl outline-none transition-all duration-300 font-medium text-slate-800 placeholder-slate-400 
            ${error 
              ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-400 focus:bg-white' 
              : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white hover:border-teal-300'
            }
          `}
          {...rest}
        />
        
        {/* Visual indicator for error state inside the input */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-red-400 text-sm">⚠️</span>
          </div>
        )}
      </div>

      {/* Animated Error Message */}
      {error && (
        <p className="mt-2 text-xs text-red-500 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;