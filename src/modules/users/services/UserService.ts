import { defaultUsers } from '../config/defaultUsers'
import { defaultRoles, getRoleById } from '../config/defaultRoles'
import type { CreateUserInput, Role, UpdateUserInput, User } from '../types/User'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'

/**
 * In-memory User service.
 * Roles are read from seed config (no role editor in this phase).
 * Swap later for FastAPI identity without changing callers.
 */
class UserServiceImpl {
  private users: User[] = defaultUsers.map(u => ({ ...u }))

  getAll(): User[] {
    return this.users.map(u => ({ ...u }))
  }

  getById(id: string): User | undefined {
    const found = this.users.find(u => u.id === id)
    return found ? { ...found } : undefined
  }

  getRoles(): Role[] {
    return defaultRoles.map(r => ({ ...r, permissions: [...r.permissions] }))
  }

  getRoleById(id: string): Role | undefined {
    return getRoleById(id)
  }

  create(input: CreateUserInput): User {
    const now = new Date().toISOString()
    const role = getRoleById(input.roleId)
    const user: User = {
      ...input,
      roleName: role?.name ?? input.roleName,
      id: `usr-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.users = [...this.users, user]
    emitMemoryDataChange()
    return { ...user }
  }

  update(input: UpdateUserInput): User | undefined {
    const index = this.users.findIndex(u => u.id === input.id)
    if (index === -1) return undefined

    const current = this.users[index]
    const roleId = input.roleId ?? current.roleId
    const role = getRoleById(roleId)
    const updated: User = {
      ...current,
      ...input,
      id: current.id,
      roleId,
      roleName: role?.name ?? input.roleName ?? current.roleName,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.users = [
      ...this.users.slice(0, index),
      updated,
      ...this.users.slice(index + 1),
    ]
    emitMemoryDataChange()
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.users.length
    this.users = this.users.filter(u => u.id !== id)
    const changed = this.users.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /** Restore seed users (useful for demos / tests). */
  reset(): void {
    this.users = defaultUsers.map(u => ({ ...u }))
    emitMemoryDataChange()
  }
}

export const UserService = new UserServiceImpl()
