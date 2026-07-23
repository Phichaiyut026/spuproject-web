"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="animate-fade-in fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full text-[var(--brand-contrast)] shadow-lg transition-transform hover:scale-105 active:scale-95"
      style={{ background: "var(--brand)" }}
      aria-label="เลื่อนขึ้นบนสุด"
      title="เลื่อนขึ้นบนสุด"
    >
      <ArrowUp size={20} />
    </button>
  );
}
