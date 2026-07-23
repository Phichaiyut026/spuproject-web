"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import MeterForm from "@/components/meter/MeterForm";
import { api } from "@/lib/api";
import { MtrMeter } from "@/lib/types";

export default function EditMeterPage() {
  const params = useParams<{ code: string }>();
  const [meter, setMeter] = useState<MtrMeter | null>(null);

  useEffect(() => {
    api.get<MtrMeter>(`/api/smart-meter/meters/${params.code}`).then(setMeter);
  }, [params.code]);

  return <AppShell>{meter && <MeterForm initial={meter} />}</AppShell>;
}
