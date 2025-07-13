# Organized Agents Dev Container

🚀 **Zero-setup development environment** for Organized AI using Docker containers.

## Quick Start

### Option 1: VS Code Dev Container (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/jhillbht/organized-agents
cd organized-agents

# 2. Run setup validation
./setup-devcontainer.sh

# 3. Open in VS Code
code .

# 4. Click "Reopen in Container" when prompted
# 5. Wait for container to build (~5-10 minutes first time)
# 6. Run in VS Code terminal:
bun install
bun run tauri:dev
```

### Option 2: Docker Compose

```bash
# Start the development environment
docker-compose -f .devcontainer/docker-compose.yml up -d

# Connect to the container
docker-compose -f .devcontainer/docker-compose.yml exec organized-agents-dev bash

# Inside container:
bun install
bun run tauri:dev
```

### Option 3: Direct Docker

```bash
# Build and run container
docker build -f .devcontainer/Dockerfile -t organized-agents-dev .
docker run --rm -it -p 1420:1420 -v $(pwd):/workspace organized-agents-dev

# Inside container:
bun install
bun run tauri:dev  # Desktop app
# OR
bun run dev        # Web-only version
```

## What's Included

### Development Tools
- **Rust 1.70+** with Cargo and Clippy
- **Node.js 18 LTS** with npm
- **Bun** package manager (faster than npm)
- **Tauri CLI 2.0** for desktop app builds
- **Claude Code CLI** for authentication
- **Git, Vim, jq** and other development utilities

### VS Code Integration
- **Rust Analyzer** for Rust development
- **Tauri Extension** for desktop app support
- **TypeScript/React** extensions
- **Tailwind CSS** intellisense
- **Auto-formatting** on save
- **Integrated terminal** with bash

### System Dependencies
- **WebKit2GTK** for Tauri desktop rendering
- **GTK3** for native UI elements
- **SSL libraries** for secure connections
- **Build tools** (gcc, pkg-config, etc.)

## Container Architecture

```
┌─────────────────────────────────────────┐
│               Host System               │
│  ┌─────────────────────────────────────┐│
│  │        Dev Container            │││
│  │  ┌─────────────────────────────┐ │││
│  │  │     Organized AI App        │ │││
│  │  │                             │ │││
│  │  │  React + TypeScript (Frontend) │││
│  │  │  Tauri + Rust (Backend)     │ │││
│  │  │  Claude Max Authentication  │ │││
│  │  │  Education System (SQLite)  │ │││
│  │  └─────────────────────────────┘ │││
│  │                                 │││
│  │  Development Tools:             │││
│  │  • Rust + Cargo                │││
│  │  • Node.js + Bun               │││
│  │  • Tauri CLI                   │││
│  │  • Claude CLI                  │││
│  │  • VS Code Extensions          │││
│  └─────────────────────────────────────┘││
└─────────────────────────────────────────┘│
```

## Ports and Services

| Port | Service | Description |
|------|---------|-------------|
| 1420 | Vite Dev Server | Main application UI |
| 1421 | Vite HMR | Hot module replacement |
| 3000 | Alternative | Backup development port |
| 8080 | Future API | Reserved for routing server |

## Persistent Data

The container uses named volumes for persistence:

- **`organized-agents-claude-config`** - Claude CLI authentication
- **`organized-agents-cargo-cache`** - Rust compilation cache
- **`organized-agents-bun-cache`** - Node.js package cache

This ensures:
- ✅ Authentication persists across container restarts
- ✅ Faster builds with cached dependencies
- ✅ No need to re-download packages

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_MODE` | `claude-max` | Authentication method |
| `RUST_LOG` | `debug` | Rust logging level |
| `TAURI_DEV_HOST` | `0.0.0.0` | Development server host |
| `DEBUG_MODE` | `true` | Enable debug features |

## Development Workflows

### Daily Development

```bash
# Start container (if using Docker Compose)
docker-compose -f .devcontainer/docker-compose.yml up -d

# Connect and develop
docker-compose -f .devcontainer/docker-compose.yml exec organized-agents-dev bash

# Inside container:
bun run tauri:dev    # Desktop app with hot reload
```

### Building for Production

```bash
# Inside container:
bun run build       # Build React frontend
bun run tauri:build # Build desktop binaries
```

### Testing

```bash
# Inside container:
cargo test          # Run Rust tests
bun test           # Run JavaScript tests (if configured)
```

### Authentication

```bash
# Inside container:
claude login       # Login to Claude Max
claude whoami      # Check authentication status
```

## Troubleshooting

### Container Won't Build

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f .devcontainer/docker-compose.yml build --no-cache
```

### VS Code Issues

1. **"Reopen in Container" not showing**
   - Install the "Dev Containers" extension
   - Restart VS Code
   - Open folder containing `.devcontainer/`

2. **Container build fails**
   - Check Docker Desktop is running
   - Ensure you have enough disk space (>5GB)
   - Try building manually: `docker build -f .devcontainer/Dockerfile .`

### Authentication Issues

```bash
# Inside container, if Claude CLI fails:
curl -fsSL https://claude.ai/install.sh | bash
claude login
```

### Port Conflicts

If ports 1420/3000/8080 are in use:

```bash
# Edit .devcontainer/devcontainer.json
# Change "forwardPorts": [1420, 3000, 8080]
# to different ports, then rebuild container
```

## Cross-Platform Compatibility

This dev container works on:

- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Windows** (with Docker Desktop)
- ✅ **Linux** (Ubuntu, Debian, etc.)

### Platform-Specific Notes

**macOS:**
- Requires Docker Desktop
- File watching works correctly
- GPU acceleration available

**Windows:**
- Requires Docker Desktop with WSL2
- File performance may be slower
- Use WSL2 for best experience

**Linux:**
- Native Docker support
- Best performance
- All features available

## Contributing

### Adding New Dependencies

**Rust dependencies:**
```bash
# Inside container:
cd src-tauri
cargo add <dependency>
```

**Node.js dependencies:**
```bash
# Inside container:
bun add <dependency>
```

**System dependencies:**
Edit `.devcontainer/Dockerfile` and rebuild:
```dockerfile
RUN apt-get update && apt-get install -y \
    your-new-package \
    && rm -rf /var/lib/apt/lists/*
```

### Modifying VS Code Settings

Edit `.devcontainer/devcontainer.json`:
```json
{
  "customizations": {
    "vscode": {
      "extensions": ["new-extension-id"],
      "settings": {
        "new.setting": "value"
      }
    }
  }
}
```

## Performance Optimization

### Build Speed
- ✅ Rust compilation cache persisted
- ✅ Node.js packages cached
- ✅ Docker layer caching
- ✅ Multi-stage Dockerfile

### Runtime Performance
- ✅ Native desktop app (not web wrapper)
- ✅ Direct hardware access
- ✅ Optimized for development workflow

### Resource Usage
- **Memory:** ~2-4GB during development
- **Disk:** ~5-8GB for full environment
- **CPU:** Efficient Rust compilation

## Security

### Container Security
- ✅ Non-root user for development
- ✅ Limited file system access
- ✅ No host network access
- ✅ Isolated environment

### Authentication Security
- ✅ Claude Max OAuth flow
- ✅ No API keys stored in container
- ✅ Encrypted authentication tokens
- ✅ Persistent but secure storage

## Support

### Getting Help

1. **Check the logs:**
   ```bash
   docker-compose -f .devcontainer/docker-compose.yml logs
   ```

2. **Test basic functionality:**
   ```bash
   ./setup-devcontainer.sh
   ```

3. **Reset environment:**
   ```bash
   docker-compose -f .devcontainer/docker-compose.yml down -v
   docker-compose -f .devcontainer/docker-compose.yml up -d
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Build timeout | Increase Docker memory limit |
| Port conflicts | Change ports in devcontainer.json |
| Authentication fails | Run `claude login` inside container |
| Slow file watching | Use Docker volumes for node_modules |

---

🎯 **Ready for alpha testing!** This containerized setup ensures consistent, reproducible development across all platforms.