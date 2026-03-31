import { useState } from 'react';
import { Mail, Lock, Loader2, X, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, onClose, currentEmail, onLogout }: SettingsModalProps) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Prepare the update payload based on user input
      const updates: { email?: string; password?: string } = {};
      if (email !== currentEmail) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'error', text: 'No changes to update.' });
        setLoading(false);
        return;
      }

      // Call Supabase auth to update user credentials
      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Account updated successfully!' });
      setPassword(''); // Clear password field after success
      
      // Close modal automatically after a short delay
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: 'error', text: err.message });
      } else {
        setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          
          {/* Status Message */}
          {message && (
            <div className={`p-3 text-sm rounded-2xl border text-center ${message.type === 'success' ? 'bg-green-100/80 text-green-800 border-green-200' : 'bg-red-100/80 text-red-800 border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="settings-email">
              Update Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="settings-password">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="settings-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm outline-none text-gray-800"
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-md text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 mt-4 cursor-pointer"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
          </button>

          <button
                type="button"
                onClick={onLogout}
                className="w-full flex justify-center py-3 px-4 rounded-2xl text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all cursor-pointer"
            >
                Log Out
            </button>
        </form>
      </div>
    </div>
  );
}