import { Clock, MapPin, Calendar } from 'lucide-react';
import type { LayoutEvent } from '../lib/layout';
import { twMerge } from 'tailwind-merge';

interface TimelineEventProps {
  event: LayoutEvent;
  onClick: (event: LayoutEvent) => void;
}

export function TimelineEvent({ event, onClick }: TimelineEventProps) {
  // Determine color style based on event color or type
  // Default to blue for class, green for event if no color specified
  const baseColor = event.color || (event.type === 'event' ? '#10B981' : '#3B82F6');

  // Distinguish one-time events
  // Recurring has 'day_of_week', one-time has 'date'
  const isOneTime = 'date' in event;

  // Calculate style for dynamic positioning
  // We use inline styles for dynamic positioning which is standard for timelines
  const style: React.CSSProperties = {
    top: `${event.top}px`,
    height: `${event.height}px`,
    left: `${event.left}%`,
    width: `${event.width}%`,
    borderColor: baseColor,
    backgroundColor: `${baseColor}26`, // ~15% opacity (hex alpha)
  };

  return (
    <div
      onClick={() => onClick(event)}
      style={style}
      className={twMerge(
        "absolute p-2 rounded-xl border-l-4 backdrop-blur-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer overflow-hidden z-10 group shadow-sm hover:shadow-md hover:z-20",
        isOneTime && "border-dashed ring-1 ring-black/5"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-0.5 gap-1">
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight line-clamp-2">
            {event.subject}
          </h3>
          {isOneTime && <Calendar className="w-3 h-3 text-gray-500/70 flex-shrink-0 mt-0.5" />}
        </div>

        <div className="mt-1 space-y-0.5">
          <div className="flex items-center text-[10px] sm:text-xs text-gray-700 font-medium">
            <Clock className="w-3 h-3 mr-1 opacity-70 flex-shrink-0" />
            <span className="truncate">
              {event.start_time} - {event.end_time}
            </span>
          </div>

          {event.room && (
            <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-1 opacity-70 flex-shrink-0" />
              <span className="truncate">{event.room}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
