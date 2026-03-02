import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import webpush from 'npm:web-push@3.6.7';

// --- Types ---
interface ScheduleItem {
  id: string;
  start_time: string;
  subject: string;
  room: string;
  notification_sent: boolean;
  type: 'lesson' | 'event'; // Helper to distinguish source
}

interface Subscription {
  id: string;
  subscription_data: unknown;
}

Deno.serve(async () => {
  try {
    // 1. Setup & Config
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VITE_VAPID_PRIVATE_KEY')!;
    const vapidSubject = 'mailto:artur.cha@outlook.com';

    if (!supabaseUrl || !supabaseServiceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // 2. Get current time (Poland)
    const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD format
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Format parts to get clean values
    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
    
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hourStr = getPart('hour');
    const minuteStr = getPart('minute');

    const todayDateString = `${year}-${month}-${day}`; // YYYY-MM-DD
    const currentHour = parseInt(hourStr, 10);
    const currentMinute = parseInt(minuteStr, 10);
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // Calculate Day of Week (0-6, where 0 is Sunday in JS, but usually 1-7 in our DB?)
    // Let's verify standard JS getDay(): 0=Sun, 1=Mon... 
    // Your App.tsx uses getDay(), so we use the same logic.
    // Trick: create date object from the Polish string components to get correct weekday
    // (creating "new Date()" directly uses server UTC time, which might be different day)
    const polishDateObj = new Date(`${todayDateString}T${hourStr}:${minuteStr}:00`);
    const rawDay = polishDateObj.getDay();
    const currentDayOfWeek = rawDay === 0 ? 7 : rawDay;

    console.log(`Time (PL): ${todayDateString} ${currentHour}:${currentMinute}, DayOfWeek: ${currentDayOfWeek}`);

    // 3. Check for Holiday
    const { data: holidays } = await supabase
      .from('holidays')
      .select('name')
      .eq('date', todayDateString);
    
    const isHoliday = holidays && holidays.length > 0;
    if (isHoliday) {
        console.log(`Today is a holiday: ${holidays[0].name}. Skipping lessons.`);
    }

    // 4. Fetch Items (Events + Lessons)
    let itemsToCheck: ScheduleItem[] = [];

    // A. Fetch One-time Events (Always check these, even on holidays - e.g. Doctor)
    const { data: events } = await supabase
        .from('events')
        .select('id, start_time, subject, room, notification_sent')
        .eq('date', todayDateString)
        .eq('notification_sent', false);

    if (events) {
        itemsToCheck = itemsToCheck.concat(events.map(e => ({ ...e, type: 'event' })));
    }

    // B. Fetch Lessons (Only if NOT holiday)
    if (!isHoliday) {
        const { data: lessons } = await supabase
            .from('lessons')
            .select('id, start_time, subject, room, notification_sent')
            .eq('day_of_week', currentDayOfWeek)
            .eq('notification_sent', false);
        
        if (lessons) {
            itemsToCheck = itemsToCheck.concat(lessons.map(l => ({ ...l, type: 'lesson' })));
        }
    }

    // 5. Filter items within 15-20 min window
    const itemsToNotify: ScheduleItem[] = [];

    for (const item of itemsToCheck) {
      const [h, m] = item.start_time.split(':').map(Number);
      const itemTotalMinutes = h * 60 + m;
      const diff = itemTotalMinutes - currentTotalMinutes;

      // Check window
      if (diff >= 15 && diff <= 20) {
        itemsToNotify.push(item);
      }
    }

    // 6. Maintenance: Reset lessons for OTHER days
    // If today is Tuesday, reset Monday's lessons to notification_sent=false so they work next week.
    // We do this asynchronously without waiting to speed up response.
    supabase
        .from('lessons')
        .update({ notification_sent: false })
        .neq('day_of_week', currentDayOfWeek)
        .eq('notification_sent', true)
        .then(({ error }) => {
            if (error) console.error('Error resetting old lessons:', error);
            else console.log('Old lessons flags reset successfully.');
        });


    if (itemsToNotify.length === 0) {
      return new Response(JSON.stringify({ message: 'No items to notify' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 7. Send Notifications
    const { data: subscriptions } = await supabase.from('subscriptions').select('*');
    const results = [];
    const appUrl = 'https://oliwia-calendar.vercel.app'; // Your Vercel URL

    for (const item of itemsToNotify) {
      const payload = JSON.stringify({
        title: "Za 15 minut!",
        body: `${item.subject} (${item.room || 'online'})`, // Handle empty room
        icon: `${appUrl}/web-app-manifest-192x192.png`,
        badge: `${appUrl}/web-app-manifest-192x192.png`
      });

      // Send to all subscribers
      const promises = (subscriptions || []).map(async (sub: Subscription) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pushSubscription = sub.subscription_data as any;
          await webpush.sendNotification(
            pushSubscription,
            payload
          );
          return { status: 'fulfilled' };
        } catch (error: unknown) {
          // Narrow the type to access the potential statusCode
          const err = error as { statusCode?: number };
          if (err.statusCode === 410 || err.statusCode === 404) {
             await supabase.from('subscriptions').delete().eq('id', sub.id);
          }
          return { status: 'rejected' };
        }
      });

      await Promise.all(promises);

      // 8. Mark as Sent in DB
      const table = item.type === 'lesson' ? 'lessons' : 'events';
      await supabase
        .from(table)
        .update({ notification_sent: true })
        .eq('id', item.id);

      results.push({ subject: item.subject, sent: true });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});