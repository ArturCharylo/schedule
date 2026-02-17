import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Lesson, CalendarEvent, Holiday, ScheduleItem } from '../types';

interface UseScheduleResult {
  scheduleItems: ScheduleItem[];
  holiday: Holiday | null;
  loading: boolean;
  refreshSchedule: () => Promise<void>;
}

export function useSchedule(currentDate: Date): UseScheduleResult {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const rawDay = currentDate.getDay();
    const dayOfWeek = rawDay === 0 ? 7 : rawDay;

    try {
      // 1. Fetch Holidays
      const { data: holidaysData, error: holidaysError } = await supabase
        .from('holidays')
        .select('*')
        .eq('date', dateStr);

      if (holidaysError) throw holidaysError;

      const currentHoliday = holidaysData && holidaysData.length > 0 ? holidaysData[0] : null;
      setHoliday(currentHoliday);

      // 2. Fetch Events (One-time)
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('date', dateStr);

      if (eventsError) throw eventsError;

      const events: CalendarEvent[] = eventsData || [];

      // Logic:
      // IF holiday has an entry for today: Return ONLY events (One-time). Do NOT show lessons.
      // ELSE: Return lessons + events merged together.

      let lessons: Lesson[] = [];
      if (!currentHoliday) {
        // Fetch Lessons (Recurring) only if not a holiday
        // Map dayOfWeek: 0(Sun)..6(Sat). Lessons table uses 1(Mon)..5(Fri).
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('day_of_week', dayOfWeek);

        if (lessonsError) throw lessonsError;
        lessons = lessonsData || [];
      }

      // Merge and Sort
      const allItems: ScheduleItem[] = [...lessons, ...events].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });

      setScheduleItems(allItems);

    } catch (error) {
      console.error('Error fetching schedule:', error);
      setScheduleItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { scheduleItems, holiday, loading, refreshSchedule: fetchSchedule };
}
