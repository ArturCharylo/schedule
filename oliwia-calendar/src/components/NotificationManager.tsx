import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLoading(false);
      return;
    }

    navigator.serviceWorker.ready.then(async (registration) => {
      try {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const subscribeToNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission denied');
      }

      const registration = await navigator.serviceWorker.ready;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID Public Key is missing in environment variables');
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Save subscription to Supabase
      const { error: dbError } = await supabase
        .from('subscriptions')
        .insert({
          subscription_data: subscription.toJSON(),
          user_agent: navigator.userAgent
        });

      if (dbError) throw dbError;

      setIsSubscribed(true);
    } catch (err: unknown) {
      console.error('Failed to subscribe:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to subscribe');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  return (
    <div className="relative">
      {isSubscribed ? (
        <div
          className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 text-green-600 flex items-center justify-center w-12 h-12"
          title="Notifications Active"
        >
          <Check className="w-6 h-6" />
        </div>
      ) : (
        <button
          onClick={subscribeToNotifications}
          disabled={loading}
          className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg border border-white/40 active:scale-95 transition-transform cursor-pointer text-gray-800 hover:bg-white/70 disabled:opacity-50 flex items-center justify-center w-12 h-12"
          title={error || "Enable Notifications"}
        >
          <Bell className="w-6 h-6" />
        </button>
      )}
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 text-red-800 text-xs p-2 rounded shadow-md whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}
