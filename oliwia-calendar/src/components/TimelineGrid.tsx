import { useMemo } from 'react';
import type { ScheduleItem } from '../types';
import { calculateLayout } from '../lib/layout';
import { TimelineEvent } from './TimelineEvent';

interface TimelineGridProps {
  items: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
}

const START_HOUR = 7;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function TimelineGrid({ items, onEdit }: TimelineGridProps) {
  // Memoize layout calculation to avoid re-calculating on every render
  const layoutEvents = useMemo(() => calculateLayout(items), [items]);

  // Total height in pixels (60px per hour) plus some padding at bottom
  const totalHeight = (END_HOUR - START_HOUR + 1) * 60 + 20;

  return (
    <div className="relative bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/60">
      <div className="h-full overflow-y-auto no-scrollbar scroll-smooth" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
        <div className="relative w-full" style={{ height: `${totalHeight}px` }}>

          {/* Hour Markers & Grid Lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex items-start"
              style={{ top: `${(hour - START_HOUR) * 60}px`, height: '60px' }}
            >
              {/* Time Label */}
              <div className="w-14 flex-shrink-0 text-right pr-3 -mt-2.5 z-20 sticky left-0">
                <span className="text-xs font-semibold text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>

              {/* Horizontal Line */}
              <div className="flex-grow border-t border-gray-200/50 w-full mt-0.5" />
            </div>
          ))}

          {/* Events Container - Offset by time label width */}
          <div className="absolute top-0 right-2 bottom-0 left-14">
             {layoutEvents.map((event) => (
               <TimelineEvent
                 key={event.id}
                 event={event}
                 onClick={(e) => onEdit(e)}
               />
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}
