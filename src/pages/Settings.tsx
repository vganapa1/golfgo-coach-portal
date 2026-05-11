export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-black rounded-apple shadow-apple-lg p-8 border border-gray-900">
        <h1 className="text-4xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="mt-3 text-base text-gray-300 font-light">
          Manage your coach profile and portal preferences
        </p>
      </div>

      {/* Coach Profile */}
      <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-black tracking-tight mb-4">Coach Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
              CR
            </div>
            <div>
              <p className="text-base font-semibold text-black">Coach Ryan</p>
              <p className="text-sm text-gray-500 font-light">floridian. × GolfGo</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Players</p>
              <p className="text-sm font-semibold text-black">2 active</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tournament</p>
              <p className="text-sm font-semibold text-black">PGA Tour Americas Q-School</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Course</p>
              <p className="text-sm font-semibold text-black">Country Club of Ocala</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Dates</p>
              <p className="text-sm font-semibold text-black">March 17–20, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-black tracking-tight mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { label: 'Strategy approval reminders', desc: 'Alert when a player has unreviewed holes', enabled: true },
            { label: 'New round data uploaded', desc: 'Notify when a player syncs new practice round data', enabled: true },
            { label: 'Tournament day alerts', desc: 'Morning reminders on tournament days', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-black">{item.label}</p>
                <p className="text-xs text-gray-400 font-light mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${item.enabled ? 'bg-black' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 font-light">Notification preferences are display-only in the demo version.</p>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-black tracking-tight mb-4">About</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 font-light">Platform</span>
            <span className="font-medium text-black">GolfGo Coach Portal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-light">Version</span>
            <span className="font-medium text-black">Demo 1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-light">Data partner</span>
            <span className="font-medium text-black">ClippD Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
