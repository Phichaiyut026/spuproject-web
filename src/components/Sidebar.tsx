"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, PanelLeftClose, Lightbulb } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  DASHBOARD_LINK,
  NAV_GROUPS,
  ADMIN_LINK,
  type NavGroupConfig,
  type NavLink as NavLinkType,
} from "./nav-config";

/**
 * "การทำงาน" (list) กับ "Personal Office" (To do/Historic/My process) ชี้ไปที่ /approval
 * เหมือนกันแต่ต่าง query string กัน — ต้องแยก active ให้ตรงเป๊ะแค่ลิงก์เดียว
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

function RailLink({
  link,
  active,
  collapsed,
  nested,
  onNavigate,
}: {
  link: NavLinkType;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
  onNavigate: () => void;
}) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      title={collapsed ? link.label : undefined}
      className={`group relative flex items-center rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center px-0 py-2.5" : `gap-3 px-3 py-2.5 ${nested ? "pl-4" : ""}`
      } ${
        active
          ? "text-[color:var(--sidebar-text-strong)] font-semibold"
          : "text-[color:var(--sidebar-text)] hover:text-[color:var(--sidebar-text-strong)] hover:bg-white/5"
      }`}
      style={active ? { background: "var(--brand)", color: "var(--brand-contrast)" } : {}}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{link.label}</span>}
    </Link>
  );
}

function NavGroup({
  group,
  collapsed,
  onNavigate,
}: {
  group: NavGroupConfig;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const GroupIcon = group.icon;

  const groupActive = group.links.some((l) => isLinkActive(pathname, search, l.href));
  const [expanded, setExpanded] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setExpanded(true);
  }, [groupActive]);

  // when collapsed, show the group's links as a flat set of icon buttons
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 border-t border-[color:var(--sidebar-line)] pt-2 mt-1">
        {group.links.map((l) => (
          <RailLink
            key={l.href}
            link={l}
            active={isLinkActive(pathname, search, l.href)}
            collapsed
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
          groupActive
            ? "text-[color:var(--sidebar-text-strong)] font-semibold"
            : "text-[color:var(--sidebar-text)] hover:text-[color:var(--sidebar-text-strong)] hover:bg-white/5"
        }`}
      >
        <span className="flex items-center gap-3">
          <GroupIcon size={18} className="shrink-0" />
          {group.label}
        </span>
        <ChevronDown
          size={15}
          className="transition-transform text-[color:var(--sidebar-text)]"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {expanded && (
        <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-[color:var(--sidebar-line)] pl-2">
          {group.links.map((l) => (
            <RailLink
              key={l.href}
              link={l}
              active={isLinkActive(pathname, search, l.href)}
              collapsed={false}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  open,
  collapsed,
  onNavigate,
  onCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onNavigate: () => void;
  onCollapse: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { user } = useAuth();

  const width = collapsed ? "w-[76px]" : "w-[262px]";

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col ${width} transition-all duration-300 text-[color:var(--sidebar-text)] ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "var(--sidebar-bg)" }}
      >
        {/* brand */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[color:var(--sidebar-line)] ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-5"
          }`}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--brand)", color: "var(--brand-contrast)" }}
          >
            <Lightbulb size={20} />
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[color:var(--sidebar-text-strong)]">SPU OA System</div>
              <div className="text-[11px] text-[color:var(--sidebar-text)]">Thai Ming Lighting</div>
            </div>
          )}
        </div>

        {/* nav */}
        <nav className="scroll-slim flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            <RailLink
              link={DASHBOARD_LINK}
              active={isLinkActive(pathname, search, DASHBOARD_LINK.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </div>

          {!collapsed && (
            <div className="mt-5 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sidebar-text)]/70">
              เมนู
            </div>
          )}

          <div className="flex flex-col gap-1">
            {NAV_GROUPS.map((g) => (
              <NavGroup key={g.id} group={g} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>

          {user?.isAdmin && (
            <>
              {!collapsed && (
                <div className="mt-5 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sidebar-text)]/70">
                  ผู้ดูแลระบบ
                </div>
              )}
              <div className={collapsed ? "border-t border-[color:var(--sidebar-line)] pt-2 mt-1" : ""}>
                <RailLink
                  link={ADMIN_LINK}
                  active={isLinkActive(pathname, search, ADMIN_LINK.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </div>
            </>
          )}
        </nav>

        {/* collapse toggle (desktop only) */}
        <div className="hidden md:block border-t border-[color:var(--sidebar-line)] p-3">
          <button
            onClick={onCollapse}
            className={`flex w-full items-center rounded-lg py-2.5 text-sm text-[color:var(--sidebar-text)] transition-colors hover:bg-white/5 hover:text-[color:var(--sidebar-text-strong)] ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
            title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            <PanelLeftClose
              size={18}
              className="transition-transform"
              style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
            />
            {!collapsed && "ย่อเมนู"}
          </button>
        </div>
      </aside>
    </>
  );
}
