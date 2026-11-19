"use client"

import {
  Form,
  useAuth,
  useField,
  useFormProcessing,
  useTranslation,
} from "@payloadcms/ui"
import Link from "next/link"
import { Button } from "@modules/common/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@modules/common/components/ui/field"
import { Input } from "@modules/common/components/ui/input"
import { Spinner } from "@modules/common/components/ui/spinner"

const initialState = {
  email: { initialValue: "", valid: true, value: "" },
  password: { initialValue: "", valid: true, value: "" },
}

function CredentialField({
  autoComplete,
  label,
  name,
}: {
  autoComplete: string
  label: string
  name: "email" | "password"
}) {
  const { setValue, showError, errorMessage, value } = useField<string>({
    path: name,
  })
  const id = `cms-login-${name}`

  return (
    <Field data-invalid={showError}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        aria-describedby={showError ? `${id}-error` : undefined}
        aria-invalid={showError}
        autoComplete={autoComplete}
        className="h-10"
        id={id}
        name={name}
        onChange={(event) => setValue(event.currentTarget.value)}
        required
        type={name}
        value={value ?? ""}
      />
      {showError && <FieldError id={`${id}-error`}>{errorMessage}</FieldError>}
    </Field>
  )
}

function LoginFields({ forgotURL }: { forgotURL: string }) {
  const { t } = useTranslation()
  const processing = useFormProcessing()

  return (
    <FieldGroup>
      <CredentialField
        autoComplete="username"
        label={t("general:email")}
        name="email"
      />
      <CredentialField
        autoComplete="current-password"
        label={t("general:password")}
        name="password"
      />
      <Button
        aria-busy={processing}
        className="h-10 w-full"
        disabled={processing}
        type="submit"
      >
        {processing && <Spinner aria-hidden="true" data-icon="inline-start" />}
        {t("authentication:login")}
      </Button>
      <Link
        className="self-center text-sm text-muted-foreground hover:text-foreground"
        href={forgotURL}
        prefetch={false}
      >
        {t("authentication:forgotPasswordQuestion")}
      </Link>
    </FieldGroup>
  )
}

export function LoginForm({
  action,
  destination,
  forgotURL,
}: {
  action: string
  destination: string
  forgotURL: string
}) {
  const { setUser } = useAuth()

  return (
    <Form
      action={action}
      disableSuccessStatus
      initialState={initialState}
      method="POST"
      onSuccess={(result) => setUser(result as Parameters<typeof setUser>[0])}
      redirect={destination}
      waitForAutocomplete
    >
      <LoginFields forgotURL={forgotURL} />
    </Form>
  )
}
