import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 font-semibold uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900";
  
  const variants = {
    primary: "bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-500",
    secondary: "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 focus:ring-zinc-600",
    accent: "bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-400",
    danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};
