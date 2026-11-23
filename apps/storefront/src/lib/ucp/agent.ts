import "server-only"
import { lookup } from "node:dns"
import { get } from "node:https"
import { isIP, type LookupFunction } from "node:net"
import ipaddr from "ipaddr.js"
import { parseDictionary } from "structured-headers"
import { z } from "zod"
import {
  CapabilityName,
  readJsonBody,
  toResponse,
  UCP_VERSION,
  UcpResult,
} from "./ucp"

const VERSION = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const NAME = z.string().regex(/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)+$/)
const uri = z.string().url()
const entity = z.object({
  version: VERSION,
  spec: uri,
  schema: uri,
  config: z.record(z.string(), z.unknown()).optional(),
})
const platformProfile = z.object({
  ucp: z.object({
    version: VERSION,
    services: z.record(
      NAME,
      z.array(
        entity
          .extend({
            transport: z.enum(["rest", "mcp", "a2a", "embedded"]),
            endpoint: uri.optional(),
            schema: entity.shape.schema.optional(),
          })
          .refine((service) => service.transport === "a2a" || !!service.schema)
      )
    ),
    capabilities: z
      .record(
        NAME,
        z.array(
          entity.extend({
            extends: z.union([NAME, z.array(NAME).min(1)]).optional(),
          })
        )
      )
      .optional(),
    payment_handlers: z.record(
      NAME,
      z.array(entity.extend({ id: z.string() }))
    ),
  }),
})

type PlatformProfile = z.infer<typeof platformProfile>["ucp"]
const PROFILE_TIMEOUT_MS = 5_000
const PROFILE_MAX_BYTES = 128 * 1024
const PROFILE_CACHE_TTL_MS = 60_000
const PROFILE_CACHE_LIMIT = 100
const profiles = new Map<
  string,
  { expiresAt: number; result: Promise<PlatformProfile> }
>()

const isPublicAddress = (address: string) => {
  const parsed = ipaddr.parse(address)
  return (
    parsed.range() === "unicast" &&
    (!(parsed instanceof ipaddr.IPv6) ||
      parsed.match(ipaddr.IPv6.parse("2000::"), 3))
  )
}

const BLOCKED_ADDRESS = "UCP_PROFILE_ADDRESS_BLOCKED"
const INVALID_PROFILE = "UCP_PROFILE_INVALID"

const lookupPublicAddress: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { all: true }, (error, addresses) => {
    if (error) return callback(error, "")
    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicAddress(address))
    ) {
      return callback(
        Object.assign(new Error(BLOCKED_ADDRESS), { code: BLOCKED_ADDRESS }),
        ""
      )
    }
    // Give the TLS connection the validated DNS results so it cannot resolve the host again.
    if (options.all) return callback(null, addresses)
    callback(null, addresses[0].address, addresses[0].family)
  })
}

const readProfile = (url: URL) =>
  new Promise<PlatformProfile>((resolve, reject) => {
    const request = get(
      url,
      {
        agent: false,
        lookup: lookupPublicAddress,
        signal: AbortSignal.timeout(PROFILE_TIMEOUT_MS),
        headers: { Accept: "application/json" },
      },
      async (response) => {
        try {
          const status = response.statusCode ?? 0
          if (status < 200 || status >= 300) {
            response.destroy()
            throw new Error(
              "Platform profile did not return a successful response"
            )
          }
          const chunks: Buffer[] = []
          let size = 0
          for await (const chunk of response) {
            size += chunk.length
            if (size > PROFILE_MAX_BYTES) throw new Error(INVALID_PROFILE)
            chunks.push(chunk)
          }
          try {
            const parsed = platformProfile.parse(
              JSON.parse(Buffer.concat(chunks).toString("utf8"))
            )
            resolve(parsed.ucp)
          } catch {
            reject(new Error(INVALID_PROFILE))
          }
        } catch (error) {
          reject(error)
        }
      }
    )
    request.on("error", reject)
  })

const getProfile = (url: URL) => {
  const key = url.href
  const now = Date.now()
  const cached = profiles.get(key)
  if (cached && cached.expiresAt > now) return cached.result

  profiles.delete(key)
  if (profiles.size >= PROFILE_CACHE_LIMIT) {
    const oldest = profiles.keys().next().value
    if (oldest) profiles.delete(oldest)
  }
  const result = readProfile(url)
  profiles.set(key, { expiresAt: now + PROFILE_CACHE_TTL_MS, result })
  result.catch(() => {
    if (profiles.get(key)?.result === result) profiles.delete(key)
  })
  return result
}

const readAgentHeader = (header: string | null) => {
  if (!header) return undefined
  try {
    return parseDictionary(header).get("profile")?.[0]
  } catch {
    return undefined
  }
}

const invalidProfileUrl = () => ({
  status: 400 as const,
  body: {
    code: "invalid_profile_url",
    content: "UCP-Agent must identify a reachable HTTPS platform profile",
  },
})

type Negotiation =
  | { profile: string }
  | { status: 400 | 422 | 424; body: { code: string; content: string } }
  | { status: 200; body: Record<string, unknown> }

export const negotiateAgent = async (
  request: Request,
  profile: unknown,
  capability: CapabilityName,
  rest = false
): Promise<Negotiation> => {
  if (typeof profile !== "string" || !URL.canParse(profile))
    return invalidProfileUrl()
  const url = new URL(profile)
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    (rest && url.pathname !== "/.well-known/ucp")
  ) {
    return invalidProfileUrl()
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "")
  // Next normalizes request.url in dev. The Host header still carries the loopback listener.
  const localDevelopment =
    process.env.NODE_ENV === "development" &&
    process.env.HOSTNAME === "127.0.0.1" &&
    request.headers.get("host")?.split(":")[0] === "127.0.0.1" &&
    hostname === "127.0.0.1"
  if (isIP(hostname) && !isPublicAddress(hostname) && !localDevelopment) {
    return invalidProfileUrl()
  }

  let platform: PlatformProfile
  try {
    platform = await getProfile(url)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (
      code === BLOCKED_ADDRESS ||
      code === "ENOTFOUND" ||
      code === "ENODATA"
    ) {
      return invalidProfileUrl()
    }
    if (error instanceof Error && error.message === INVALID_PROFILE) {
      return {
        status: 422,
        body: {
          code: "profile_malformed",
          content: "Invalid UCP platform profile",
        },
      }
    }
    return {
      status: 424,
      body: {
        code: "profile_unreachable",
        content: "Unable to fetch the UCP platform profile",
      },
    }
  }

  if (platform.version !== UCP_VERSION) {
    return {
      status: 422,
      body: {
        code: "version_unsupported",
        content: `This business supports UCP ${UCP_VERSION}`,
      },
    }
  }
  const compatible = platform.capabilities?.[capability]?.some(
    (entry) =>
      entry.version === UCP_VERSION &&
      !entry.extends &&
      new URL(entry.schema).origin === "https://ucp.dev"
  )
  if (!compatible) {
    return {
      status: 200,
      body: {
        ucp: { version: UCP_VERSION, status: "error", capabilities: {} },
        messages: [
          {
            type: "error",
            code: "capabilities_incompatible",
            content: `No compatible version of ${capability}`,
            severity: "unrecoverable",
          },
        ],
      },
    }
  }
  return { profile: url.href }
}

export const runRestOperation = async (
  request: Request,
  capability: CapabilityName,
  run: (profile: string) => Promise<UcpResult>
) => {
  const agent = await negotiateAgent(
    request,
    readAgentHeader(request.headers.get("UCP-Agent")),
    capability,
    true
  )
  return toResponse("profile" in agent ? await run(agent.profile) : agent)
}

export const runRestJsonOperation = (
  request: Request,
  capability: CapabilityName,
  run: (body: Record<string, unknown>, profile: string) => Promise<UcpResult>
) =>
  runRestOperation(request, capability, async (profile) => {
    const body = await readJsonBody(request)
    return body
      ? run(body, profile)
      : {
          status: 400,
          body: { code: "invalid_request", content: "Expected a JSON object" },
        }
  })

export const scopedIdempotencyKey = (profile: string, key: unknown) =>
  typeof key === "string" && key ? JSON.stringify([profile, key]) : undefined
