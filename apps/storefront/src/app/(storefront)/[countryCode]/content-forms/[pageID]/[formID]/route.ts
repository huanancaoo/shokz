import config from "@payload-config"
import { getPayload, ValidationError, type PayloadRequest } from "payload"
import { publishedEditorialPath, relationID } from "@/cms/content-model"
import type { Form } from "@/payload-types"

type Props = { params: Promise<{ countryCode: string; formID: string; pageID: string }> }
type FormField = NonNullable<Form["fields"]>[number]

function response(message: string, status: number) {
  return Response.json({ message }, { status })
}

function isValidValue(field: Exclude<FormField, { blockType: "message" | "upload" }>, value: string) {
  if (!value) return !field.required

  switch (field.blockType) {
    case "checkbox":
      return value === "on"
    case "date": {
      const date = new Date(`${value}T00:00:00Z`)
      return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case "number":
      return Number.isFinite(Number(value))
    case "select":
    case "radio":
      return Boolean(field.options?.some((option) => option.value === value))
    default:
      return true
  }
}

export async function POST(request: Request, { params }: Props) {
  const { countryCode, formID, pageID } = await params
  const ids = [Number(pageID), Number(formID)]
  if (!ids.every((id) => Number.isSafeInteger(id) && id > 0)) {
    return response("양식을 찾을 수 없습니다.", 404)
  }

  const payload = await getPayload({ config, cron: true })
  const { docs: [page] } = await payload.find({
    collection: "pages",
    where: { id: { equals: ids[0] }, _status: { equals: "published" } },
    select: { layout: true },
    depth: 2,
    limit: 1,
  })
  const block = page?.layout?.find((item) => item.blockType === "formBlock" && relationID(item.form) === ids[1])
  if (block?.blockType !== "formBlock" || typeof block.form !== "object" || !block.form) {
    return response("양식을 찾을 수 없습니다.", 404)
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) return response("제출할 내용을 확인해 주세요.", 400)

  const { form } = block
  const fields: { field: string; value: string }[] = []
  const files: NonNullable<PayloadRequest["files"]> = Object.create(null)
  for (const field of form.fields ?? []) {
    if (field.blockType === "message") continue
    if (field.blockType === "upload") {
      const uploads = formData.getAll(field.name).filter((item): item is File => item instanceof File && Boolean(item.name))
      files[field.name] = await Promise.all(uploads.map(async (file) => ({
        name: file.name,
        size: file.size,
        mimetype: file.type,
        data: Buffer.from(await file.arrayBuffer()),
      })))
      continue
    }
    const input = formData.get(field.name)
    const value = typeof input === "string" ? input.trim() : ""
    if (!isValidValue(field, value)) {
      return response(`${field.label || field.name} 항목을 확인해 주세요.`, 400)
    }
    if (value) fields.push({ field: field.name, value })
  }

  try {
    // 只有被已发布页面引用的表单可提交，附件验证、保存和通知由 Form Builder 处理。
    await payload.create({
      collection: "form-submissions",
      data: { form: form.id, submissionData: fields },
      req: { files },
      depth: 0,
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return response(error.data.errors[0]?.message || "제출할 항목을 확인해 주세요.", 400)
    }
    payload.logger.error({ err: error, msg: "Content form submission failed" })
    return response("제출하지 못했습니다. 다시 시도해 주세요.", 500)
  }

  const url = form.confirmationType === "redirect"
    ? form.redirect?.type === "reference"
      ? publishedEditorialPath(form.redirect.reference?.value)
      : form.redirect?.url
    : undefined
  const redirect = url && /^\/(?![/\\])[^\s\\]*$/.test(url)
    ? `/${countryCode}${url}`
    : url && /^https:\/\//i.test(url) && URL.canParse(url) ? url : undefined

  return Response.json({ redirect }, { status: 201 })
}
