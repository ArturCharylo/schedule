import { supabase } from './supabase';
import type { Lesson, CalendarEvent, Holiday } from '../types';

export async function fetchLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchHolidays(): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from('holidays')
    .select('*');

  if (error) throw error;
  return data || [];
}
