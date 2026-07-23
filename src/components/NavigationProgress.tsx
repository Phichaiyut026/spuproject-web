"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ProgressContextValue = {
  /** เริ่มแสดงแถบโหลด (เรียกเองตอน router.push) */
  start: () => void;
  /** ปิดแถบโหลดทันที */
  done: () => void;
  /** สถานะกำลังเปลี่ยนหน้า */
  navigating: boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function useNavigationProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    // ไม่ throw เพื่อให้เรียกใช้นอก provider ได้อย่างปลอดภัย
    return { start: () => {}, done: () => {}, navigating: false };
  }
  return ctx;
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    timerRef.current = null;
    hideRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setNavigating(true);
    setWidth(12);
    // ค่อยๆ ไต่ขึ้นแต่ไม่ถึง 100 จนกว่าจะโหลดหน้าเสร็จ
    timerRef.current = setInterval(() => {
      setWidth((w) => {
        if (w >= 90) return w;
        const step = w < 40 ? 9 : w < 70 ? 4 : 1.5;
        return Math.min(90, w + step);
      });
    }, 220);
  }, [clearTimers]);

  const done = useCallback(() => {
    clearTimers();
    setNavigating(false);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 320);
  }, [clearTimers]);

  // ปิดแถบเมื่อ path หรือ query เปลี่ยน (แปลว่าหน้าใหม่พร้อมแล้ว)
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // ดักคลิกลิงก์ภายในทั้งหมด เพื่อเริ่มแถบโหลดทันทีที่กด
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const current = window.location.pathname + window.location.search;
      if (href === current) return;

      start();
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <ProgressContext.Provider value={{ start, done, navigating }}>
      {/* แถบโหลดด้านบนสุด */}
      {visible && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
          <div
            className="h-full rounded-r-full shadow-[0_0_10px_rgba(0,0,0,0.15)] transition-[width] duration-200 ease-out"
            style={{
              width: `${width}%`,
              background: "var(--brand)",
            }}
          />
        </div>
      )}
      {/* ตัวหมุนมุมขวาบน + กันกดซ้ำระหว่างเปลี่ยนหน้า */}
      {navigating && (
        <div
          className="fixed right-4 top-[18px] z-[60] flex items-center gap-2 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] shadow-md backdrop-blur"
          style={{ borderColor: "var(--line)" }}
          role="status"
          aria-live="polite"
        >
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent"
            aria-hidden
          />
          กำลังโหลด...
        </div>
      )}
      {children}
    </ProgressContext.Provider>
  );
}
