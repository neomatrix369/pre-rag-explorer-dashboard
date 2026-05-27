#!/bin/bash
# Ensure Rollup's platform binary is installed after npm ci (npm/cli#4828).
# Vitest stubs sharp — see src/tests/sharp-stub.ts.
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

platform="$(node -p "process.platform")"
arch="$(node -p "process.arch")"

if [[ -f /etc/alpine-release ]]; then
  libc=musl
else
  libc=gnu
fi

rollup_pkg=""
case "${platform}" in
  darwin) rollup_pkg="@rollup/rollup-darwin-${arch}" ;;
  linux) rollup_pkg="@rollup/rollup-linux-${arch}-${libc}" ;;
  win32) rollup_pkg="@rollup/rollup-win32-${arch}-gnu" ;;
  *)
    echo "Unsupported platform for Rollup native binary: ${platform}"
    exit 1
    ;;
esac

echo "Ensuring Rollup native binary: ${rollup_pkg}..."

if ! npm ls "${rollup_pkg}" --depth=0 >/dev/null 2>&1; then
  rollup_version="$(node -p "require('rollup/package.json').version")"
  npm install --no-save "${rollup_pkg}@${rollup_version}"
fi

npm rebuild rollup
