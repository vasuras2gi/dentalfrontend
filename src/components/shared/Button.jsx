import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  fullWidth = false,
  className = '' 
}) => {
  
  // Premium base styling with satisfying click effect (active:scale) and smooth transitions
  const baseStyle = "relative overflow-hidden inline-flex justify-center items-center px-6 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";
  
  // Ultra-premium variants matched with the clinic's glassmorphism theme
  const variants = {
    primary: "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 border border-teal-400 focus:ring-teal-500",
    secondary: "bg-teal-50 hover:bg-teal-100 text-teal-800 shadow-sm border border-teal-200 hover:border-teal-300 focus:ring-teal-500",
    outline: "bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/50 shadow-sm focus:ring-teal-500"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  
  // Disable hone par pointer events band taaki hover effect trigger na ho
  const disabledStyle = (disabled || isLoading) 
    ? "opacity-60 cursor-not-allowed pointer-events-none grayscale-[30%]" 
    : "hover:-translate-y-0.5 cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      
      {/* Subtle hover overlay for primary buttons */}
      {variant === 'primary' && !disabled && !isLoading && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300 pointer-events-none"></div>
      )}
    </button>
  );
};

export default Button;