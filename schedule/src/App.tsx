import { useState } from 'react';
import { Plus, Loader2, CalendarRange, Settings } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import type { ScheduleItem } from './types';
import { DaySelector } from './components/DaySelector';
import { TimelineGrid } from './components/TimelineGrid';
import { LessonModal } from './components/LessonModal';
import type { LessonFormData } from './components/LessonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { NotificationManager } from './components/NotificationManager';
import { useSchedule } from './hooks/useSchedule';
import { HolidayModal } from './components/HolidayModal';
import { SettingsModal } from './components/SettingsModal';
import { addDays, subDays } from 'date-fns';

interface AppProps {
  session: Session;
}

function App({ session }: AppProps) {
  // 1. Current Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // 2. Fetch Schedule Data
  const { scheduleItems, holiday, loading, refreshSchedule } = useSchedule(currentDate);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false); // New State
  const [editingItem, setEditingItem] = useState<ScheduleItem | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ScheduleItem | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 3. Handle Save (Create/Update)
  const handleSaveItem = async (data: LessonFormData, isRecurring: boolean) => {
    // Data contains: subject, room, start_time, end_time, type, color, date (if provided), id (if edit)

    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();

    const commonFields = {
        subject: data.subject,
        room: data.room,
        start_time: data.start_time,
        end_time: data.end_time,
        type: data.type,
        color: data.color,
    };

    if (data.id && editingItem) {
        // --- EDIT EXISTING ITEM ---
        const wasRecurring = !('date' in editingItem);
        const wasOneTime = 'date' in editingItem;

        if (wasRecurring && isRecurring) {
             // 1. Lesson -> Lesson (Update)
             const { error } = await supabase
                .from('lessons')
                .update({ ...commonFields, day_of_week: dayOfWeek })
                .eq('id', data.id);
             if (error) console.error('Error updating lesson:', error);

        } else if (wasOneTime && !isRecurring) {
             // 2. Event -> Event (Update)
             const { error } = await supabase
                .from('events')
                .update({ ...commonFields, date: data.date })
                .eq('id', data.id);
             if (error) console.error('Error updating event:', error);

        } else {
             // 3. Conversion (Type changed: Recurring <-> One-time)
             if (wasRecurring) {
                 // Converting Lesson to Event
                 const { error: insertError } = await supabase
                    .from('events')
                    .insert([{ ...commonFields, date: data.date }]);
                 
                 if (!insertError) {
                    await supabase.from('lessons').delete().eq('id', data.id);
                 } else {
                    console.error('Error converting lesson to event:', insertError);
                    alert("Failed to convert lesson to event. No changes made.");
                 }
             } else {
                 // Converting Event to Lesson
                 const { error: insertError } = await supabase
                    .from('lessons')
                    .insert([{ ...commonFields, day_of_week: dayOfWeek }]);
                 
                 if (!insertError) {
                    await supabase.from('events').delete().eq('id', data.id);
                 } else {
                     console.error('Error converting event to lesson:', insertError);
                     alert("Failed to convert event to lesson. No changes made.");
                 }
             }
        }

    } else {
        // --- CREATE NEW ITEM ---
        if (isRecurring) {
             const { error } = await supabase
                .from('lessons')
                .insert([{ ...commonFields, day_of_week: dayOfWeek }]);
             if (error) console.error('Error creating lesson:', error);
        } else {
             const { error } = await supabase
                .from('events')
                .insert([{ ...commonFields, date: data.date }]);
             if (error) console.error('Error creating event:', error);
        }
    }

    await refreshSchedule();
    setEditingItem(undefined);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    if ('date' in itemToDelete) {
        // Delete Event
        const { error } = await supabase.from('events').delete().eq('id', itemToDelete.id);
        if (error) console.error('Error deleting event:', error);
    } else {
        // Delete Lesson
        const { error } = await supabase.from('lessons').delete().eq('id', itemToDelete.id);
        if (error) console.error('Error deleting lesson:', error);
    }

    await refreshSchedule();
    setIsDeleteModalOpen(false);
    setItemToDelete(undefined);
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: ScheduleItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSelectDate = (newDate: Date) => {
    if (newDate > currentDate) {
      setSlideDirection('right');
    } else if (newDate < currentDate) {
      setSlideDirection('left');
    }
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    handleSelectDate(addDays(currentDate, 1));
  };

  const handlePrevDay = () => {
    handleSelectDate(subDays(currentDate, 1));
  }

  const handleLogout = async () => {
    // Clear the cache to prevent the next user from seeing the current user's data
    queryClient.clear();
    await supabase.auth.signOut();
  };

  const userDisplayName = session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans overflow-hidden">
      <div className="blob-bg" />

      <div className="max-w-md mx-auto h-full flex flex-col">
        <header className="px-6 mb-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900/80">Schedule</h1>
            <p className="text-gray-500 font-medium">Have a great day, {userDisplayName}! ❤️</p>
          </div>
          <div className="flex gap-2">
            <NotificationManager />
            
            {/* New Holiday Button */}
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer"
              title="Add Days Off"
            >
              <CalendarRange className="w-6 h-6 text-purple-600" />
            </button>

            <button
              onClick={openAddModal}
              className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6 text-gray-800" />
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer"
              title="Settings"
            >
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </header>

        <div className="shrink-0 mb-4">
          <DaySelector currentDate={currentDate} onSelectDate={handleSelectDate} />
        </div>

        {holiday && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-2xl shadow-sm text-center">
                <p className="text-red-800 font-bold text-lg">🎉 Holiday: {holiday.name}</p>
                <p className="text-red-600/80 text-sm">No classes today!</p>
            </div>
        )}

        <div className="px-2 flex-grow relative pb-4">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-hidden w-full relative">
              <TimelineGrid
                items={scheduleItems}
                onEdit={openEditModal}
                slideDirection={slideDirection}
                currentDate={currentDate}
                onSwipeLeft={handleNextDay}
                onSwipeRight={handlePrevDay}
              />
            </div>
          )}
        </div>
      </div>

      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={editingItem ? () => openDeleteModal(editingItem) : undefined}
        initialData={editingItem}
        currentDate={currentDate}
      />

      <HolidayModal 
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onSave={refreshSchedule}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentEmail={session.user.email || ''}
        currentName={session.user.user_metadata?.first_name || ''}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;