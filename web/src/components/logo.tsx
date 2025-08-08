import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 42, 
  height = 42, 
  className = "" 
}) => {
  return (
    <img
      src="/images/logo.svg"
      alt="Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};