#!/bin/bash

echo "Starting copy operations..."

# Copy executable
cp "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/src-tauri/target/debug/organized-agents" "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/Organized AI.app/Contents/MacOS/Organized AI"

# Copy icon
cp "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/src-tauri/icons/icon.icns" "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents/Organized AI.app/Contents/Resources/icon.icns"

echo "Copy operations completed"