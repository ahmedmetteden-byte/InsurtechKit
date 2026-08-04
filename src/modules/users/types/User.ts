/**
 * Role and User domain models — identity foundation for future FastAPI auth.
 */
import type { Permission } from './Permission'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  roleId: string
  roleName: string
  branch: string
  status: UserStatus
  lastLogin: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating a user (id and timestamps assigned by the service). */
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdateUserInput = Partial<CreateUserInput> & { id: string }

export function userDisplayName(u: Pick<User, 'firstName' | 'lastName'>): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'Unnamed user'
}
