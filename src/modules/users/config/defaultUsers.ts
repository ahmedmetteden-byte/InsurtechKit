import { defaultRoles } from './defaultRoles'
import type { User } from '../types/User'

function role(id: string) {
  const r = defaultRoles.find(x => x.id === id)
  if (!r) throw new Error(`Seed role missing: ${id}`)
  return r
}

/** Relative timestamps so "Online Today" and demos stay meaningful. */
function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/**
 * Seed users for the Users module (in-memory only).
 * Every row references a valid role from defaultRoles.
 */
export const defaultUsers: User[] = [
  {
    id: 'usr-001', employeeId: 'EMP-1001', firstName: 'Kunle', lastName: 'Adesanya',
    email: 'kunle.adesanya@insureng.com.ng', phone: '+234 803 100 1001',
    department: 'Claims', roleId: role('role-claims').id, roleName: role('role-claims').name,
    branch: 'Lagos Island', status: 'active', lastLogin: daysAgo(0, 13, 40),
    createdAt: '2024-01-10T09:00:00.000Z', updatedAt: daysAgo(0, 13, 40),
  },
  {
    id: 'usr-002', employeeId: 'EMP-1002', firstName: 'Amaka', lastName: 'Okeke',
    email: 'amaka.okeke@insureng.com.ng', phone: '+234 802 200 2002',
    department: 'Customer Service', roleId: role('role-cs').id, roleName: role('role-cs').name,
    branch: 'Abuja Central', status: 'active', lastLogin: daysAgo(0, 9, 15),
    createdAt: '2024-01-12T10:00:00.000Z', updatedAt: daysAgo(0, 9, 15),
  },
  {
    id: 'usr-003', employeeId: 'EMP-1003', firstName: 'Chidi', lastName: 'Nwosu',
    email: 'chidi.nwosu@insureng.com.ng', phone: '+234 805 300 3003',
    department: 'Underwriting', roleId: role('role-underwriter').id, roleName: role('role-underwriter').name,
    branch: 'Port Harcourt', status: 'active', lastLogin: daysAgo(1, 16, 20),
    createdAt: '2024-02-01T08:00:00.000Z', updatedAt: daysAgo(1, 16, 20),
  },
  {
    id: 'usr-004', employeeId: 'EMP-1004', firstName: 'Hauwa', lastName: 'Ibrahim',
    email: 'hauwa.ibrahim@insureng.com.ng', phone: '+234 806 400 4004',
    department: 'Operations', roleId: role('role-ops').id, roleName: role('role-ops').name,
    branch: 'Kano', status: 'active', lastLogin: daysAgo(0, 11, 5),
    createdAt: '2024-02-15T09:30:00.000Z', updatedAt: daysAgo(0, 11, 5),
  },
  {
    id: 'usr-005', employeeId: 'EMP-1005', firstName: 'Tolu', lastName: 'Adeyemi',
    email: 'tolu.adeyemi@insureng.com.ng', phone: '+234 807 500 5005',
    department: 'Finance', roleId: role('role-finance').id, roleName: role('role-finance').name,
    branch: 'Lagos Island', status: 'active', lastLogin: daysAgo(2, 8, 45),
    createdAt: '2024-03-01T10:00:00.000Z', updatedAt: daysAgo(2, 8, 45),
  },
  {
    id: 'usr-006', employeeId: 'EMP-1006', firstName: 'Ngozi', lastName: 'Adebayo',
    email: 'ngozi.adebayo@insureng.com.ng', phone: '+234 808 600 6006',
    department: 'Claims', roleId: role('role-claims').id, roleName: role('role-claims').name,
    branch: 'Ibadan', status: 'active', lastLogin: daysAgo(0, 7, 50),
    createdAt: '2024-03-20T11:00:00.000Z', updatedAt: daysAgo(0, 7, 50),
  },
  {
    id: 'usr-007', employeeId: 'EMP-1007', firstName: 'Emeka', lastName: 'Okonkwo',
    email: 'emeka.okonkwo@insureng.com.ng', phone: '+234 809 700 7007',
    department: 'Branch Management', roleId: role('role-branch').id, roleName: role('role-branch').name,
    branch: 'Enugu', status: 'active', lastLogin: daysAgo(3, 14, 10),
    createdAt: '2024-04-05T09:00:00.000Z', updatedAt: daysAgo(3, 14, 10),
  },
  {
    id: 'usr-008', employeeId: 'EMP-1008', firstName: 'Fatima', lastName: 'Bello',
    email: 'fatima.bello@insureng.com.ng', phone: '+234 810 800 8008',
    department: 'Sales', roleId: role('role-broker').id, roleName: role('role-broker').name,
    branch: 'Abuja Central', status: 'active', lastLogin: daysAgo(4, 12, 0),
    createdAt: '2024-04-18T10:30:00.000Z', updatedAt: daysAgo(4, 12, 0),
  },
  {
    id: 'usr-009', employeeId: 'EMP-1009', firstName: 'Ibrahim', lastName: 'Sule',
    email: 'ibrahim.sule@insureng.com.ng', phone: '+234 811 900 9009',
    department: 'Sales', roleId: role('role-agent').id, roleName: role('role-agent').name,
    branch: 'Kaduna', status: 'inactive', lastLogin: daysAgo(60, 9, 0),
    createdAt: '2024-05-01T08:00:00.000Z', updatedAt: daysAgo(60, 9, 0),
  },
  {
    id: 'usr-010', employeeId: 'EMP-1010', firstName: 'Ada', lastName: 'Okafor',
    email: 'ada.okafor@insureng.com.ng', phone: '+234 812 010 1010',
    department: 'IT', roleId: role('role-admin').id, roleName: role('role-admin').name,
    branch: 'Lagos Island', status: 'active', lastLogin: daysAgo(0, 14, 0),
    createdAt: '2024-01-05T08:00:00.000Z', updatedAt: daysAgo(0, 14, 0),
  },
  {
    id: 'usr-011', employeeId: 'EMP-1011', firstName: 'Yusuf', lastName: 'Garba',
    email: 'yusuf.garba@insureng.com.ng', phone: '+234 813 110 1111',
    department: 'Finance', roleId: role('role-viewer').id, roleName: role('role-viewer').name,
    branch: 'Kano', status: 'suspended', lastLogin: daysAgo(90, 10, 0),
    createdAt: '2024-06-12T11:00:00.000Z', updatedAt: daysAgo(80, 9, 0),
  },
  {
    id: 'usr-012', employeeId: 'EMP-1012', firstName: 'Blessing', lastName: 'Eze',
    email: 'blessing.eze@insureng.com.ng', phone: '+234 814 120 1212',
    department: 'Underwriting', roleId: role('role-underwriter').id, roleName: role('role-underwriter').name,
    branch: 'Warri', status: 'active', lastLogin: daysAgo(0, 10, 30),
    createdAt: '2024-07-01T08:30:00.000Z', updatedAt: daysAgo(0, 10, 30),
  },
]
