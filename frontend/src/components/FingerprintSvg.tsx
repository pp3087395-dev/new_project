import type { FC } from 'react';

interface FingerprintSvgProps {
  className?: string;
  opacity?: number;
}

export const FingerprintSvg: FC<FingerprintSvgProps> = ({ 
  className = "w-40 h-40", 
  opacity = 0.06 
}) => {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      {/* Concentric Forensic Fingerprint Whorls */}
      <path
        d="M80 30 C52 30 35 48 35 75 C35 110 50 135 80 135 C110 135 125 110 125 75 C125 48 108 30 80 30"
        stroke="#80B9A5"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path
        d="M80 40 C58 40 45 54 45 76 C45 106 58 125 80 125 C102 125 115 106 115 76 C115 54 102 40 80 40"
        stroke="#80B9A5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M80 50 C65 50 55 61 55 77 C55 101 66 115 80 115 C94 115 105 101 105 77 C105 61 95 50 80 50"
        stroke="#80B9A5"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="6 3"
      />
      <path
        d="M80 60 C71 60 65 67 65 78 C65 95 72 105 80 105 C88 105 95 95 95 78 C95 67 89 60 80 60"
        stroke="#80B9A5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M80 70 C76 70 73 73 73 79 C73 88 77 95 80 95 C83 95 87 88 87 79 C87 73 84 70 80 70"
        stroke="#80B9A5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Outer Arch Lines */}
      <path
        d="M25 80 C25 45 48 20 80 20 C112 20 135 45 135 80 C135 118 118 145 80 145 C42 145 25 118 25 80"
        stroke="#80B9A5"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <path
        d="M15 85 C15 40 42 10 80 10 C118 10 145 40 145 85 C145 125 125 155 80 155"
        stroke="#80B9A5"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

