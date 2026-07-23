"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";

const OPERATION_LINKS = [
  { href: "/inspection", label: "ตรวจสอบชิ้นงานแรก", icon: "📋" },
  { href: "/approval", label: "อนุมัติงาน (SupportHouse)", icon: "✅" },
  { href: "/weekly", label: "รายงานประจำสัปดาห์", icon: "📝" },
  { href: "/smart-meter", label: "ข้อมูลไฟฟ้า Smart Meter", icon: "⚡" },
];

const PERSONAL_OFFICE_LINKS = [
  { href: "/approval?status=Pending", label: "To do task", icon: "🕐" },
  { href: "/new-task", label: "New Task", icon: "🆕" },
  { href: "/approval?view=historic", label: "Historic task", icon: "🗄" },
  { href: "/approval?mine=true", label: "My process", icon: "🙋" },
];

function linkClass(active: boolean) {
  return `flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors ${
    active ? "font-semibold" : "text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
  }`;
}

/**
 * "การทำงาน" (list) กับ "Personal Office" (To do/Historic/My process) ชี้ไปที่ /approval
 * เหมือนกันแต่ต่าง query string กัน — ต้องแยก active ให้ตรงเป๊ะแค่ลิงก์เดียว ไม่งั้นจะ active
 * มั่วขึ้นพร้อมกันหลายอันเพราะ path เดียวกัน (ปัญหาที่เจอมาก่อนแก้นี้)
 *
 * กติกา:
 * - ลิงก์ที่มี query (?status=, ?mine=, ?view=) ต้อง exact match ทั้ง path+query เท่านั้น
 * - ลิงก์เปล่าไม่มี query (เช่น /approval ธรรมดา) ต้อง match เฉพาะตอนไม่มี query ใดๆ ค้างอยู่เลย
 *   เพื่อไม่ให้ทับกับลิงก์ query ด้านบน
 * - path ย่อย (เช่น /approval/{id}, /inspection/{id}/edit) ยังนับเป็นส่วนหนึ่งของกลุ่ม list ตามเดิม
 *   ยกเว้น segment "new" ซึ่งเป็นของกลุ่ม New Task
 */
function isLinkActive(pathname: string, search: string, href: string) {
  const [hrefPath, hrefQuery] = href.split("?");

  if (hrefPath === "/new-task" && pathname.split("/").pop() === "new") {
    return true;
  }

  if (hrefQuery !== undefined) {
    return pathname === hrefPath && search === hrefQuery;
  }

  if (pathname === hrefPath) {
    return search === "";
  }
  if (pathname.startsWith(hrefPath + "/")) {
    const restSegments = pathname.slice(hrefPath.length + 1).split("/");
    return !restSegments.includes("new");
  }
  return false;
}

function NavGroup({
  icon,
  label,
  links,
}: {
  icon: ReactNode;
  label: string;
  links: { href: string; label: string; icon: string }[];
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  const groupActive = links.some((l) => isLinkActive(pathname, search, l.href));
  const [expanded, setExpanded] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setExpanded(true);
  }, [groupActive]);

  return (
    <li>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm ${
          groupActive ? "font-semibold" : "text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
        }`}
        style={groupActive ? { background: "var(--active-tint)" } : {}}
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span> {label}
        </span>
        <span
          className="text-xs text-gray-400 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {expanded && (
        <ul className="flex flex-col gap-1 pl-3 mt-1">
          {links.map((l) => {
            const active = isLinkActive(pathname, search, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={linkClass(active) + " text-[0.86rem]"}
                  style={active ? { background: "var(--active-tint)" } : {}}
                >
                  <span>{l.icon}</span> {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed top-14 bottom-0 left-0 w-[250px] overflow-y-auto border-r bg-white z-30 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <ul className="flex flex-col gap-1 p-3">
        <li>
          <Link href="/" className={linkClass(pathname === "/")} style={pathname === "/" ? { background: "var(--active-tint)" } : {}}>
            <span>📊</span> แดชบอร์ด
          </Link>
        </li>

        <NavGroup icon="🗂" label="Personal Office" links={PERSONAL_OFFICE_LINKS} />
        <NavGroup icon="💼" label="การทำงาน" links={OPERATION_LINKS} />
      </ul>
    </nav>
  );
}
