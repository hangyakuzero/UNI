#!/bin/sh
set -e

APP_NAME="uni"
REPO="hangyakuzero/UNI"

# ---- OS CHECK ----
if [ "$(uname -s)" != "Darwin" ]; then
  echo "❌ This installer supports macOS only"
  exit 1
fi

# ---- ARCH CHECK (STRICT) ----
ARCH="$(uname -m)"
if [ "$ARCH" != "arm64" ]; then
  echo "❌ Unsupported Mac architecture: $ARCH"
  echo "👉 UNI currently supports Apple Silicon (M1/M2/M3) only."
  exit 1
fi

DESKTOP="$HOME/Desktop"
OUTFILE="$DESKTOP/$APP_NAME"

echo "🍎 Installing UNI (Apple Silicon)"
echo "📍 Installing to Desktop"

# ---- FETCH LATEST RELEASE ----
VERSION="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" |
  grep '"tag_name"' | cut -d '"' -f 4)"

if [ -z "$VERSION" ]; then
  echo "❌ Failed to fetch latest release"
  exit 1
fi

echo "🏷️  Version: $VERSION"

# ---- DOWNLOAD ----
URL="https://github.com/$REPO/releases/download/$VERSION/uni-macos"

echo "⬇️  Downloading uni-macos..."
curl -fsSL "$URL" -o "$OUTFILE"

# ---- MACOS FIXES ----
chmod +x "$OUTFILE"
xattr -d com.apple.quarantine "$OUTFILE" 2>/dev/null || true

echo ""
echo "✅ UNI installed successfully!"
echo "👉 Double-click 'uni' on your Desktop"
echo "👉 Or run:"
echo "   $OUTFILE"
