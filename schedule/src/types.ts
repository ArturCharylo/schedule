export interface Lesson {
  id: string;
  day_of_week: number; // 1-5
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  subject: string;
  room: string;
  type?: 'class' | 'event';
  color?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  type?: 'class' | 'event';
  color?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface LessonException {
  id: string;
  lesson_id: string;
  date: string; // YYYY-MM-DD
}

export type ScheduleItem = Lesson | CalendarEvent;
