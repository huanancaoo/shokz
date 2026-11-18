#!/usr/bin/env bash
set -euo pipefail

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export SHOKZ_SELF_HOSTED=1
export NODE_OPTIONS=--max-old-space-size=1536
export RAYON_NUM_THREADS=1

corepack pnpm install --frozen-lockfile --prod=false --store-dir /opt/shokz/pnpm-store --package-import-method=hardlink --reporter=append-only
corepack pnpm --dir apps/backend run build

# Next prerenders the sitemap from the restored catalog during the build.
(
  cd apps/backend/.medusa/server
  exec node ../../node_modules/@medusajs/cli/cli.js start --host 127.0.0.1 --port 19001
) > "$HOME/shokz-build-medusa.log" 2>&1 &
backend_pid=$!
trap 'kill "$backend_pid" 2>/dev/null || true; wait "$backend_pid" 2>/dev/null || true' EXIT

for attempt in {1..60}; do
  if curl --noproxy '*' --max-time 3 -fsS -o /dev/null http://127.0.0.1:19001/health 2>/dev/null; then
    break
  fi
  if ! kill -0 "$backend_pid" 2>/dev/null || ((attempt == 60)); then
    printf '%s\n' 'Medusa failed to become ready for the storefront build' >&2
    exit 1
  fi
  sleep 2
done

corepack pnpm --dir apps/storefront run build

standalone=apps/storefront/.next/standalone/apps/storefront
cp -a apps/storefront/public "$standalone/"
cp -a apps/storefront/.next/static "$standalone/.next/"
