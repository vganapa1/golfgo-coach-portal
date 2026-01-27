export default function ConfidenceKey() {
  return (
    <div className="bg-black rounded-apple shadow-apple border border-gray-900 px-5 py-3">
      <div className="flex items-center space-x-6">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Key:</span>
        
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black text-[10px] font-medium">✓</span>
          <span className="text-xs font-medium text-white">High</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-[10px] font-medium">○</span>
          <span className="text-xs font-medium text-white">Medium</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-medium">!</span>
          <span className="text-xs font-medium text-white">Low</span>
        </div>

        <span className="text-[10px] text-gray-400 font-light border-l border-gray-700 pl-4">
          Medium/Low require approval
        </span>
      </div>
    </div>
  );
}
