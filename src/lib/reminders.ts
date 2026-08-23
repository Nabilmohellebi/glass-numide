// Rappels : eau, pesée, séance. Fonctionne tant que l'app est ouverte (onglet actif ou en
// arrière-plan) via l'API Notification. Pas de service worker : c'est volontairement simple,
// aucun serveur push, tout reste local.

import type { AppState } from "./store";
import { todayISO } from "./store";
import { REST_KEYS, SPLITS, DAYS_FR } from "./program";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

function fire(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: title });
  } catch {
    /* environnement sans notification (ex. iOS Safari hors PWA installée) */
  }
}

const firedToday = new Set<string>();
let lastCheckedDay = todayISO();

/** À appeler régulièrement (ex. toutes les 30 s) pendant que l'app est ouverte. */
export function checkReminders(s: AppState) {
  if (!s.reminders.enabled || !notificationsSupported() || Notification.permission !== "granted") return;
  const iso = todayISO();
  if (iso !== lastCheckedDay) {
    firedToday.clear();
    lastCheckedDay = iso;
  }
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (s.reminders.weighIn && hhmm === s.reminders.weighInTime && !s.weights[iso]) {
    const key = `weigh-${iso}`;
    if (!firedToday.has(key)) {
      firedToday.add(key);
      fire("Pesée du matin", "À jeun, après les toilettes. Trente secondes, pas plus.");
    }
  }

  if (s.reminders.water) {
    for (const t of s.reminders.waterTimes) {
      if (hhmm === t) {
        const key = `water-${iso}-${t}`;
        if (!firedToday.has(key)) {
          firedToday.add(key);
          fire("Un verre d'eau", "3,5 L par jour — c'est le moment d'en boire un peu.");
        }
      }
    }
  }

  if (s.reminders.workout && hhmm === s.reminders.workoutTime) {
    const dayName = DAYS_FR[now.getDay()]!;
    const split = SPLITS[s.split];
    const dayKey = split.week[dayName]!;
    const isRest = REST_KEYS.includes(dayKey);
    const done = s.sessions[iso]?.done;
    if (!isRest && !done) {
      const key = `workout-${iso}`;
      if (!firedToday.has(key)) {
        firedToday.add(key);
        fire("Séance du jour", `${split.days[dayKey]!.name} — ${split.days[dayKey]!.focus}.`);
      }
    }
  }
}
