interface RoundSelectorProps {
  selectedRound: number | 'all';
  onRoundChange: (round: number | 'all') => void;
  availableRounds: number[];
}

export default function RoundSelector({ 
  selectedRound, 
  onRoundChange, 
  availableRounds 
}: RoundSelectorProps) {
  const options = [
    { value: 'all', label: 'All Rounds' },
    ...availableRounds.map(num => ({ value: num, label: `Round ${num}` }))
  ];

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">View:</label>
      <div className="flex space-x-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onRoundChange(option.value as number | 'all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRound === option.value
                ? 'bg-golf-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
