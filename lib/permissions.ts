import { Role } from '@/db/schema'

// Role hierarchy levels (higher number = more permissions)
const roleHierarchy: Record<Role, number> = {
  super_admin: 6,
  hr_super: 5,
  hr_central: 4,
  hr_regional: 3,
  hr_line: 2,
  employee: 1
}

// Check if user can assign a specific role
export function canAssignRole(userRole: Role, targetRole: Role): boolean {
  const assignments: Record<Role, Role[]> = {
    super_admin: ['hr_super'],
    hr_super: ['hr_central'],
    hr_central: ['hr_regional'],
    hr_regional: ['hr_line'],
    hr_line: [],
    employee: []
  }

  return assignments[userRole]?.includes(targetRole) || false
}

// Check if user can create courses
export function canCreateCourses(userRole: Role): boolean {
  return userRole === 'hr_super'
}

// Check if user can manage employees
export function canManageEmployees(userRole: Role): boolean {
  return ['super_admin', 'hr_super', 'hr_central', 'hr_regional', 'hr_line'].includes(userRole)
}

// Check if user can import from Excel
export function canImportExcel(userRole: Role): boolean {
  return ['super_admin', 'hr_super', 'hr_central', 'hr_regional', 'hr_line'].includes(userRole)
}

// Check if user can edit another user
export function canEditUser(userRole: Role, targetUserRole: Role): boolean {
  // Super admin can edit anyone except other super admins
  if (userRole === 'super_admin') {
    return targetUserRole !== 'super_admin'
  }

  // Other admins can only edit users below them in hierarchy
  return roleHierarchy[userRole] > roleHierarchy[targetUserRole]
}

// Check if user can access admin panel
export function canAccessAdminPanel(userRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy.hr_line
}

// Get roles that user can create
export function getRolesUserCanAssign(userRole: Role): Role[] {
  const assignments: Record<Role, Role[]> = {
    super_admin: ['hr_super', 'hr_central', 'hr_regional', 'hr_line', 'employee'],
    hr_super: ['hr_central', 'hr_regional', 'hr_line', 'employee'],
    hr_central: ['hr_regional', 'hr_line', 'employee'],
    hr_regional: ['hr_line', 'employee'],
    hr_line: ['employee'],
    employee: []
  }

  return assignments[userRole] || []
}

// Check if role is admin
export function isAdmin(role: Role): boolean {
  return role !== 'employee'
}

// Check if role is HR Super
export function isHRSuper(role: Role): boolean {
  return role === 'hr_super'
}

// Check if role is Super Admin
export function isSuperAdmin(role: Role): boolean {
  return role === 'super_admin'
}

// Get role display name in Russian
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    super_admin: 'Супер Админ',
    hr_super: 'HR Супер Админ',
    hr_central: 'HR Центральный Админ',
    hr_regional: 'HR Региональный Админ',
    hr_line: 'HR Линейный Админ',
    employee: 'Сотрудник'
  }

  return names[role]
}
