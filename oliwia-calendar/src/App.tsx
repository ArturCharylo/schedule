import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Lesson } from './types';
import { DaySelector } from './components/DaySelector';
import { LessonCard } from './components/LessonCard';
import { LessonModal } from './components/LessonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';

// 1. Zdefiniuj funkcję pobierania POZA komponentem.
// To gwarantuje, że nie ma ona dostępu do stanu i nie powoduje pętli renderowania.
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
  // Lazy initialization dla dnia tygodnia (optymalizacja)
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const today = new Date().getDay();
    // Sunday=0, Monday=1... Jeśli weekend, ustaw poniedziałek.
    return (today === 0 || today === 6) ? 1 : today;
  });

  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  // Startujemy z loading: true, żeby nie ustawiać go w useEffect
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | undefined>(undefined);

  // 2. useEffect służy teraz TYLKO do pierwszego załadowania
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

  // 3. Funkcja pomocnicza do odświeżania danych (używana przy Zapisz/Usuń)
  const refreshLessons = async () => {
    // Opcjonalnie: setLoading(true) jeśli chcesz pokazać spinner przy odświeżaniu
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

    // Odśwież dane po zapisie (Silent Refresh)
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