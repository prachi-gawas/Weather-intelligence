import React from 'react';
import * as Icons from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = '', size = 24, color }) => {
  // Dynamically lookup icon from lucide-react
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[name] || Icons.Cloud;

  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
