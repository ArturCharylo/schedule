export interface Lesson {
  id: string;
  day_of_week: number; // 1-5
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  subject: string;
  room: string;
}
