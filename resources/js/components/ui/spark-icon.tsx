import React from 'react';

const SparklesIcon = ({ size = 18, className = "", ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeMiterlimit="10"
      >
        <path d="M17.9 9.9c-4.6.9-6 2.3-6.9 6.9-.9-4.6-2.3-6-6.9-6.9C8.7 9 10.1 7.6 11 3c.9 4.6 2.3 6 6.9 6.9z" />
        <path d="M21.8 25c-3.2.6-4.1 1.6-4.8 4.8-.6-3.2-1.6-4.1-4.8-4.8 3.2-.6 4.1-1.6 4.8-4.8.7 3.2 1.7 4.2 4.8 4.8z" />
        <path d="M29 15c-2.6.5-3.4 1.3-3.9 3.9-.5-2.6-1.3-3.4-3.9-3.9 2.6-.5 3.4-1.3 3.9-3.9.5 2.6 1.3 3.4 3.9 3.9z" />
        <line x1="5" y1="23" x2="5" y2="23" />
        <line x1="28" y1="6" x2="28" y2="6" />
      </g>
    </svg>
  );
};

export default SparklesIcon;