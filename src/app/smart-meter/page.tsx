"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import { PageHeader, LinkButton, Input, Select, Card, CardHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { ChartData, MtrMeter } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SmartMeterDashboardPage() {
  const [meters, setMeters] = useState<MtrMeter[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [meterCode, setMeterCode] = useState("");
  const [chart, setChart] = useState<ChartData | null>(null);

  useEffect(() => {
    api.get<MtrMeter[]>("/api/smart-meter/meters").then(setMeters);
    api.get<string[]>("/api/smart-meter/time-slots").then(setTimeSlots);
  }, []);

  const loadChart = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (timeSlot) params.set("timeSlot", timeSlot);
    if (meterCode) params.set("meterCode", meterCode);
    api.get<ChartData>(`/api/smart-meter/data?${params.toString()}`).then(setChart);
  }, [dateFrom, dateTo, timeSlot, meterCode]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const lineOption = chart
    ? {
        tooltip: { trigger: "axis" },
        legend: { type: "scroll" },
        xAxis: { type: "category", data: chart.dates },
        yAxis: { type: "value", name: "kWh" },
        series: chart.series.map((s) => ({ name: s.name, type: "line", smooth: true, data: s.data })),
      }
    : {};

  const barOption = chart
    ? {
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: chart.slotLabels },
        yAxis: { type: "value", name: "kWh" },
        series: [{ type: "bar", data: chart.slotValues, barWidth: "40%" }],
      }
    : {};

  return (
    <AppShell>
      <PageHeader
        title="แดชบอร์ดข้อมูลไฟฟ้าจากมิเตอร์อัจฉริยะ"
        action={
          <div className="flex gap-2">
            <LinkButton href="/smart-meter/readings/new" variant="outline">
              ⚡ บันทึกค่าไฟ
            </LinkButton>
            <LinkButton href="/smart-meter/meters" variant="outline">
              ⚙ จัดการมิเตอร์
            </LinkButton>
          </div>
        }
      />

      <form
        className="flex flex-wrap gap-3 mb-6 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          loadChart();
        }}
      >
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">ตั้งแต่วันที่</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">ถึงวันที่</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">ช่วงเวลา</label>
          <Select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="min-w-[140px]">
            <option value="">ทุกช่วงเวลา</option>
            {timeSlots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">มิเตอร์</label>
          <Select value={meterCode} onChange={(e) => setMeterCode(e.target.value)} className="min-w-[160px]">
            <option value="">ทุกมิเตอร์</option>
            {meters.map((m) => (
              <option key={m.meterCode} value={m.meterCode}>
                {m.meterName}
              </option>
            ))}
          </Select>
        </div>
        <button type="submit" className="rounded-md bg-[var(--ink)] text-white px-4 py-2 text-sm font-medium">
          แสดงกราฟ
        </button>
      </form>

      <Card className="mb-6">
        <CardHeader>แนวโน้มการใช้ไฟฟ้ารายวัน (kWh)</CardHeader>
        <div className="p-4">
          <ReactECharts option={lineOption} style={{ height: 380 }} notMerge />
        </div>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>ยอดรวมตามช่วงเวลา (kWh)</CardHeader>
        <div className="p-4">
          <ReactECharts option={barOption} style={{ height: 300 }} notMerge />
        </div>
      </Card>
    </AppShell>
  );
}
