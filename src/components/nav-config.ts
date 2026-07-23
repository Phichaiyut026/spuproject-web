import {
  LayoutDashboard,
  ClipboardCheck,
  BadgeCheck,
  FileText,
  Zap,
  Clock,
  FilePlus2,
  Archive,
  UserCircle2,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** keywords used by the command/search palette */
  keywords?: string;
}

export interface NavGroupConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  links: NavLink[];
}

export const DASHBOARD_LINK: NavLink = {
  href: "/",
  label: "แดชบอร์ด",
  icon: LayoutDashboard,
  keywords: "dashboard home overview ภาพรวม",
};

export const PERSONAL_OFFICE_GROUP: NavGroupConfig = {
  id: "personal",
  label: "Personal Office",
  icon: UserCircle2,
  links: [
    { href: "/approval?status=Pending", label: "งานที่ต้องทำ", icon: Clock, keywords: "todo task pending" },
    { href: "/new-task", label: "สร้างงานใหม่", icon: FilePlus2, keywords: "new task create" },
    { href: "/approval?view=historic", label: "ประวัติงาน", icon: Archive, keywords: "historic history" },
    { href: "/approval?mine=true", label: "งานของฉัน", icon: UserCircle2, keywords: "my process mine" },
  ],
};

export const OPERATIONS_GROUP: NavGroupConfig = {
  id: "operations",
  label: "การทำงาน",
  icon: ClipboardCheck,
  links: [
    { href: "/inspection", label: "ตรวจสอบชิ้นงานแรก", icon: ClipboardCheck, keywords: "inspection first article" },
    { href: "/approval", label: "อนุมัติงาน (SupportHouse)", icon: BadgeCheck, keywords: "approval approve" },
    { href: "/weekly", label: "รายงานประจำสัปดาห์", icon: FileText, keywords: "weekly report" },
    { href: "/smart-meter", label: "ข้อมูลไฟฟ้า Smart Meter", icon: Zap, keywords: "smart meter electricity power" },
  ],
};

export const ADMIN_LINK: NavLink = {
  href: "/admin/users",
  label: "จัดการผู้ใช้งาน",
  icon: Users,
  keywords: "admin users manage",
};

export const NAV_GROUPS: NavGroupConfig[] = [PERSONAL_OFFICE_GROUP, OPERATIONS_GROUP];

/** flat list of every navigable link, used by the search palette */
export const ALL_LINKS: NavLink[] = [
  DASHBOARD_LINK,
  ...PERSONAL_OFFICE_GROUP.links,
  ...OPERATIONS_GROUP.links,
  ADMIN_LINK,
];
