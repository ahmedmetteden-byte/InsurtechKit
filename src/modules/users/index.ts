/**
 * Users module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type { Permission } from './types/Permission'
export { PERMISSIONS, isPermission } from './types/Permission'

export type {
  User,
  Role,
  UserStatus,
  CreateUserInput,
  UpdateUserInput,
} from './types/User'

export { userDisplayName } from './types/User'
export { defaultRoles, getRoleById } from './config/defaultRoles'
export { defaultUsers } from './config/defaultUsers'
export { UserService } from './services/UserService'
export { default as UserForm } from './components/UserForm'
export { default as UserManagement } from './pages/UserManagement'
