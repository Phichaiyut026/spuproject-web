import { UserInfo } from "./types";

/** module codes ต้องตรงกับ permission.module ที่ตั้งไว้ใน PermissionsPanel (จัดการระบบ > สิทธิ์การใช้งาน) */
export function canAccessModule(user: UserInfo | null, module: string): boolean {
  if (!user) return false;
  return user.allowedModules.includes(module);
}
