import React from 'react';

const CloudIcon = ({ size = 18, className = "", ...props }) => {
  return (
    <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M17.5 10c2.5 0 4.5 2 4.5 4.5S20 19 17.5 19H7.5C5 19 3 17 3 14.5c0-2.3 1.7-4.2 4-4.5.3-2.6 2.5-4.5 5.1-4.5.9 0 1.8.2 2.6.7-.4.5-.7 1.2-.7 1.8.1 1.7 1.4 3 3.1 2.9 1-.1 1.9-.6 2.4-1.4-.4.8-1 1.5-1.8 1.9.8.3 1.6.6 2.3 1-.3-.6-.6-1.2-1-1.8z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.9 2.5c.3 1 .2 2-.3 2.9-.6.9-1.5 1.5-2.6 1.7 1-.1 1.9-.6 2.4-1.4-.4.8-1 1.5-1.8 1.9.8.3 1.6.6 2.3 1.1-.3-.6-.6-1.2-1-1.8.8.1 1.6.3 2.3.6-.3-.7-.7-1.4-1.2-2.1.6-.1 1.2-.2 1.8-.1-.4-.8-1-1.5-1.7-1.9.8.1 1.6.3 2.3.6-.3-.7-.7-1.4-1.2-2.1.6-.1 1.2-.2 1.8-.1-.4-.8-1-1.5-1.7-1.9.8.1 1.6.3 2.3.6-.3-.7-.7-1.4-1.2-2.1.6-.1 1.2-.2 1.8-.1Z"
      fill="#e2e8f0" // Optional, very subtle moon fill for dark mode
    />
  </svg>
  );
};

export default CloudIcon;