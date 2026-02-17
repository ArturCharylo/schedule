import { useState } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to refresh the schedule after adding
}

export function HolidayModal({ isOpen, onClose, onSave }: HolidayModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    setIsSubmitting(true);

    try {
      // 1. Calculate all dates in the range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const datesToInsert = [];

      // Loop from start to end date
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToInsert.push({
          date: new Date(d).toISOString().split('T')[0], // Format YYYY-MM-DD
          name: name,
        });
      }

      // 2. Bulk insert into Supabase
      // ignoreDuplicates: true allows overlapping ranges without crashing
      const { error } = await supabase
        .from('holidays')
        .upsert(datesToInsert, { onConflict: 'date', ignoreDuplicates: true });

      if (error) throw error;

      // 3. Cleanup and close
      onSave(); // Refresh data in App
      onClose();
      setName('');
      setStartDate('');
      setEndDate('');

    } catch (error) {
      console.error('Error adding holidays:', error);
      alert('Failed to add holidays. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Add Days Off
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Winter Break, School Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                required
                min={startDate} // Cannot end before start
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Save Range'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}