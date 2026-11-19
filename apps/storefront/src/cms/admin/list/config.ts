import type { Config } from "payload"

export function withCmsListViews(config: Config): Config {
  return {
    ...config,
    collections: config.collections?.map((collection) => {
      const { admin } = collection
      const views = admin?.components?.views

      if (views?.list?.Component) return collection

      return {
        ...collection,
        admin: {
          ...admin,
          components: {
            ...admin?.components,
            views: {
              ...views,
              list: { Component: "/cms/admin/list/view#CmsListView" },
            },
          },
        },
      }
    }),
  }
}
