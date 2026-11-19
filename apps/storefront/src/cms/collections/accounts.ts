import type { CollectionConfig } from "payload"
import {
  adminAccess,
  hasAdminRole,
  isAdmin,
  isStaff,
  readOwnAccount,
} from "../access"

export const Users: CollectionConfig = {
  slug: "users",
  admin: { group: "管理", useAsTitle: "email" },
  auth: true,
  access: {
    ...adminAccess,
    admin: isStaff,
    read: readOwnAccount,
    update: readOwnAccount,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        // Payload 首次注册时没有会话，之后的账号由管理员分配角色。
        if (operation === "create" && !req.user && data) data.role = "admin"
        return data
      },
    ],
  },
  fields: [
    {
      type: "row",
      // 角色由注册钩子初始化，布局级条件保留了角色字段的必填约束。
      admin: {
        condition: (_data, _siblingData, { operation, user }) =>
          operation !== "create" || Boolean(user),
      },
      fields: [
        {
          name: "role",
          type: "select",
          required: true,
          defaultValue: "editor",
          options: [
            { label: "管理员", value: "admin" },
            { label: "编辑", value: "editor" },
          ],
          access: { create: isAdmin, update: isAdmin },
        },
      ],
    },
  ],
}

export const CommerceSync: CollectionConfig = {
  slug: "commerce-sync",
  admin: {
    group: "管理",
    useAsTitle: "name",
    hidden: ({ user }) => !hasAdminRole(user),
  },
  auth: { disableLocalStrategy: true, useAPIKey: true },
  access: adminAccess,
  fields: [{ name: "name", type: "text", required: true, unique: true }],
}
