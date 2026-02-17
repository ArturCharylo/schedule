import { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { ScheduleItem } from '../types';

export interface LessonFormData {
  id?: string;
  subject: string;
  room: string;
  start_time: string;
  end_time: string;
  type: 'class' | 'event';
  color: string;
  date: string;
}

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LessonFormData, isRecurring: boolean) => void;
  onDelete?: () => void;
  initialData?: ScheduleItem;
  currentDate: Date;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export function LessonModal({ isOpen, onClose, onSave, onDelete, initialData, currentDate }: LessonModalProps) {
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'class' | 'event'>('class');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const [isRecurring, setIsRecurring] = useState(true);
  const [date, setDate] = useState('');

  // State for tracking props changes to reset form
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevCurrentDate, setPrevCurrentDate] = useState(currentDate); // Track currentDate to update default date

  if (isOpen !== prevIsOpen || initialData !== prevInitialData || (isOpen && !initialData && currentDate !== prevCurrentDate)) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    setPrevCurrentDate(currentDate);

    if (isOpen) {
        if (initialData) {
            setSubject(initialData.subject);
            setRoom(initialData.room);
            setStartTime(initialData.start_time);
            setEndTime(initialData.end_time);
            setType(initialData.type || 'class');
            setColor(initialData.color || (initialData.type === 'event' ? '#10B981' : '#3B82F6'));

            if ('date' in initialData && initialData.date) {
                setIsRecurring(false);
                setDate(initialData.date);
            } else {
                setIsRecurring(true);
                setDate(format(currentDate, 'yyyy-MM-dd'));
            }
        } else {
            // New item
            setSubject('');
            setRoom('');
            setStartTime('');
            setEndTime('');
            setType('class');
            setColor(PRESET_COLORS[0]);
            setIsRecurring(true);
            setDate(format(currentDate, 'yyyy-MM-dd'));
        }
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: LessonFormData = {
      id: initialData?.id,
      subject,
      room,
      start_time: startTime,
      end_time: endTime,
      type,
      color,
      date,
    };

    onSave(data, isRecurring);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-2xl p-6 border border-white/50 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100/50 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer backdrop-blur-md">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Recurring vs One-time Toggle */}
          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-4 backdrop-blur-sm">
            <button
              type="button"
              className={twMerge(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                  isRecurring ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setIsRecurring(true)}
            >
              Weekly
            </button>
            <button
              type="button"
              className={twMerge(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                  !isRecurring ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setIsRecurring(false)}
            >
              One-time
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-4 backdrop-blur-sm">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${type === 'class' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setType('class')}
            >
              Class
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${type === 'event' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setType('event')}
            >
              Personal
            </button>
          </div>

           {/* Date Input (only if one-time) */}
          {!isRecurring && (
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-gray-200/60 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Title</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-gray-200/60 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
              placeholder={type === 'class' ? "Math" : "Gym"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">{type === 'class' ? 'Room' : 'Location'}</label>
            <input
              type="text"
              required={type === 'class'}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-gray-200/60 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
              placeholder={type === 'class' ? "101" : "Downtown"}
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
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-gray-200/60 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">End</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-gray-200/60 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">Color Code</label>
            <div className="flex flex-wrap gap-3 justify-center bg-white/30 p-3 rounded-2xl border border-white/40">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-white/80 cursor-pointer flex items-center justify-center ${color === c ? 'ring-gray-400 scale-110' : 'ring-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {initialData && onDelete && (
                <button
                    type="button"
                    onClick={() => { onDelete(); onClose(); }}
                    className="flex-none p-3.5 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer active:scale-95 border border-red-100"
                    title="Delete"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
            <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold shadow-lg shadow-gray-300 transition-all active:scale-95 cursor-pointer"
            >
                Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
