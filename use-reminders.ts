import { useEffect } from "react";
import { checkReminders } from "../lib/reminders";
import { getState } from "../lib/store";

export function useReminders() {
  useEffect(() => {
    const id = window.setInterval(() => checkReminders(getState()), 30_000);
    checkReminders(getState());
    return () => window.clearInterval(id);
  }, []);
}
