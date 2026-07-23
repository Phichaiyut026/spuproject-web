"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import WeeklyForm from "@/components/weekly/WeeklyForm";
import { api } from "@/lib/api";

interface Defaults {
  reportWeek: number;
  reportYear: number;
  dateFrom: string;
  dateTo: string;
}

export default function NewWeeklyPage() {
  const [defaults, setDefaults] = useState<Defaults | null>(null);

  useEffect(() => {
    api.get<Defaults>("/api/weekly/new-defaults").then(setDefaults);
  }, []);

  return <AppShell>{defaults && <WeeklyForm defaults={defaults} editable />}</AppShell>;
}
