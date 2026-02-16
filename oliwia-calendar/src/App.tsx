import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Lesson } from './types';
import { DaySelector } from './components/DaySelector';
import { TimelineGrid } from './components/TimelineGrid';
import { LessonModal } from './components/LessonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { NotificationManager } from './components/NotificationManager';

// 1. Define fetch function OUTSIDE component
async function fetchAllLessonsFromDb() {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
  return data || [];
}

function App() {
  // Lazy initialization for day of week
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const today = new Date().getDay();
    // Sunday=0, Monday=1... If weekend, set to Monday.
    return (today === 0 || today === 6) ? 1 : today;
  });

  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    fetchAllLessonsFromDb().then((data) => {
      if (mounted) {
        setAllLessons(data);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  const refreshLessons = async () => {
    const data = await fetchAllLessonsFromDb();
    setAllLessons(data);
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
          day_of_week: lessonData.day_of_week,
          type: lessonData.type,
          color: lessonData.color,
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

    await refreshLessons();
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
      await refreshLessons();
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
    // When called from Timeline, the modal might be open.
    // But usually we open delete confirmation from the edit modal or directly.
    // In my design, I pass onDelete to LessonModal.
    // So LessonModal calls this.
    setLessonToDelete(lesson);
    // We should close the edit modal if it's open, but let's just open the confirm modal.
    // Actually, LessonModal closes itself before calling onDelete if I implemented it that way?
    // In LessonModal: onClick={() => { onDelete(); onClose(); }}
    // So LessonModal closes, then openDeleteModal is called.
    setIsDeleteModalOpen(true);
  };

  // Filter lessons for current day
  const lessonsForCurrentDay = allLessons.filter(l => l.day_of_week === currentDay);

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans overflow-hidden">
      <div className="blob-bg" />

      <div className="max-w-md mx-auto h-full flex flex-col">
        <header className="px-6 mb-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900/80">Schedule</h1>
            <p className="text-gray-500 font-medium">Have a great day, Oliwia! ❤️</p>
          </div>
          <div className="flex gap-2">
            <NotificationManager />
            <button
              onClick={openAddModal}
              className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="shrink-0 mb-4">
          <DaySelector currentDay={currentDay} onSelectDay={setCurrentDay} />
        </div>

        <div className="px-2 flex-grow relative pb-4">
          {loading && allLessons.length === 0 ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <TimelineGrid
              lessons={lessonsForCurrentDay}
              onEdit={openEditModal}
            />
          )}
        </div>
      </div>

      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLesson}
        onDelete={editingLesson ? () => openDeleteModal(editingLesson) : undefined}
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
