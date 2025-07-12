# Organized AI 🤝🤖

**The world's first comprehensive parallel agentic development system**

> ⚠️ **ALPHA SOFTWARE**: This is alpha software under active development. Expect bugs and breaking changes.

Organized AI is a powerful desktop application that transforms how you coordinate AI agents for accelerated development. Built with Tauri 2 and featuring a beautiful React frontend, it provides your command center for managing multiple AI agents, creating sophisticated workflows, and mastering parallel development coordination.

![Organized AI Logo](src-tauri/icons/icon.png)

## 🚀 Quickstart

> ⚠️ **IMPORTANT**: This is alpha software. For the most reliable experience, use the manual installation steps below.

### Prerequisites
- **Node.js** 18+ or **Bun** (recommended)
- **Rust** 1.70+ (install from [rustup.rs](https://rustup.rs))
- **Git**

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/Organized-AI/organized-agents.git
cd organized-agents

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (see Environment Setup below)

# 3. Install dependencies
bun install  # or npm install

# 4. Build and run
bun run tauri dev  # Development mode
```

### Environment Setup

Organized AI supports two authentication methods:

#### Option 1: Claude Max Plan (Recommended - No API Key Needed!)

If you have a Claude Max subscription, you can use it directly:

```bash
# Edit .env and set:
AUTH_MODE=claude-max
```

**Requirements:**
- Claude Code CLI installed from [claude.ai/download](https://claude.ai/download)
- Active Claude Max subscription
- One-time login via browser when prompted

#### Option 2: API Key Authentication

For API-based access:

```bash
# Edit .env and set:
AUTH_MODE=api-key

# Then add your API keys:
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional for additional features:
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here
```

**Getting API Keys:**
- Anthropic: [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)  
- Google: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Troubleshooting

**Build Issues:**
- If build hangs, try: `rm -rf node_modules && bun install`
- For Rust compilation errors: `cargo clean` in `src-tauri/`
- Check system requirements: Node.js 18+, Rust 1.70+

**Runtime Issues:**
- Missing API keys: Check your `.env` file
- Permission errors: Ensure proper file permissions
- Port conflicts: Default port is 1420 (configurable in vite.config.ts)

## 🌟 What Makes Organized AI Special

Organized AI comes pre-loaded with **12 sophisticated development agents** designed for enterprise-grade parallel coordination:

### 🎯 Core Mastery Agents
- **Codebase Mastery Agent** - Deep codebase understanding and navigation
- **Debug Mastery Agent** - Advanced debugging and error resolution
- **Environmental Mastery Agent** - Development environment optimization
- **Testing Revolution Agent** - Comprehensive testing strategies
- **Documentation Revolution Agent** - Automated documentation generation

### 🤝 Coordination Agents  
- **Parallel Planning Agent** - Multi-agent project orchestration
- **Connection Mastery Agent** - Inter-agent communication optimization
- **Gemini Orchestrator Agent** - Claude Code + Gemini CLI coordination
- **Review Mastery Agent** - Code review and quality assurance

### 🛠️ Utility Agents
- **Git Commit Bot** - Automated version control
- **Security Scanner** - Security analysis and vulnerability detection  
- **Unit Tests Bot** - Automated test generation

## 🎓 Progressive Learning System

Organized AI features a progressive learning system where each session unlocks after completing the previous one:

### Foundation Path
1. **Single Agent Basics** - Master working with one agent
2. **Agent Configuration** - Customize agent behavior
3. **Basic Workflows** - Create your first automated workflows
4. **Environment Setup** - Optimize your development environment

### Coordination Path
5. **Pair Programming** - Coordinate two agents effectively
6. **Handoff Patterns** - Master agent-to-agent handoffs
7. **Parallel Tasks** - Run multiple agents simultaneously
8. **Error Recovery** - Handle failures gracefully

### Advanced Path
9. **Multi-Agent Projects** - Orchestrate 3+ agents
10. **Complex Workflows** - Build sophisticated pipelines
11. **Performance Optimization** - Scale your workflows
12. **Production Patterns** - Deploy agent systems

### Mastery Path
13. **Custom Agent Creation** - Build your own agents
14. **Advanced Orchestration** - Enterprise-grade coordination
15. **System Integration** - Connect with external tools
16. **Community Contribution** - Share your expertise

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Authentication Mode
AUTH_MODE=claude-max  # or 'api-key'

# API Keys (only needed if AUTH_MODE=api-key)
ANTHROPIC_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key

# Paths
ORGANIZED_AI_DATA_DIR=~/.organized-ai
```

### Agent Configuration

Agents are configured via JSON files in the `cc_agents/` directory:

```json
{
  "name": "My Custom Agent",
  "description": "Description of what this agent does",
  "system_prompt": "Your agent's system prompt here",
  "model": "claude-sonnet",
  "tools": ["filesystem", "terminal", "browser"],
  "tags": ["development", "automation"]
}
```

## 🛠️ Troubleshooting

### Common Issues

**Build fails with Rust errors**
```bash
# Update Rust
rustup update stable
rustup default stable
```

**Bun command not found**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

**Claude Code integration not working**
- Ensure Claude Code CLI is installed and in your PATH
- Check that `~/.claude/` directory exists
- Verify API keys are correctly set

**Application won't start**
1. Check logs in: `~/.organized-ai/logs/`
2. Verify all dependencies are installed
3. Try clearing cache: `rm -rf node_modules && bun install`

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/Organized-AI/organized-agents/issues)
- **Community**: [Discord](https://discord.gg/organized-ai)
- **Documentation**: [Wiki](https://github.com/Organized-AI/organized-agents/wiki)

## 🚨 Known Issues (Alpha)

- **Plan Mode**: Currently in development, not fully functional
- **Windows**: Some path handling issues on Windows
- **Performance**: Large agent workflows may experience lag
- **Auto-updater**: Not yet implemented
- **Signing**: App is not code-signed (macOS will show security warning)

## 🤝 Contributing

We welcome contributions! Areas where we need help:

- 🐛 Bug fixes and issue resolution
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- 🤖 New agent templates
- 🧪 Test coverage
- 🌐 Internationalization

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

AGPL-3.0 License - see [LICENSE](LICENSE) for details.

## 🌐 Links

- **Website**: [organizedai.vip](https://organizedai.vip)
- **GitHub**: [Organized-AI/organized-agents](https://github.com/Organized-AI/organized-agents)
- **Events**: [lu.ma/Organizedai](https://lu.ma/Organizedai)

---

**Built with ❤️ by BHT Labs / Organized AI**

*Transforming development through intelligent agent coordination*