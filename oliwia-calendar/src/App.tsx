import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Lesson } from './types';
import { DaySelector } from './components/DaySelector';
import { LessonCard } from './components/LessonCard';
import { LessonModal } from './components/LessonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';

function App() {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | undefined>(undefined);

  // Set current day on mount
  useEffect(() => {
    const today = new Date().getDay();
    // Sunday=0, Monday=1, ..., Saturday=6
    // If weekend (0 or 6), default to Monday (1). Else use today.
    const day = (today === 0 || today === 6) ? 1 : today;
    setCurrentDay(day);
  }, []);

  // Fetch all lessons once on mount
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
    } else {
      setAllLessons(data || []);
    }
    setLoading(false);
  };

  const handleSaveLesson = async (lessonData: Omit<Lesson, 'id'> | Lesson) => {
    if ('id' in lessonData) {
      // Update
      const { error } = await supabase
        .from('lessons')
        .update({
          subject: lessonData.subject,
          room: lessonData.room,
          start_time: lessonData.start_time,
          end_time: lessonData.end_time,
          day_of_week: lessonData.day_of_week
        })
        .eq('id', lessonData.id);

      if (error) console.error('Error updating lesson:', error);
    } else {
      // Create
      const { error } = await supabase
        .from('lessons')
        .insert([lessonData]);

      if (error) console.error('Error creating lesson:', error);
    }

    // Refresh all lessons to ensure local state is in sync
    fetchLessons();
    setEditingLesson(undefined);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonToDelete.id);

    if (error) {
      console.error('Error deleting lesson:', error);
    } else {
      fetchLessons();
    }
    setIsDeleteModalOpen(false);
    setLessonToDelete(undefined);
  };

  const openAddModal = () => {
    setEditingLesson(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const openDeleteModal = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  // Filter lessons for current day
  const lessonsForCurrentDay = allLessons.filter(l => l.day_of_week === currentDay);

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans">
      <div className="blob-bg" />

      <div className="max-w-md mx-auto">
        <header className="px-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900/80">Schedule</h1>
            <p className="text-gray-500 font-medium">Have a great day, Oliwia! ❤️</p>
          </div>
          <button
            onClick={openAddModal}
            className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6 text-gray-800" />
          </button>
        </header>

        <DaySelector currentDay={currentDay} onSelectDay={setCurrentDay} />

        <div className="px-2">
          {loading && allLessons.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : lessonsForCurrentDay.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg">
                <p className="text-gray-600 font-medium text-lg">No classes today! 🎉</p>
                <p className="text-gray-500 text-sm mt-2">Enjoy your free time.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {lessonsForCurrentDay.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLesson}
        initialData={editingLesson}
        day={currentDay}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLesson}
      />
    </div>
  );
}

export default App;
