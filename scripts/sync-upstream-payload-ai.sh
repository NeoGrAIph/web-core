#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SRC="$ROOT_DIR/upstream/payload/templates/payload-ai/src"
DEST="$ROOT_DIR/packages/plugins/payload-plugin-ai/src"

if [[ ! -d "$SRC" ]]; then
  echo "Source not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"

# Rewrite upstream package name to the local workspace package
rg -l "@ai-stack/payloadcms" "$DEST" | while read -r file; do
  sed -i "s/@ai-stack\/payloadcms/@synestra\/payload-plugin-ai/g" "$file"
done

echo "Synced payload-ai into packages/plugins/payload-plugin-ai/src"
