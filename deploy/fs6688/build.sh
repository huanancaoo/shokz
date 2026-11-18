#!/usr/bin/env bash
set -euo pipefail

if [[ $# != 3 ]]; then
  printf '%s\n' 'Usage: bash deploy/fs6688/build.sh OUTPUT_DIR PRODUCTION_WORKSPACE MEDIA_MANIFEST' >&2
  exit 1
fi

output=$1
production=$2
media_manifest=$3
test ! -e "$output"
test -f "$production/apps/backend/node_modules/@medusajs/cli/cli.js"
node -e 'if (process.platform !== "linux" || process.arch !== "x64" || process.version !== "v24.22.3" || !process.report.getReport().header.glibcVersionRuntime) process.exit(1)'

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export SHOKZ_SELF_HOSTED=1
export NODE_OPTIONS=--max-old-space-size=1536
export RAYON_NUM_THREADS=1

# Materialize the target's media IDs in the disposable source checkout before bundling content.
node deploy/fs6688/prepare-storefront-content.mjs "$media_manifest"

corepack pnpm --dir apps/backend run build

mkdir -p "$output/apps/backend" "$output/deploy" "$output/storefront"
tar --exclude=./node_modules -cf - -C apps/backend/.medusa/server . | tar -xf - -C "$output/apps/backend"
cp -a "$production/node_modules" "$output/"
cp -a "$production/apps/backend/node_modules" "$output/apps/backend/"
cp -a deploy/fs6688 "$output/deploy/"

# The sitemap reads the restored catalog. Boot the packaged backend so the build also checks its dependencies.
(
  cd "$output/apps/backend"
  exec node node_modules/@medusajs/cli/cli.js start --host 127.0.0.1 --port 19001
) > "$output/../shokz-build-medusa.log" 2>&1 &
backend_pid=$!
trap 'kill "$backend_pid" 2>/dev/null || true; wait "$backend_pid" 2>/dev/null || true' EXIT

for attempt in {1..60}; do
  if node -e 'fetch("http://127.0.0.1:19001/health", { signal: AbortSignal.timeout(3000) }).then(response => { process.exitCode = response.ok ? 0 : 1 }, () => { process.exitCode = 1 })'; then
    break
  fi
  if ! kill -0 "$backend_pid" 2>/dev/null || ((attempt == 60)); then
    printf '%s\n' 'Medusa failed to become ready for the storefront build' >&2
    exit 1
  fi
  sleep 2
done

corepack pnpm --dir apps/storefront run build

cp -a apps/storefront/.next/standalone/. "$output/storefront/"
standalone=$output/storefront/apps/storefront
cp -a apps/storefront/public "$standalone/"
cp -a apps/storefront/.next/static "$standalone/.next/"

# Ubuntu uses glibc. The musl bindings, type declarations, and maps only add size to this runtime.
find "$output/node_modules" "$output/storefront/node_modules" -type d \
  \( -name '@swc+core-linux-x64-musl@*' -o -name '@next+swc-linux-x64-musl@*' -o -name '@img+sharp*-linuxmusl-x64@*' \) \
  -prune -exec rm -rf -- {} +
find "$output/node_modules" "$output/storefront/node_modules" -type l \
  \( -name 'core-linux-x64-musl' -o -name 'swc-linux-x64-musl' -o -name 'sharp*-linuxmusl-x64' \) -delete
find "$output/node_modules" "$output/storefront" -type f \
  \( -name '*.map' -o -name '*.d.ts' -o -name '*.d.cts' -o -name '*.d.mts' \) -delete
