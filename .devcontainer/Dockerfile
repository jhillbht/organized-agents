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
