export const REMINDER_THRESHOLDS_DAYS = [14, 7, 3, 1, 0] as const;

export type ReminderThresholdDays =
  (typeof REMINDER_THRESHOLDS_DAYS)[number];

export const REMINDER_LABELS: Record<ReminderThresholdDays, string> = {
  14: "dans 2 semaines",
  7: "dans 7 jours",
  3: "dans 3 jours",
  1: "demain",
  0: "aujourd'hui",
};

export function reminderKey(days: ReminderThresholdDays): string {
  return `${days}d`;
}
