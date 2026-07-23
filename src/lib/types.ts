export interface UserInfo {
  userId: string;
  username: string;
  realName: string;
  email: string | null;
  roleCode: string;
  status: string;
  deptCode: string | null;
  deptName: string | null;
  isAdmin: boolean;
  isApprover: boolean;
  canManageMeters: boolean;
  /** backend ต้องส่งมาเสมอ (อย่างน้อย []) ห้ามเป็น undefined — คือ module ที่ role นี้เข้าถึงได้ */
  allowedModules: string[];
}

export interface UserOption {
  userId: string;
  realName: string;
}

export interface InspectionOrder {
  orderId: string;
  orderNo: string;
  productCode: string;
  productName: string | null;
  inspectionDate: string;
  inspectorName: string | null;
  status: "Pending" | "Passed" | "Failed";
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  createdByName: string | null;
}

export interface ApprovalRequestItem {
  requestId: string;
  requesterId: string;
  requestType: string;
  requestDetail: string;
  department: string | null;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string | null;
  requesterName: string | null;
  currentLevel: number | null;
}

export interface ApprovalLogItem {
  logId: string;
  requestId: string;
  approverId: string;
  approvalLevel: number;
  action: "Approve" | "Reject";
  comment: string | null;
  actionDate: string;
  approverName: string | null;
}

export interface ApprovalDetail {
  request: ApprovalRequestItem;
  logs: ApprovalLogItem[];
  isApprover: boolean;
  requiredLevels: number;
}

export type ReportItemCategory = "WorkSummary" | "CompetencyTraining";

export interface WeeklyReportLineItem {
  itemId?: string;
  reportId?: string;
  category: ReportItemCategory;
  content: string;
  weight: string;
  completion: string;
  supervisorRating: string;
  supervisorAdvice: string;
  sortOrder?: number;
}

export interface WeeklyReportItem {
  reportId: string;
  userId: string;
  reportWeek: number;
  reportYear: number;
  content: string;
  status: "Draft" | "Submitted";
  personnelCategory: "Probationary" | "JobChange" | null;
  dateFrom: string | null;
  dateTo: string | null;
  supervisorId: string | null;
  createdAt: string;
  updatedAt: string | null;
  userName: string | null;
  userDeptCode: string | null;
  supervisorName: string | null;
  items: WeeklyReportLineItem[] | null;
}

export interface MtrMeter {
  meterCode: string;
  meterName: string;
  location: string | null;
  installDate: string | null;
  status: "Active" | "Inactive";
  createdAt: string | null;
}

export interface MtrReadingData {
  readingId: string;
  meterCode: string;
  readingDate: string;
  timeSlot: string;
  kwhValue: number;
  recordedBy: string;
  createdAt: string | null;
  meterName: string | null;
}

export interface ChartData {
  dates: string[];
  series: { name: string; data: number[] }[];
  slotLabels: string[];
  slotValues: number[];
}

export interface DashboardStats {
  pendingInspectionCount: number;
  pendingApprovalCount: number;
  weeklyReportCount: number;
  meterCount: number;
}

export interface SysDepartment {
  deptCode: string;
  deptName: string;
  description: string | null;
  createdAt: string;
}

export interface SysArea {
  areaCode: string;
  areaName: string;
  description: string | null;
  createdAt: string;
}

export interface SysSetting {
  settingKey: string;
  settingValue: string | null;
  description: string | null;
  updatedAt: string | null;
}

export interface ActivityLogEntry {
  type: "Export" | "Approval" | "MeterView";
  userName: string | null;
  detail: string;
  occurredAt: string;
}

export interface SysRole {
  roleCode: string;
  roleName: string;
  description: string | null;
  createdAt: string;
}

export interface SysPermission {
  permissionCode: string;
  permissionName: string;
  module: string | null;
}

export interface RolePermissionPair {
  roleCode: string;
  permissionCode: string;
}
