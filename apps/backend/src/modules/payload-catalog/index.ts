import { Module } from "@medusajs/framework/utils"
import PayloadCatalogService from "./service"

export const PAYLOAD_CATALOG_MODULE = "payloadCatalog"

export default Module(PAYLOAD_CATALOG_MODULE, {
  service: PayloadCatalogService,
})
