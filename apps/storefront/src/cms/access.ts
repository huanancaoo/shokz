import type { Access, PayloadRequest } from "payload"
import { defaultAdminPanelUserAccess } from "payload"

export const isStaff = defaultAdminPanelUserAccess
export const hasAdminRole = (user?: { collection?: string } | null) =>
  user?.collection === "users" && "role" in user && user.role === "admin"
export const isAdmin = ({ req }: { req: PayloadRequest }) =>
  hasAdminRole(req.user)
export const isCatalogSync = ({ req }: { req: PayloadRequest }) =>
  req.user?.collection === "commerce-sync"

export const staffAccess = {
  create: isStaff,
  read: isStaff,
  update: isStaff,
  delete: isStaff,
  readVersions: isStaff,
}

export const adminAccess = {
  create: isAdmin,
  read: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}

export const readOwnAccount: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  if (!req.user || !isStaff({ req })) return false
  return { id: { equals: req.user.id } }
}
