import { Link } from 'react-router-dom';
import { usePlayerData } from '../hooks/usePlayerData';

export default function Tournaments() {
  const { players, loading } = usePlayerData();

  return (
    <div className="space-y-6">
      <div className="bg-black rounded-apple shadow-apple-lg p-8 border border-gray-900">
        <h1 className="text-4xl font-semibold text-white tracking-tight">Tournaments</h1>
        <p className="mt-3 text-base text-gray-300 font-light">
          Manage upcoming tournaments and player registrations
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-apple shadow-apple border border-gray-200 p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : players.length === 0 ? (
        <div className="bg-white rounded-apple shadow-apple border border-gray-200 p-8 text-center text-gray-500">
          No players yet. Add players to manage tournament strategies.
        </div>
      ) : (
        players.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-apple shadow-apple border border-gray-200 overflow-hidden hover:shadow-apple-lg transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {player.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-black tracking-tight">
                      {player.name}
                    </h2>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-light">
                        Tournament coming up
                      </p>
                      <p className="text-lg font-semibold text-black mt-1">
                        Create strategy for upcoming tournament
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to={`/create-strategy/${player.id}`}
                  className="block w-full px-5 py-3 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm text-center"
                >
                  Create Custom Strategy
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
