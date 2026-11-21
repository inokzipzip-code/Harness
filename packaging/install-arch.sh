#!/usr/bin/env bash
set -euo pipefail

echo "Installing MegaHarness for Arch Linux..."
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install it with: sudo pacman -S nodejs npm"
  exit 1
fi

chmod +x cli/megaharness.mjs
npm link

echo "Done! Run 'megaharness' in any project directory to start VibeCode."
