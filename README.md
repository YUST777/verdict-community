<p align="center">
  <a href="https://verdict.run/">
    <img src="public/banner.jpg" alt="Verdict Banner" width="100%">
  </a>
</p>

<div align="center">

# Verdict.run

### The Ultimate Competitive Programming Platform

<br/>


<a href="https://verdict.run"><img src="https://img.shields.io/badge/Website-verdict.run-3b82f6?style=for-the-badge&logoColor=white" alt="Website"></a>
<a href="https://verdict.runhttps://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj"><img src="https://img.shields.io/badge/Extension-Available-10B981?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Extension"></a>
<a href="https://github.com/YUST777/verdict-community/issues"><img src="https://img.shields.io/github/issues/YUST777/verdict-community?style=for-the-badge&logo=github&logoColor=white" alt="Issues"></a>

<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"></a>
<a href="https://github.com/YUST777/verdict-community/discussions"><img src="https://img.shields.io/badge/Community-Discussions-blueviolet?style=for-the-badge&logo=github" alt="Discussions"></a>


</div>

<br/>

<div align="center">
  <a href="https://youtu.be/1_Q3agYkioE">
    <img src="https://img.youtube.com/vi/1_Q3agYkioE/maxresdefault.jpg" alt="Watch Verdict Demo" width="800" style="border-radius: 16px; border: 2px solid #333;">
  </a>
  <br>
  <p><i>👆 Click to watch the demo</i></p>
</div>

<br>

> [!TIP]
> **New!** Mirror Mode allows you to practice Codeforces problems directly on Verdict with a distraction-free IDE, live test case execution, and drawing board support!

---


## Verdict Overview

Verdict is a next-generation competitive programming platform designed to help you solve problems without limits. We provide a seamless, distraction-free environment for practicing, competing, and analyzing algorithms.

**Key Capabilities:**

- **Mirror Mode**: Scrape and solve problems from platforms like Codeforces instantly.
- **Smart IDE**: Integrated Monaco editor with multi-language support and custom snippets.
- **Whiteboard**: Built-in Excalidraw integration for visualizing algorithms.
- **Analytics**: Detailed submission analysis, complexity estimation, and performance tracking.
- **Browser Extension**: Seamlessly submit code from Verdict to external judges.


## Features

### Mirror Mode
Why switch tabs? Bring the problem to you. paste any Codeforces URL into Verdict, and we'll instantly generate a clean, distraction-free workspace with:
- **Parsed problem statements** (MathJax supported)
- **One-click test case import**
- **Live status updates** for submissions

### ⚡ Integrated Environment
- **Multi-language Support**: C++, Python, Java, and more.
- **Custom Compilers**: Configure your own compilation flags.
- **Test Case Manager**: Add, edit, and run custom test cases locally.

### 🧠 Algorithm Visualization
Stuck on a graph problem? Use the built-in collaborative whiteboard to:
- Draw graphs and trees
- Trace algorithms visually
- Save and export your logic diagrams

---

## 🔒 Security & Privacy
Verdict is committed to transparency and security. By open-sourcing our entire platform, we allow the community to audit our code, contribute improvements, and ensure that our tools remain safe, secure, and respectful of user privacy.

## Quick Start

1. **Visit**: [verdict.run](https://verdict.run)
2. **Setup Locally**: Clone this repo and follow our [Installation Guide](docs/INSTALLATION.md) (or see the [Quick Start](#quick-setup)).
3. **Install Extension**: [Download Here](https://verdict.runhttps://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj)

---

## Quick Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/YUST777/verdict-community.git
   cd verdict-community
   pnpm install
   ```
2. **Docker**:
   ```bash
   docker compose up -d --build
   ```

---

## Community & Support
- **Bug Reports**: Found a glitch? [Open an Issue](https://github.com/YUST777/verdict-community/issues/new)
- **Feature Requests**: Have an idea? [Request a Feature](https://github.com/YUST777/verdict-community/issues/new)
- **Discussions**: Join the conversation in [Discussions](https://github.com/YUST777/verdict-community/discussions)

---

## Roadmap

### Jan 18, 2026: Core Platform
**Instant Codeforces mirror**, VS Code + Whiteboard workflow, local judge, and analytics. We solved the 15s tab-switching headache.

### Coming Soon: Multiplayer Rooms
**Real-time collaborative coding rooms.** Send a link to a friend, recruiter, or professor and solve hard problems together on the cloud.

### Future: AI Tutor Agent
**Personalized AI Trainer** that generates multimodel (voice/video) and text explanations. It analyzes your code in real-time to help you solve, innovate new answers, and guide you without giving away the solution.

## Repository Structure
- `/app` - Next.js 16 frontend and API routes.
- `https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj` - Source code of the Verdict Browser Extension.
- `/mirror` - Puppeteer-based Codeforces scraping service.
- `/scripts` - Database and maintenance utilities.

---

## 🤖 AI Agent Developer Experience (DX)
This repository is optimized for AI-first development. AI agents (like Antigravity) can use the following resources to ship code faster:

- **Workflows**: Standard patterns in `.agents/workflows/` for routes and components.
- **Architecture**: A complete system map in [DOCS/architecture.md](DOCS/architecture.md).
- **vcl CLI**: A developer helper at `scripts/vcl` (aliased to `vcl`). Use `vcl help` for commands like `status`, `logs`, and `rebuild`.

---

*Verdict is currently in Beta. We appreciate your feedback!*

## Support the Project

**Love Verdict?** Give us a ⭐ on GitHub! It helps us grow and keep the platform free.

<div align="center">
  <sub>Built with ❤️ by Competitive Programmers, for Competitive Programmers.</sub>
</div>
