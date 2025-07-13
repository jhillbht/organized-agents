#!/bin/bash

# Icon Generator for Organized Agents
# Generates all required Tauri icon formats from a source image

SOURCE="source-icon.png"
ICON_DIR="src-tauri/icons"

echo "🎨 Organized Agents Icon Generator"
echo "=================================="

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
    echo "❌ Source icon not found!"
    echo "Please save your handshake icon as 'source-icon.png' in the project root"
    echo "Recommended size: 1024x1024 or higher"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo "Install it with: brew install imagemagick"
    exit 1
fi

echo "✅ Source icon found: $SOURCE"
echo "✅ ImageMagick available"
echo ""
echo "🔄 Generating icons..."

# Create backup of existing icons
if [ -d "${ICON_DIR}_backup" ]; then
    rm -rf "${ICON_DIR}_backup"
fi
cp -r "$ICON_DIR" "${ICON_DIR}_backup"
echo "📦 Backed up existing icons to ${ICON_DIR}_backup"

# Core app icons
echo "  → Core app icons..."
magick "$SOURCE" -resize 32x32 "$ICON_DIR/32x32.png"
magick "$SOURCE" -resize 128x128 "$ICON_DIR/128x128.png" 
magick "$SOURCE" -resize 256x256 "$ICON_DIR/128x128@2x.png"
magick "$SOURCE" -resize 1024x1024 "$ICON_DIR/icon.png"

# Windows Store icons
echo "  → Windows Store icons..."
magick "$SOURCE" -resize 30x30 "$ICON_DIR/Square30x30Logo.png"
magick "$SOURCE" -resize 44x44 "$ICON_DIR/Square44x44Logo.png"
magick "$SOURCE" -resize 71x71 "$ICON_DIR/Square71x71Logo.png"
magick "$SOURCE" -resize 89x89 "$ICON_DIR/Square89x89Logo.png"
magick "$SOURCE" -resize 107x107 "$ICON_DIR/Square107x107Logo.png"
magick "$SOURCE" -resize 142x142 "$ICON_DIR/Square142x142Logo.png"
magick "$SOURCE" -resize 150x150 "$ICON_DIR/Square150x150Logo.png"
magick "$SOURCE" -resize 284x284 "$ICON_DIR/Square284x284Logo.png"
magick "$SOURCE" -resize 310x310 "$ICON_DIR/Square310x310Logo.png"
magick "$SOURCE" -resize 50x50 "$ICON_DIR/StoreLogo.png"

# Generate ICO bundle (Windows)
echo "  → Windows ICO bundle..."
magick "$SOURCE" -define icon:auto-resize=256,128,64,48,32,16 "$ICON_DIR/icon.ico"

# Generate ICNS bundle (macOS)
echo "  → macOS ICNS bundle..."
if command -v png2icns &> /dev/null; then
    png2icns "$ICON_DIR/icon.icns" "$SOURCE"
    echo "  ✅ macOS ICNS created"
else
    echo "  ⚠️  Skipping ICNS (install libicns: brew install libicns)"
fi

echo ""
echo "🎉 Icon generation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test icons: npm run tauri:dev"
echo "2. Check appearance in app window, dock, taskbar"
echo "3. Commit changes: git add src-tauri/icons/ && git commit -m 'Update app icons to human-AI handshake design'"
echo ""
echo "📁 Generated $(ls -1 $ICON_DIR/*.png $ICON_DIR/*.ico $ICON_DIR/*.icns 2>/dev/null | wc -l) icon files"
echo "🔍 Files updated in: $ICON_DIR/"
