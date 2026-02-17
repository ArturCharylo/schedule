import type { ScheduleItem } from '../types';

export type LayoutEvent = ScheduleItem & {
  top: number;
  height: number;
  left: number;
  width: number;
};

const START_HOUR = 7;

export function calculateLayout(items: ScheduleItem[]): LayoutEvent[] {
  // 1. Sort by start time, then end time (longer first)
  const sortedItems = [...items].sort((a, b) => {
    if (a.start_time !== b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return b.end_time.localeCompare(a.end_time);
  });

  const events: LayoutEvent[] = [];

  // Helper to get minutes from HH:mm
  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // 2. Calculate top and height (1 minute = 1px height unit, scaling handled in CSS)
  sortedItems.forEach((item) => {
    const startMinutes = getMinutes(item.start_time);
    const endMinutes = getMinutes(item.end_time);
    const startOfDay = START_HOUR * 60;

    const top = Math.max(0, startMinutes - startOfDay);
    const height = Math.max(30, endMinutes - startMinutes); // minimum 30 mins

    events.push({
      ...item,
      top,
      height,
      left: 0,
      width: 100,
    });
  });

  // 3. Handle overlaps: Cluster approach
  const clusters: LayoutEvent[][] = [];
  let currentCluster: LayoutEvent[] = [];
  let clusterEnd = -1;

  events.forEach((event) => {
      if (currentCluster.length === 0) {
          currentCluster.push(event);
          clusterEnd = event.top + event.height;
      } else {
          // If this event starts before the current cluster ends, it's part of the cluster
          if (event.top < clusterEnd) {
              currentCluster.push(event);
              clusterEnd = Math.max(clusterEnd, event.top + event.height);
          } else {
              clusters.push(currentCluster);
              currentCluster = [event];
              clusterEnd = event.top + event.height;
          }
      }
  });
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // Layout each cluster
  clusters.forEach(cluster => {
      const columns: LayoutEvent[][] = [];
       cluster.forEach((event) => {
          let placed = false;
          for (let i = 0; i < columns.length; i++) {
              const col = columns[i];
              const last = col[col.length - 1];
              // Check if fits in this column (starts after the last one ends)
              if (last.top + last.height <= event.top) {
                  col.push(event);
                  placed = true;
                  break;
              }
          }
          if (!placed) {
              columns.push([event]);
          }
      });

      const width = 100 / columns.length;
      columns.forEach((col, colIndex) => {
          col.forEach(event => {
              event.left = colIndex * width;
              event.width = width;
          });
      });
  });

  return events;
}
