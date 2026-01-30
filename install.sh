#!/bin/sh
set -e

APP_NAME="uni"
REPO="hangyakuzero/UNI"

echo "📦 UNI Installer"

# -------------------------
# Detect OS
# -------------------------
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

case "$OS" in
darwin*)
  PLATFORM="macos"
  ;;
mingw* | msys* | cygwin*)
  PLATFORM="windows"
  ;;
*)
  echo "❌ Unsupported OS: $OS"
  exit 1
  ;;
esac

# -------------------------
# macOS: Apple Silicon only
# -------------------------
if [ "$PLATFORM" = "macos" ]; then
  ARCH="$(uname -m)"
  if [ "$ARCH" != "arm64" ]; then
    echo "❌ Unsupported Mac architecture: $ARCH"
    echo "👉 UNI supports Apple Silicon (M1/M2/M3) only."
    exit 1
  fi
fi

# -------------------------
# Desktop path
# -------------------------
if [ "$PLATFORM" = "macos" ]; then
  DESKTOP="$HOME/Desktop"
  ASSET="uni-macos"
  OUTFILE="$DESKTOP/$APP_NAME"
else
  # Windows (Git Bash safe path)
  DESKTOP="/c/Users/$(whoami)/Desktop"
  ASSET="uni.exe"
  OUTFILE="$DESKTOP/uni.exe"
fi

echo "📍 Target location: $DESKTOP"

# -------------------------
# Ensure Desktop exists & writable
# -------------------------
if [ ! -d "$DESKTOP" ]; then
  echo "❌ Desktop directory not found: $DESKTOP"
  exit 1
fi

if [ ! -w "$DESKTOP" ]; then
  echo "❌ Desktop is not writable: $DESKTOP"
  exit 1
fi

# -------------------------
# Fetch latest release tag
# -------------------------
echo "🔍 Fetching latest release…"

VERSION="$(curl -fL https://api.github.com/repos/$REPO/releases/latest |
  grep '"tag_name"' |
  cut -d '"' -f 4)"

if [ -z "$VERSION" ]; then
  echo "❌ Failed to determine latest release version"
  exit 1
fi

echo "🏷️  Latest version: $VERSION"

# -------------------------
# Download
# -------------------------
URL="https://github.com/$REPO/releases/download/$VERSION/$ASSET"

echo "⬇️  Downloading $ASSET…"
echo "   $URL"

# Remove existing file if present (important for curl 56)
rm -f "$OUTFILE"

curl -fL --retry 3 --retry-delay 2 "$URL" -o "$OUTFILE"

# -------------------------
# Post-install fixes
# -------------------------
if [ "$PLATFORM" = "macos" ]; then
  chmod +x "$OUTFILE"
  xattr -d com.apple.quarantine "$OUTFILE" 2>/dev/null || true
fi

# -------------------------
# Done
# -------------------------
echo ""
echo "✅ UNI installed successfully!"

if [ "$PLATFORM" = "macos" ]; then
  echo "👉 Location: $OUTFILE"
  echo "👉 Double-click 'uni' on your Desktop"
  echo "👉 Or run:"
  echo "   $OUTFILE"
else
  echo "👉 Double-click 'uni.exe' on your Desktop"
fi

echo "💕 Enjoy UNI"
