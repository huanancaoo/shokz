"use client"

import {
  Locked,
  useAuth,
  useSelection,
  useTableColumns,
  useTranslation,
} from "@payloadcms/ui"
import { SelectAllStatus } from "@payloadcms/ui/providers/Selection"
import type { ClientUser, TypeWithID } from "payload"
import { Checkbox } from "@modules/common/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@modules/common/components/ui/table"

type ListDocument = TypeWithID & {
  _isLocked?: boolean
  _userEditing?: ClientUser
}

export function CmsListTable({
  docs,
  enableRowSelections,
  label,
}: {
  docs: ListDocument[]
  enableRowSelections?: boolean
  label: string
}) {
  const { columns } = useTableColumns()
  const { selectAll, selected, setSelection, toggleAll } = useSelection()
  const { user } = useAuth()
  const { t } = useTranslation()
  const visibleColumns = columns.filter(({ active }) => active)

  return (
    <div className="overflow-hidden rounded-lg border border-solid border-border bg-card">
      <Table aria-label={label} className="border-collapse">
        <TableHeader className="bg-muted">
          <TableRow className="border-x-0 border-t-0 border-solid border-border">
            {enableRowSelections && (
              <TableHead className="w-10 pl-4">
                <Checkbox
                  aria-label={t(
                    selectAll === SelectAllStatus.None
                      ? "general:selectAllRows"
                      : "general:deselectAllRows"
                  )}
                  checked={
                    selectAll === SelectAllStatus.AllInPage ||
                    selectAll === SelectAllStatus.AllAvailable
                  }
                  indeterminate={selectAll === SelectAllStatus.Some}
                  onCheckedChange={() => toggleAll()}
                />
              </TableHead>
            )}
            {visibleColumns.map(({ accessor, Heading }) => (
              <TableHead
                className="px-4 text-muted-foreground"
                key={accessor}
                scope="col"
              >
                {Heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((doc, index) => {
            const { _isLocked, _userEditing, id } = doc
            const isSelected = Boolean(selected.get(id))
            return (
              <TableRow
                className="border-x-0 border-t-0 border-solid border-border"
                data-id={id}
                data-state={isSelected ? "selected" : undefined}
                key={id}
              >
                {enableRowSelections && (
                  <TableCell className="pl-4">
                    {_isLocked &&
                    _userEditing &&
                    _userEditing.id !== user?.id ? (
                      <Locked user={_userEditing} />
                    ) : (
                      <Checkbox
                        aria-label={`${t("general:row")} ${index + 1}`}
                        checked={isSelected}
                        onCheckedChange={() => setSelection(id)}
                      />
                    )}
                  </TableCell>
                )}
                {visibleColumns.map(({ accessor, renderedCells }) => (
                  <TableCell className="h-10 px-4 py-2" key={accessor}>
                    {renderedCells[index]}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
