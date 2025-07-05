import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ className = '', size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-24 h-7',
    md: 'w-34 h-10', 
    lg: 'w-44 h-12'
  };

  const iconSizes = {
    sm: { width: 19, height: 19, fontSize: 10 },
    md: { width: 24, height: 24, fontSize: 12 },
    lg: { width: 29, height: 29, fontSize: 14 }
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
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