import { Link } from 'react-router-dom';

interface TabNavigationProps {
  playerId: string;
  activeTab: string;
}

const tabs = [
  { id: 'clippd', label: 'ClippD Data', icon: '📊' },
  { id: 'performance', label: 'Performance', icon: '📈' },
  { id: 'offTee', label: 'Off The Tee', icon: '🏌️' },
  { id: 'approach', label: 'Approach', icon: '🎯' },
  { id: 'shortGame', label: 'Around Green', icon: '⛳' },
  { id: 'putting', label: 'Putting', icon: '🏌️‍♂️' },
  { id: 'course', label: 'Course View', icon: '🗺️' },
];

export default function TabNavigation({ playerId, activeTab }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={`/player/${playerId}?tab=${tab.id}`}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
