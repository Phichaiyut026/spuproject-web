"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import InspectionForm from "@/components/inspection/InspectionForm";
import { api } from "@/lib/api";
import { InspectionOrder } from "@/lib/types";

export default function EditInspectionPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<InspectionOrder | null>(null);

  useEffect(() => {
    api.get<InspectionOrder>(`/api/inspection/${params.id}`).then(setOrder);
  }, [params.id]);

  return <AppShell>{order && <InspectionForm initial={order} />}</AppShell>;
}
