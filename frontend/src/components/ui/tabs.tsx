import { ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface TabsContentProps {
  children: ReactNode;
  value: string;
  activeTab: string;
  className?: string;
}

export function Tabs({ children, className = '' }: TabsProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {children}
      </nav>
    </div>
  );
}

export function TabsTrigger({ children, onClick, isActive, className = '' }: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, activeTab, className = '' }: TabsContentProps) {
  if (value !== activeTab) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
}
