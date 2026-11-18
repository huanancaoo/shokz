#!/usr/bin/env bash
set -euo pipefail

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export SHOKZ_SELF_HOSTED=1
export NODE_OPTIONS=--max-old-space-size=1536
export RAYON_NUM_THREADS=1

corepack pnpm install --frozen-lockfile --prod=false --store-dir /opt/shokz/pnpm-store --package-import-method=hardlink --reporter=append-only
corepack pnpm --dir apps/backend run build
corepack pnpm --dir apps/storefront run build

standalone=apps/storefront/.next/standalone/apps/storefront
cp -a apps/storefront/public "$standalone/"
cp -a apps/storefront/.next/static "$standalone/.next/"
