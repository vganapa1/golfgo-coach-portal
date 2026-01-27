import { Link } from 'react-router-dom';

export default function Tournaments() {
  return (
    <div className="space-y-6">
      <div className="bg-black rounded-apple shadow-apple-lg p-8 border border-gray-900">
        <h1 className="text-4xl font-semibold text-white tracking-tight">Tournaments</h1>
        <p className="mt-3 text-base text-gray-300 font-light">
          Manage upcoming tournaments and player registrations
        </p>
      </div>

      {/* Jordan Matthews Tournament Card */}
      <div className="bg-white rounded-apple shadow-apple border border-gray-200 overflow-hidden hover:shadow-apple-lg transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xl">
                JM
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-black tracking-tight">
                  Jordan Matthews
                </h2>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 font-light">
                    Tournament coming up
                  </p>
                  <p className="text-lg font-semibold text-black mt-1">
                    Okeeheelee February Classic
                  </p>
                  <p className="text-sm text-gray-600 font-light mt-1">
                    February 16, 2026
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/create-strategy/player_001"
              className="block w-full px-5 py-3 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm text-center"
            >
              Create Custom Strategy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
