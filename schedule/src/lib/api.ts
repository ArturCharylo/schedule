import { supabase } from './supabase';
import type { Lesson, CalendarEvent, Holiday, LessonException } from '../types';

export async function fetchLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchLessonExceptions(): Promise<LessonException[]> {
  const { data, error } = await supabase
    .from('lesson_exceptions')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function addLessonException(lessonId: string, date: string): Promise<LessonException> {
  const { data, error } = await supabase
    .from('lesson_exceptions')
    .insert([{ lesson_id: lessonId, date }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeLessonException(id: string): Promise<void> {
  const { error } = await supabase
    .from('lesson_exceptions')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
