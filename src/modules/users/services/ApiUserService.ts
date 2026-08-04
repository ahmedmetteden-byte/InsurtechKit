/**
 * ApiUserService — mirrors UserService including roles; cache-backed.
 */
import type { CreateUserInput, Role, UpdateUserInput, User } from '../types/User'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiUserServiceImpl {
  private users: User[] = []
  private roles: Role[] = []

  async load(): Promise<void> {
    const [users, roles] = await Promise.all([
      api.get<User[]>('/users'),
      api.get<Role[]>('/roles'),
    ])
    this.users = users
    this.roles = roles
    emitMemoryDataChange()
  }

  getAll(): User[] {
    return this.users.map(u => ({ ...u }))
  }

  getById(id: string): User | undefined {
    const found = this.users.find(u => u.id === id)
    return found ? { ...found } : undefined
  }

  getRoles(): Role[] {
    return this.roles.map(r => ({ ...r, permissions: [...r.permissions] }))
  }

  getRoleById(id: string): Role | undefined {
    const found = this.roles.find(r => r.id === id)
    return found ? { ...found, permissions: [...found.permissions] } : undefined
  }

  async create(input: CreateUserInput): Promise<User> {
    const created = await api.post<User>('/users', input)
    this.users = [...this.users, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdateUserInput): Promise<User | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<User>(`/users/${id}`, patch)
    this.users = this.users.map(u => (u.id === id ? updated : u))
    emitMemoryDataChange()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/users/${id}`)
    const before = this.users.length
    this.users = this.users.filter(u => u.id !== id)
    const changed = this.users.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiUserService = new ApiUserServiceImpl()
