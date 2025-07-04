import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ className = '', size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-20 h-6',
    md: 'w-28 h-8', 
    lg: 'w-36 h-10'
  };

  const iconSizes = {
    sm: { width: 16, height: 16, fontSize: 8 },
    md: { width: 20, height: 20, fontSize: 10 },
    lg: { width: 24, height: 24, fontSize: 12 }
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = iconSizes[size];
  const textSize = textSizes[size];

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {/* Logo Icon */}
      <div 
        className="bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center text-white font-bold mr-2"
        style={{ 
          width: iconSize.width, 
          height: iconSize.height,
          fontSize: iconSize.fontSize
        }}
      >
        H
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-semibold text-gray-900 ${textSize}`}>
          HitchBuddy
        </span>
      )}
    </div>
  );
};