#!/usr/bin/env bash
# Copies the web demo into ios/Web so it can be bundled as a folder reference.
# Run this before `xcodegen generate` (the GitHub workflow runs it automatically).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/ios/Web"

rm -rf "$DEST"
mkdir -p "$DEST"

for file in index.html styles.css refined.css polish.css app.js assets.js; do
  cp "$ROOT/$file" "$DEST/$file"
done

cp -R "$ROOT/assets" "$DEST/assets"

echo "Web assets prepared at $DEST"
