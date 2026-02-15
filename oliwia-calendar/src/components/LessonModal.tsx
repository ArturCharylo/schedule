import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Lesson } from '../types';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Omit<Lesson, 'id'> | Lesson) => void;
  initialData?: Lesson;
  day: number;
}

export function LessonModal({ isOpen, onClose, onSave, initialData, day }: LessonModalProps) {
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject);
      setRoom(initialData.room);
      setStartTime(initialData.start_time);
      setEndTime(initialData.end_time);
    } else {
      setSubject('');
      setRoom('');
      setStartTime('');
      setEndTime('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lessonData = {
      subject,
      room,
      start_time: startTime,
      end_time: endTime,
      day_of_week: day,
    };

    if (initialData) {
        onSave({ ...lessonData, id: initialData.id });
    } else {
        onSave(lessonData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/50 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Lesson' : 'New Lesson'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Math"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Room</label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="101"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Start</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">End</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 cursor-pointer"
          >
            Save Lesson
          </button>
        </form>
      </div>
    </div>
  );
}
