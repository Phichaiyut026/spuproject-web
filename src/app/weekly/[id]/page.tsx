"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import WeeklyForm from "@/components/weekly/WeeklyForm";
import { api } from "@/lib/api";
import { WeeklyReportItem } from "@/lib/types";

export default function ViewWeeklyPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<{ report: WeeklyReportItem; editable: boolean } | null>(null);

  useEffect(() => {
    api.get<{ report: WeeklyReportItem; editable: boolean }>(`/api/weekly/${params.id}`).then(setData);
  }, [params.id]);

  return <AppShell>{data && <WeeklyForm initial={data.report} editable={data.editable} />}</AppShell>;
}
