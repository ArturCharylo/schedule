import { twMerge } from 'tailwind-merge';

interface DaySelectorProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
}

const days = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
];

export function DaySelector({ currentDay, onSelectDay }: DaySelectorProps) {
  return (
    <div className="flex justify-between items-center bg-white/30 backdrop-blur-xl rounded-2xl p-1 shadow-lg border border-white/20 mx-4 mb-6">
      {days.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelectDay(day.id)}
          className={twMerge(
            "flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer",
            currentDay === day.id
              ? "bg-white text-gray-800 shadow-md"
              : "text-gray-600 hover:bg-white/10"
          )}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
