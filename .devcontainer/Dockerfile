# Organized Agents Development Container
# Multi-stage optimized container for Rust + Node.js + Tauri development

FROM mcr.microsoft.com/devcontainers/rust:1-1-bullseye as base

# Install system dependencies for Tauri
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    build-essential \
    pkg-config \
    curl \
    wget \
    git \
    vim \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install npm (included with Node.js)
# Bun package manager (optional alternative)
RUN curl -fsSL https://bun.sh/install | bash || echo "Bun install failed, using npm"
ENV PATH="/root/.bun/bin:${PATH}"

# Install Tauri CLI globally
RUN cargo install tauri-cli --version ^2.0

# Create workspace directory
WORKDIR /workspace

# Install Claude Code CLI for authentication
RUN curl -fsSL https://claude.ai/install.sh | bash || \
    echo "Claude CLI installation deferred to runtime"

# Expose development ports
# 1420: Vite dev server (main app)
# 1421: Vite HMR websocket
# 3000: Alternative development port
# 8080: Future API server
EXPOSE 1420 1421 3000 8080

# Set up development environment
ENV RUST_LOG=debug
ENV TAURI_DEV_HOST=0.0.0.0

# Create helpful aliases and functions
RUN echo 'alias ll="ls -la"' >> /root/.bashrc && \
    echo 'alias la="ls -la"' >> /root/.bashrc && \
    echo 'alias ..="cd .."' >> /root/.bashrc && \
    echo 'alias dev="npm run dev"' >> /root/.bashrc && \
    echo 'alias tauri-dev="npm run tauri:dev"' >> /root/.bashrc && \
    echo 'alias tauri-build="npm run tauri:build"' >> /root/.bashrc

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "🚀 Organized Agents Development Container"\n\
echo "========================================"\n\
echo ""\n\
echo "📦 Environment:"\n\
echo "  • Rust:      $(rustc --version)"\n\
echo "  • Node.js:   $(node --version)"\n\
echo "  • Bun:       $(bun --version)"\n\
echo "  • Tauri CLI: $(cargo tauri --version 2>/dev/null || echo \"Installing...\")"\n\
echo ""\n\
echo "🔧 Quick Commands:"\n\
echo "  • npm install           - Install dependencies"\n\
echo "  • npm run dev           - Start web dev server (port 1420)"\n\
echo "  • npm run tauri:dev     - Start desktop app"\n\
echo "  • npm run build         - Build for production"\n\
echo "  • npm run tauri:build   - Build desktop app"\n\
echo ""\n\
echo "🔐 Authentication:"\n\
echo "  • claude login          - Login to Claude Max"\n\
echo "  • claude whoami         - Check auth status"\n\
echo ""\n\
\n\
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then\n\
    echo "⚠️  Run: npm install"\n\
fi\n\
\n\
if command -v claude >/dev/null 2>&1; then\n\
    if claude whoami >/dev/null 2>&1; then\n\
        echo "✅ Claude authenticated: $(claude whoami)"\n\
    else\n\
        echo "⚠️  Run: claude login"\n\
    fi\n\
fi\n\
\n\
exec "$@"' > /usr/local/bin/dev-entrypoint.sh && \
    chmod +x /usr/local/bin/dev-entrypoint.sh

SHELL ["/bin/bash", "-c"]
ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
CMD ["bash"]
