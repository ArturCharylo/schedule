import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DaySelectorProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export function DaySelector({ currentDate, onSelectDate }: DaySelectorProps) {
  // Initialize weekStart based on currentDate, starting on Monday
  const [weekStart, setWeekStart] = useState(() => startOfWeek(currentDate, { weekStartsOn: 1 }));
  const [prevCurrentDate, setPrevCurrentDate] = useState(currentDate);

  // Sync weekStart if currentDate changes significantly (e.g. from outside navigation)
  if (!isSameDay(currentDate, prevCurrentDate)) {
    setPrevCurrentDate(currentDate);
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    // Only update if the week is different
    if (!isSameDay(startOfCurrentWeek, weekStart)) {
      setWeekStart(startOfCurrentWeek);
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => addWeeks(prev, 1));
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      {/* Week Navigation Header */}
      <div className="flex justify-between items-center px-4 mb-2">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-full hover:bg-white/20 text-gray-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-600">
          {format(weekStart, 'MMMM yyyy')}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-white/20 text-gray-700 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-between items-center bg-white/30 backdrop-blur-xl rounded-2xl p-1 shadow-lg border border-white/20 mx-4">
        {days.map((day) => {
          const isSelected = isSameDay(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={twMerge(
                "flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-300 cursor-pointer min-w-0",
                isSelected
                  ? "bg-white text-gray-800 shadow-md"
                  : "text-gray-600 hover:bg-white/10",
                isToday && !isSelected && "text-blue-600 font-semibold"
              )}
            >
              <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">
                {format(day, 'EEE')}
              </span>
              <span className={twMerge("text-sm font-medium", isSelected && "font-bold")}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
