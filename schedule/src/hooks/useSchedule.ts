import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchLessons, fetchEvents, fetchHolidays, fetchLessonExceptions } from '../lib/api';
import type { ScheduleItem, Holiday, Lesson, CalendarEvent } from '../types';

interface UseScheduleResult {
  scheduleItems: ScheduleItem[];
  holiday: Holiday | null;
  loading: boolean;
  refreshSchedule: () => Promise<void>;
}

export function useSchedule(currentDate: Date): UseScheduleResult {
  const queryClient = useQueryClient();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const rawDay = currentDate.getDay();
  const dayOfWeek = rawDay === 0 ? 7 : rawDay;

  // Fetch all data
  const { data: allLessons = [], isLoading: loadingLessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: allEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: allHolidays = [], isLoading: loadingHolidays } = useQuery({
    queryKey: ['holidays'],
    queryFn: fetchHolidays,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: allExceptions = [], isLoading: loadingExceptions } = useQuery({
    queryKey: ['lesson_exceptions'],
    queryFn: fetchLessonExceptions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter and compute derived state
  const { scheduleItems, holiday } = useMemo(() => {
    // 1. Find Holiday for today
    const currentHoliday = allHolidays.find(h => h.date === dateStr) || null;

    // 2. Filter Events (One-time) for today
    const todaysEvents: CalendarEvent[] = allEvents.filter(e => e.date === dateStr);

    let lessons: Lesson[] = [];
    if (!currentHoliday) {
      // 3. Filter Lessons (Recurring) for today (if not holiday)
      lessons = allLessons.filter(l => {
        // Only include if it matches day_of_week and isn't excepted for today
        if (l.day_of_week !== dayOfWeek) return false;

        const isExcepted = allExceptions.some(ex => ex.lesson_id === l.id && ex.date === dateStr);
        return !isExcepted;
      });
    }

    // Merge and Sort
    const allItems: ScheduleItem[] = [...lessons, ...todaysEvents].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });

    return { scheduleItems: allItems, holiday: currentHoliday };
  }, [dateStr, dayOfWeek, allHolidays, allEvents, allLessons, allExceptions]);

  const loading = loadingLessons || loadingEvents || loadingHolidays || loadingExceptions;

  const refreshSchedule = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['lessons'] }),
      queryClient.invalidateQueries({ queryKey: ['events'] }),
      queryClient.invalidateQueries({ queryKey: ['holidays'] }),
      queryClient.invalidateQueries({ queryKey: ['lesson_exceptions'] }),
    ]);
  }, [queryClient]);

  return { scheduleItems, holiday, loading, refreshSchedule };
}
