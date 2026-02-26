import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const base = 'btn';
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  return (
    <button
      className={`${base} ${variantClass} shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent transition-transform duration-150`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
