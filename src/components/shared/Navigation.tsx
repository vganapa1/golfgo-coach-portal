import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navigation() {
  return (
    <nav className="bg-black w-full sticky top-0 z-50">
      <div className="w-full px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center space-x-1">
            <Link 
              to="/round-defense" 
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
            >
              Round Defense
            </Link>
            <Link 
              to="/tournaments" 
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
            >
              Tournaments
            </Link>
            <Link 
              to="/faq" 
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
            >
              FAQ
            </Link>
            <Link 
              to="/settings" 
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
