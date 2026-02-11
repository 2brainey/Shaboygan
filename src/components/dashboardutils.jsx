import { HelpCircle } from 'lucide-react';

const IconMap = {
  // Add your icon mappings here
  // Example: help: HelpCircle,
};

export const RenderIcon = ({ name, size = 16, className = "" }) => {
  const IconComponent = IconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};