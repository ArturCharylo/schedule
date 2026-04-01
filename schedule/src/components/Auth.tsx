import { useState } from 'react';
import { Mail, Lock, Loader2, Calendar, User } from 'lucide-react'; // Added User icon
import { supabase } from '../lib/supabase';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // New state for display name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Attempt to log in the user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Attempt to sign up a new user with custom metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: displayName, // Save the display name to user_metadata
            },
          },
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during authentication.');
      } else {
        setError('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans overflow-hidden flex items-center justify-center px-4">
      {/* Background styling matching the main app */}
      <div className="blob-bg" />

      <div className="w-full max-w-sm">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 mb-4">
            <Calendar className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900/80 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Sign in to your schedule' : 'Start organizing your time'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="p-6 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-100/80 text-red-800 text-sm rounded-2xl border border-red-200 text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Display Name Input - Only visible during Sign Up */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="displayName">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    required={!isLogin} // Only required when signing up
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-white/60 border border-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm outline-none text-gray-800"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white/60 border border-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm outline-none text-gray-800"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white/60 border border-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm outline-none text-gray-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-md text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 mt-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Toggle View */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null); // Clear errors when toggling views
              }}
              type="button"
              className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}