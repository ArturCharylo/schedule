import { Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}

export function LessonCard({ lesson, onEdit, onDelete }: LessonCardProps) {
  return (
    <div className="relative group bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-5 mb-4 mx-4 transition-transform active:scale-95 duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{lesson.subject}</h3>
          <div className="flex items-center text-gray-600 mt-2 text-sm font-medium">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{lesson.start_time} - {lesson.end_time}</span>
          </div>
          <div className="flex items-center text-gray-500 mt-1 text-sm">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{lesson.room}</span>
          </div>
        </div>

        <div className="flex space-x-2">
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(lesson); }}
                className="p-2 rounded-full bg-white/50 hover:bg-white text-blue-600 transition-colors shadow-sm cursor-pointer"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(lesson); }}
                className="p-2 rounded-full bg-white/50 hover:bg-red-50 text-red-500 transition-colors shadow-sm cursor-pointer"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
}
