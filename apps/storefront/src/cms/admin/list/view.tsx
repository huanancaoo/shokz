"use client"

import { getTranslation } from "@payloadcms/translations"
import {
  Gutter,
  ListControls,
  ListHeader,
  ListSelection,
  PageControls,
  RelationshipProvider,
  SelectionProvider,
  SelectMany,
  SetStepNav,
  StickyToolbar,
  TableColumnsProvider,
  useBulkUpload,
  useConfig,
  useListDrawerContext,
  useListQuery,
  useModal,
  useTranslation,
  useWindowInfo,
  ViewDescription,
} from "@payloadcms/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ListViewClientProps } from "payload"
import { formatAdminURL } from "payload/shared"
import { buttonVariants } from "@modules/common/components/ui/button"
import { Card } from "@modules/common/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@modules/common/components/ui/empty"
import { CmsListTable } from "./table"

export function CmsListView({
  AfterList,
  AfterListTable,
  BeforeList,
  BeforeListTable,
  Description,
  Table: payloadTable,
  beforeActions,
  collectionSlug,
  columnState,
  disableBulkDelete,
  disableBulkEdit,
  disableQueryPresets,
  enableRowSelections,
  hasCreatePermission,
  hasDeletePermission,
  hasTrashPermission,
  listMenuItems,
  newDocumentURL,
  queryPreset,
  queryPresetPermissions,
  renderedFilters,
  resolvedFilterOptions,
  viewType,
}: ListViewClientProps) {
  const { config, getEntityConfig } = useConfig()
  const { i18n, t } = useTranslation()
  const { data, isGroupingBy, orderableFieldName } = useListQuery()
  const { allowCreate, isInDrawer, onBulkSelect } = useListDrawerContext()
  const { breakpoints } = useWindowInfo()
  const { drawerSlug, setCollectionSlug, setOnSuccess } = useBulkUpload()
  const { openModal } = useModal()
  const router = useRouter()
  const collectionConfig = getEntityConfig({ collectionSlug })
  const label = getTranslation(collectionConfig.labels.plural, i18n)
  const docs = data?.docs ?? []
  const hasRows = docs.length > 0
  const inTrash = viewType === "trash"
  const canCreate = hasCreatePermission && allowCreate !== false
  const upload = collectionConfig.upload
  const actions = [...(beforeActions ?? [])]
  if (!isInDrawer && !inTrash && collectionConfig.folders && config.folders) {
    actions.push(
      <Link
        key="folders"
        className={buttonVariants({ size: "sm", variant: "outline" })}
        href={formatAdminURL({
          adminRoute: config.routes.admin,
          path: `/collections/${collectionSlug}/${config.folders.slug}`,
        })}
        prefetch={false}
      >
        {t("folder:byFolder")}
      </Link>
    )
  }
  if (enableRowSelections && onBulkSelect) {
    actions.push(<SelectMany key="select-many" onClick={onBulkSelect} />)
  }
  const listURL = formatAdminURL({
    adminRoute: config.routes.admin,
    path: `/collections/${collectionSlug}`,
  })
  const breadcrumbs = inTrash
    ? [{ label, url: listURL }, { label: t("general:trash") }]
    : [{ label }]

  return (
    <TableColumnsProvider
      collectionSlug={collectionSlug}
      columnState={columnState}
    >
      <SelectionProvider docs={docs} totalDocs={data?.totalDocs ?? 0}>
        {!isInDrawer && <SetStepNav nav={breadcrumbs} />}
        <div className="cms-list">
          {BeforeList}
          <Gutter className="flex flex-col gap-4 pb-8 pt-5">
            <ListHeader
              collectionConfig={collectionConfig}
              Description={
                Description ??
                (collectionConfig.admin.description && (
                  <ViewDescription
                    collectionSlug={collectionSlug}
                    description={collectionConfig.admin.description}
                  />
                ))
              }
              disableBulkDelete={disableBulkDelete}
              disableBulkEdit={disableBulkEdit}
              hasCreatePermission={canCreate}
              hasDeletePermission={hasDeletePermission}
              hasTrashPermission={hasTrashPermission}
              i18n={i18n}
              isBulkUploadEnabled={Boolean(
                upload && upload.bulkUpload && !upload.hideFileInputOnCreate
              )}
              isTrashEnabled={collectionConfig.trash}
              newDocumentURL={newDocumentURL}
              openBulkUpload={() => {
                setCollectionSlug(collectionSlug)
                setOnSuccess(() => router.refresh())
                openModal(drawerSlug)
              }}
              smallBreak={breakpoints.s}
              viewType={viewType}
            />
            <Card className="cms-list-toolbar gap-0 p-3">
              <ListControls
                beforeActions={actions}
                collectionConfig={collectionConfig}
                collectionSlug={collectionSlug}
                disableQueryPresets={disableQueryPresets}
                listMenuItems={listMenuItems}
                queryPreset={queryPreset}
                queryPresetPermissions={queryPresetPermissions}
                renderedFilters={renderedFilters}
                resolvedFilterOptions={resolvedFilterOptions}
              />
            </Card>
            {BeforeListTable}
            {hasRows ? (
              <RelationshipProvider>
                {/* 分组分页和手动排序使用各自的 Payload 表格交互。 */}
                {isGroupingBy || orderableFieldName ? (
                  payloadTable
                ) : (
                  <CmsListTable
                    docs={docs}
                    enableRowSelections={enableRowSelections}
                    label={label}
                  />
                )}
              </RelationshipProvider>
            ) : (
              <Empty className="min-h-48 border border-border bg-card">
                <EmptyHeader>
                  <EmptyTitle>{t("general:noResultsFound")}</EmptyTitle>
                  <EmptyDescription>
                    {inTrash
                      ? t("general:noTrashResults", { label })
                      : t("general:noResultsDescription")}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {AfterListTable}
            {hasRows && !isGroupingBy && (
              <PageControls
                AfterPageControls={
                  breakpoints.s && (
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <ListSelection
                        collectionConfig={collectionConfig}
                        disableBulkDelete={disableBulkDelete}
                        disableBulkEdit={disableBulkEdit}
                        hasDeletePermission={hasDeletePermission}
                        hasTrashPermission={hasTrashPermission}
                        label={label}
                        showSelectAllAcrossPages
                        viewType={viewType}
                      />
                      {actions}
                    </div>
                  )
                }
                collectionConfig={collectionConfig}
              />
            )}
          </Gutter>
          {AfterList}
        </div>
        {hasRows && isGroupingBy && (data?.totalPages ?? 0) > 1 && (
          <StickyToolbar>
            <PageControls collectionConfig={collectionConfig} />
          </StickyToolbar>
        )}
      </SelectionProvider>
    </TableColumnsProvider>
  )
}
