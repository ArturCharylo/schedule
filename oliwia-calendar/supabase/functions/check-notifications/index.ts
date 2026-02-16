import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import webpush from 'npm:web-push@3.6.7';

// Types
interface Lesson {
  id: string;
  day_of_week: number;
  start_time: string;
  subject: string;
  room: string;
  notification_sent: boolean;
}

interface Subscription {
  id: string;
  subscription_data: unknown;
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VITE_VAPID_PRIVATE_KEY')!;
    const vapidSubject = 'mailto:artur.cha@outlook.com';

    if (!supabaseUrl || !supabaseServiceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    // 1. Get current time in Poland
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      hour12: false
    });

    const now = new Date();
    const parts = formatter.formatToParts(now);
    const hourStr = parts.find(p => p.type === 'hour')?.value || '00';
    const minuteStr = parts.find(p => p.type === 'minute')?.value || '00';
    const dayName = parts.find(p => p.type === 'weekday')?.value;

    const daysMap: Record<string, number> = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5,
      'Saturday': 6, 'Sunday': 7
    };

    const currentDay = daysMap[dayName || ''] || 0;
    const currentHour = parseInt(hourStr, 10);
    const currentMinute = parseInt(minuteStr, 10);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    console.log(`Current time (Warsaw): ${currentHour}:${currentMinute}, Day: ${currentDay}`);

    // 2. Fetch today's lessons that haven't been notified
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('day_of_week', currentDay)
      .eq('notification_sent', false);

    if (lessonsError) throw lessonsError;

    const lessonsToNotify: Lesson[] = [];

    for (const lesson of (lessons || [])) {
      const [h, m] = lesson.start_time.split(':').map(Number);
      const lessonTotalMinutes = h * 60 + m;

      const diff = lessonTotalMinutes - currentTotalMinutes;

      // Check if within 15-20 minutes
      if (diff >= 15 && diff <= 20) {
        lessonsToNotify.push(lesson);
      }
    }

    if (lessonsToNotify.length === 0) {
      return new Response(JSON.stringify({ message: 'No lessons to notify' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Fetch subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*');

    if (subsError) throw subsError;

    // 4. Send notifications
    const results = [];

    for (const lesson of lessonsToNotify) {
      const payload = JSON.stringify({
        title: "Za 15 minut!",
        body: `${lesson.subject} w sali ${lesson.room}`,
        icon: "/web-app-manifest-192x192.png"
      });

      const promises = (subscriptions || []).map(async (sub: Subscription) => {
        try {
          await webpush.sendNotification(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sub.subscription_data as any,
            payload
          );
          return { status: 'fulfilled', subId: sub.id };
        } catch (error: unknown) {
          const webPushError = error as { statusCode?: number };
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
             // Delete expired subscription
             await supabase.from('subscriptions').delete().eq('id', sub.id);
             return { status: 'deleted', subId: sub.id };
          }
          console.error('Error sending notification:', error);
          return { status: 'rejected', subId: sub.id, error };
        }
      });

      await Promise.all(promises);

      // Mark lesson as notified
      await supabase
        .from('lessons')
        .update({ notification_sent: true })
        .eq('id', lesson.id);

      results.push({ lesson: lesson.subject, sent: true });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
