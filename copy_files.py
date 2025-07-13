#!/usr/bin/env python3

import shutil
import os
import stat
import subprocess

# Define paths
project_dir = "/Users/supabowl/Downloads/Cursor/Organized AI Client/organized-agents"
app_bundle = f"{project_dir}/Organized AI.app"
app_dest = "/Applications/Organized AI.app"

# Executable paths (check both debug and release)
debug_exec = f"{project_dir}/src-tauri/target/debug/organized-agents"
release_exec = f"{project_dir}/src-tauri/target/release/organized-agents"
icon_source = f"{project_dir}/src-tauri/icons/icon.icns"

print("🚀 Creating Organized AI Desktop App...")
print("=====================================")

try:
    # Find executable
    executable_source = None
    if os.path.exists(debug_exec):
        executable_source = debug_exec
        print("✅ Found debug build")
    elif os.path.exists(release_exec):
        executable_source = release_exec
        print("✅ Found release build")
    else:
        print("❌ No executable found! Please run 'bun run tauri dev' first.")
        exit(1)
    
    # Ensure MacOS directory exists
    os.makedirs(f"{app_bundle}/Contents/MacOS", exist_ok=True)
    os.makedirs(f"{app_bundle}/Contents/Resources", exist_ok=True)
    
    # Copy executable
    executable_dest = f"{app_bundle}/Contents/MacOS/Organized AI"
    print(f"📋 Copying executable to app bundle...")
    shutil.copy2(executable_source, executable_dest)
    
    # Make executable
    os.chmod(executable_dest, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)
    print("✅ Executable copied and permissions set")
    
    # Copy icon
    if os.path.exists(icon_source):
        icon_dest = f"{app_bundle}/Contents/Resources/icon.icns"
        print("🎨 Copying app icon...")
        shutil.copy2(icon_source, icon_dest)
        print("✅ Icon copied")
    
    # Remove old app from Applications if exists
    if os.path.exists(app_dest):
        print("🧹 Removing old installation...")
        shutil.rmtree(app_dest)
    
    # Copy to Applications
    print("📦 Installing to Applications folder...")
    shutil.copytree(app_bundle, app_dest)
    
    # Clear quarantine attributes
    print("🔐 Clearing quarantine attributes...")
    subprocess.run(["xattr", "-cr", app_dest], capture_output=True)
    
    # Try to sign (optional, may fail without developer certificate)
    subprocess.run(["codesign", "--force", "--deep", "--sign", "-", app_dest], capture_output=True)
    
    print("\n✅ SUCCESS! Organized AI has been installed!")
    print("=============================================")
    print("📍 Location: /Applications/Organized AI")
    print("🚀 You can now:")
    print("   • Double-click to launch from Applications")
    print("   • Search with Spotlight (Cmd+Space)")
    print("   • Drag to Dock for quick access")
    
    # Open Applications folder
    print("\nOpening Applications folder...")
    subprocess.run(["open", "/Applications"])
    
    # Try to launch the app
    print("Launching Organized AI...")
    subprocess.run(["open", app_dest])
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("Please check permissions or run with sudo if needed.")