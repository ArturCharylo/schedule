interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/50 animate-in fade-in zoom-in duration-200 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Lesson?</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this lesson? This action cannot be undone.</p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-200 transition-colors active:scale-95 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
