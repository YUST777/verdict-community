# Contributing to Verdict.run

Thank you for your interest in contributing to Verdict! This guide will help you get started with development and contributing to our vision of the ultimate competitive programming platform.

## Development Setup

### Prerequisites

- **Node.js**: v20 or higher
- **Docker & Docker Compose**: Installed and running
- **pnpm**: (Recommended) or npm/yarn
- **Git**

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YUST777/verdict-community.git
   cd verdict-community
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and fill in your Supabase and Judge0 credentials.*

4. **Launch the Stack** (Docker is recommended for full functionality)
   ```bash
   docker compose up -d --build
   ```

5. **Run Frontend in Dev Mode**
   ```bash
   pnpm dev
   ```

## Roadmap Contributions

We are actively looking for contributors to help us achieve our [Roadmap](README.md#-roadmap) goals. If you are interested in any of the following, please reach out!

- **Multiplayer Rooms**: WebSocket-based collaborative coding environments.
- **AI Tutor Agent**: Multimodal (voice/video) AI integrations for adaptive learning.
- **Mirror Optimizations**: Expanding support for platforms beyond Codeforces.

## Contributing Code

### Pull Request Process

1. **Create an issue first** - Describe the problem or feature idea.
2. **Fork and branch** - Work from your own fork on a descriptive branch name.
3. **Make your changes** - Follow the existing codebase style and patterns.
4. **Push to your fork** and submit a Pull Request against our `main` branch.

### PR Guidelines

- **Keep it focused** - One feature or fix per PR is best.
- **Update documentation** - If you've added or changed features, update the README or relevant docs.
- **Pass all checks** - Ensure your code builds locally before submitting.

## Reporting Issues

When reporting bugs, please include:
- Your Browser and OS
- Steps to reproduce the issue
- Expected vs actual behavior
- Any relevant logs from the browser console or Docker containers

## Feature Requests

We love hearing your ideas! When requesting a feature:
- Check existing issues to see if it's already been requested.
- Explain the use case and how it benefits competitive programmers.

## Community & Recognition

- **Telegram**: [Join our community](https://t.me/verdict_run_chat) (@verdict_run_chat)
- **Issues**: [GitHub Issues](https://github.com/YUST777/verdict-community/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YUST777/verdict-community/discussions)

**Recognition**: All contributors who have a PR merged will be credited in our future release notes and added to our contributors list on the website.

---

**Questions?** Reach out on [Telegram](https://t.me/verdict_run_chat) or create a post in [Discussions](https://github.com/YUST777/verdict-community/discussions). We're happy to help you get started!
