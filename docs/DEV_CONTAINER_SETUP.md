# Dev Containers & Deployment Strategy for Organized Agents

## 🎯 Strategic Benefits for Your Project

### **Why Dev Containers Are Perfect for Organized Agents:**
- **Cross-platform builds** without platform-specific setup pain
- **Consistent environments** for all contributors (zero "works on my machine")
- **CI/CD pipeline** standardization for releases
- **Dependency isolation** (Rust, Node.js, Tauri, system libraries)
- **Alpha testing** distribution through containerized builds

---

## 📦 Container Strategy Options

### **Option 1: Full Development Environment** 
*Best for: Team development, consistent builds, CI/CD*

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/rust:1-1-bullseye

# Install Node.js and Bun
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    curl -fsSL https://bun.sh/install | bash

# Install Tauri dependencies
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    pkg-config

# Add Bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Install Tauri CLI
RUN cargo install tauri-cli

WORKDIR /workspace
```

### **Option 2: Multi-Stage Build for Distribution**
*Best for: Automated releases, cross-platform binaries*

```dockerfile
# Dockerfile.build
FROM rust:1.70-slim as rust-builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

FROM node:18-slim as node-builder

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY package*.json ./
RUN bun install

COPY . .
RUN bun run build

FROM rust-builder as final-builder

# Install Tauri CLI
RUN cargo install tauri-cli

WORKDIR /app
COPY . .
COPY --from=node-builder /app/dist ./dist

# Build the Tauri app
RUN cargo tauri build

# Extract binaries
FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=final-builder /app/src-tauri/target/release/bundle /releases
```

### **Option 3: Hybrid Web + Desktop Development**
*Best for: Rapid prototyping, web preview, desktop builds*

```dockerfile
# .devcontainer/web-dev.Dockerfile
FROM node:18-bullseye

# Install development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    build-essential

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install Rust (for optional desktop builds)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /workspace

# Expose development ports
EXPOSE 1420 3000 8080

CMD ["bun", "run", "dev"]
```

---

## 🛠️ Dev Container Configurations

### **.devcontainer/devcontainer.json**
```json
{
  "name": "Organized Agents Development",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "forwardPorts": [1420, 3000, 8080],
  "postCreateCommand": "bun install && cargo build",
  "customizations": {
    "vscode": {
      "extensions": [
        "rust-lang.rust-analyzer",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "tauri-apps.tauri-vscode"
      ],
      "settings": {
        "rust-analyzer.checkOnSave.command": "clippy",
        "editor.formatOnSave": true
      }
    }
  },
  "mounts": [
    "source=${localWorkspaceFolder}/.env,target=/workspace/.env,type=bind,consistency=cached"
  ]
}
```

### **Docker Compose for Full Stack Development**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  organized-agents-dev:
    build:
      context: .
      dockerfile: .devcontainer/Dockerfile
    volumes:
      - .:/workspace:cached
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "1420:1420"  # Vite dev server
      - "3000:3000"  # Alternative port
      - "8080:8080"  # API server (if added)
    environment:
      - AUTH_MODE=claude-max
      - DEBUG_MODE=true
    command: bun run dev
    
  # Optional: Backend API service (for future routing server)
  routing-api:
    build:
      context: ./routing-server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
    depends_on:
      - organized-agents-dev
```

---

## 🚀 Deployment Strategies

### **1. GitHub Actions CI/CD Pipeline**
```yaml
# .github/workflows/build-and-release.yml
name: Build and Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-desktop:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Dev Container
        run: |
          docker build -t organized-agents-builder .devcontainer/
          
      - name: Build in Container
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            organized-agents-builder \
            /bin/bash -c "cd /workspace && bun install && cargo tauri build"
            
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: organized-agents-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

### **2. Containerized Build Pipeline**
```bash
#!/bin/bash
# scripts/build-all-platforms.sh

# Build for Linux (AppImage)
docker run --rm \
  -v $(pwd):/workspace \
  organized-agents-builder:latest \
  cargo tauri build --target x86_64-unknown-linux-gnu

# Build for Windows (MSI) - requires cross-compilation setup
docker run --rm \
  -v $(pwd):/workspace \
  organized-agents-builder:windows \
  cargo tauri build --target x86_64-pc-windows-msvc

# Build for macOS (DMG) - requires macOS runner
docker run --rm \
  -v $(pwd):/workspace \
  organized-agents-builder:macos \
  cargo tauri build --target x86_64-apple-darwin
```

### **3. Web Deployment (React Frontend Only)**
```dockerfile
# Dockerfile.web
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🎯 Practical Implementation Plan

### **Phase 1: Quick Setup (30 minutes)**
```bash
# 1. Create dev container structure
mkdir -p .devcontainer
cd .devcontainer

# 2. Create basic Dockerfile for development
# (Use Option 1 Dockerfile above)

# 3. Add devcontainer.json
# (Use the configuration above)

# 4. Test locally
cd ..
code .  # Opens in VS Code with dev container
```

### **Phase 2: Build Pipeline (1 hour)**
```bash
# 1. Add GitHub Actions workflow
mkdir -p .github/workflows

# 2. Create build scripts
mkdir -p scripts

# 3. Test multi-platform builds
./scripts/build-all-platforms.sh

# 4. Set up automated releases
```

### **Phase 3: Distribution Strategy (2 hours)**
```bash
# 1. Set up container registry (GitHub Container Registry)
# 2. Create automated build triggers
# 3. Add alpha testing distribution
# 4. Set up crash reporting and analytics
```

---

## 🔥 Alpha Testing Distribution Benefits

### **With Dev Containers:**
✅ **One-Click Setup**: `git clone && code .` → full development environment  
✅ **Consistent Builds**: Same binary output regardless of developer machine  
✅ **Easy Alpha Distribution**: Automated builds for Windows/macOS/Linux  
✅ **Cross-Platform Testing**: Test on all platforms without owning all systems  
✅ **Contributor Onboarding**: Zero setup friction for new developers  

### **Container-Based Alpha Testing:**
```bash
# Alpha testers can try instantly:
docker run -p 1420:1420 ghcr.io/jhillbht/organized-agents:alpha

# Or download platform-specific binaries from automated builds
curl -L https://github.com/jhillbht/organized-agents/releases/download/v0.1.0-alpha/organized-agents-macos.dmg
```

---

## 🚀 Immediate Action Items

### **Start Here (15 minutes):**
1. **Create `.devcontainer/` folder** with Dockerfile and devcontainer.json
2. **Test locally** by opening project in VS Code
3. **Verify** that `bun run dev` works in container
4. **Document** setup for alpha testers

### **Next Steps (1 hour):**
1. **Add GitHub Actions** for automated builds
2. **Test cross-platform** compilation
3. **Create release workflow** for alpha distribution
4. **Set up crash reporting** for alpha feedback

**Ready to containerize your alpha testing pipeline?** This will solve your "does it even work" concern by ensuring consistent builds and easy distribution to alpha testers!
