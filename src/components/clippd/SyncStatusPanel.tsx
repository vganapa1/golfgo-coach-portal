interface SyncStatusPanelProps {
  compatible: boolean;
  issues: string[];
  readyMetrics: number;
  totalMetrics: number;
  onSync: () => void;
  isSyncing: boolean;
}

export default function SyncStatusPanel({ 
  compatible, 
  issues, 
  readyMetrics, 
  totalMetrics,
  onSync,
  isSyncing,
}: SyncStatusPanelProps) {
  const completionPercentage = (readyMetrics / totalMetrics) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-bold text-gray-900 mb-3">Sync Status</h3>

      {/* Compatibility Badge */}
      <div className={`mb-4 p-3 rounded-lg ${compatible ? 'bg-green-50 border-2 border-green-500' : 'bg-yellow-50 border-2 border-yellow-500'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${compatible ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
            {compatible ? '✓' : '⚠'}
          </div>
          <div className="min-w-0">
            <h4 className={`text-sm font-bold ${compatible ? 'text-green-900' : 'text-yellow-900'}`}>
              {compatible ? 'Ready to Sync' : 'Partial Compatibility'}
            </h4>
            <p className={`text-xs ${compatible ? 'text-green-700' : 'text-yellow-700'}`}>
              {readyMetrics} of {totalMetrics} metrics ready
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Data Completeness</span>
          <span className="font-bold">{completionPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-golf-green-600 h-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Data Gaps:</h4>
          <ul className="space-y-1">
            {issues.map((issue, index) => (
              <li key={index} className="text-xs text-yellow-700 flex items-start">
                <span className="mr-1">•</span>
                <span className="break-words">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sync Button */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className={`w-full py-2 px-3 rounded-lg text-sm font-bold text-white transition-all ${
          isSyncing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-golf-green-600 hover:bg-golf-green-700'
        }`}
      >
        {isSyncing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </span>
        ) : (
          '🔄 Sync to ClippD'
        )}
      </button>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Demo mode: API integration coming soon
      </p>
    </div>
  );
}
