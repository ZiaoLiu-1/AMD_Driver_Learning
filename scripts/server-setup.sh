#!/usr/bin/env bash
# ============================================================
# First-time server setup script
# Run once after cloning the repo on your server:
#   bash scripts/server-setup.sh
# ============================================================
set -euo pipefail

echo "========================================"
echo " AMD Driver Learning Platform — Setup  "
echo "========================================"

# ── 1. Node.js via nvm ───────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "→ Installing nvm + Node.js 20..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
else
  echo "✓ Node.js $(node -v) already installed"
fi

# ── 2. pnpm ──────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  echo "→ Installing pnpm..."
  npm install -g pnpm
else
  echo "✓ pnpm $(pnpm -v) already installed"
fi

# ── 3. PM2 ──────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  echo "→ Installing PM2..."
  npm install -g pm2
else
  echo "✓ PM2 $(pm2 -v) already installed"
fi

# ── 4. Dependencies ──────────────────────────────────────────
echo "→ Installing project dependencies..."
pnpm install --frozen-lockfile

# ── 5. Environment file ──────────────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo "⚠  No .env file found. Creating from .env.example..."
  cp .env.example .env
  echo ""
  echo "  Please edit .env now and set:"
  echo "    PORT=3000"
  echo "    NODE_ENV=production"
  echo "    VITE_ANALYTICS_ENDPOINT=  (optional)"
  echo "    VITE_ANALYTICS_WEBSITE_ID=  (optional)"
  echo ""
  read -p "Press Enter when .env is ready..."
else
  echo "✓ .env file already exists"
fi

# ── 6. Build ─────────────────────────────────────────────────
echo "→ Building..."
NODE_ENV=production pnpm run build

# ── 7. Create log directory ──────────────────────────────────
mkdir -p logs

# ── 8. Start PM2 ─────────────────────────────────────────────
echo "→ Starting with PM2..."
pm2 start ecosystem.config.cjs
pm2 save

# Save PM2 startup script
pm2 startup | tail -1 | bash || echo "  (run 'pm2 startup' manually to enable auto-start on reboot)"

echo ""
echo "========================================"
echo "  ✓ Setup complete!"
echo "  App running on port $(grep PORT .env | cut -d= -f2 || echo 3000)"
echo "  pm2 status         — check process"
echo "  pm2 logs           — view logs"
echo "  pm2 reload amd-learning-platform — reload after manual deploy"
echo "========================================"
