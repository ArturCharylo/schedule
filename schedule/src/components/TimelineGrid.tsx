// src/components/TimelineGrid.tsx
import { useMemo, useState } from 'react';
import type { ScheduleItem } from '../types';
import { calculateLayout } from '../lib/layout';
import { TimelineEvent } from './TimelineEvent';

interface TimelineGridProps {
  items: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
  slideDirection: 'left' | 'right';
  currentDate: Date;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const START_HOUR = 7;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function TimelineGrid({ items, onEdit, slideDirection, currentDate, onSwipeLeft, onSwipeRight }: TimelineGridProps) {
  const layoutEvents = useMemo(() => calculateLayout(items), [items]);
  const totalHeight = (END_HOUR - START_HOUR + 1) * 60 + 20;

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchStart.x - touchEndX;
    const dy = touchStart.y - touchEndY;

    // chechking if the swipe is more horizontal than vertical and exceeds the minimum distance
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
      if (dx > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
    setTouchStart(null);
  };

  return (
    <div 
      className="relative bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/60 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-full overflow-y-auto no-scrollbar scroll-smooth pt-7" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
        <div className="relative w-full" style={{ height: `${totalHeight}px` }}>

          {/* Grid lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex items-start"
              style={{ top: `${(hour - START_HOUR) * 60}px`, height: '60px' }}
            >
              <div className="w-14 flex-shrink-0 text-right pr-3 -mt-2.5 z-20 sticky left-0">
                <span className="text-xs font-semibold text-gray-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex-grow border-t border-gray-200/50 w-full mt-0.5" />
            </div>
          ))}

          <div
            key={currentDate.toISOString()}
            className={`absolute top-0 right-2 bottom-0 left-14 ${slideDirection === 'right' ? 'animate-slide-blur-right' : 'animate-slide-blur-left'}`}
          >
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