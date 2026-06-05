"use client";

import { useEffect, useRef } from "react";

export function AdminReminderBootstrap() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    fetch("/api/admin/reminders/process", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {
      /* silencieux — le cron Vercel prend le relais en production */
    });
  }, []);

  return null;
}
