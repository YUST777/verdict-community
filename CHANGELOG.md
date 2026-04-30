# Changelog

All notable changes to Verdict.run will be documented in this file.

---

## [2.0.1] - 2026-02-20

### 🤖 AI Tutor & UI/UX Improvements

- **Fixed AI Chat UI** — Improved the AI thought process component display to use a new sleek, collapsible `ChainOfThought` UI.
- **Fixed Tutor Chat Spam** — Resolved an issue where AI Tutor would send 15+ messages in a row during explanations. Now updates properly in a single expanding message.

---

## [1.0.1] - 2026-01-22

### 🏗️ Major Refactoring

- **Refactored Problem Page Architecture** — Split the massive 1,200-line `ClientPage.tsx` into 6 modular custom hooks:
  - `useProblemData` — Problem fetching and analytics
  - `useCodePersistence` — Code and language localStorage sync
  - `useCustomTestCases` — User-added test case management
  - `useResizableLayout` — Horizontal panel resizing
  - `useWhiteboardResize` — Whiteboard vertical resizing
  - `useCodeforcesSubmission` — CF submission flow and status polling
  - `useLocalTestRunner` — Judge0 test execution

### ✨ New Features

- **Codeforces Tab** — Added dedicated "Codeforces" tab in the test panel for submission status, verdict tracking, and direct CF links
- **Custom Test Cases** — Users can now add, edit, and delete their own test cases with Zod validation, persisted to localStorage
- **User Submissions** — "My Submissions" now shows only YOUR submissions for the current problem (not all users)
- **Q&A Section** — Added comprehensive FAQ section to the landing page

### 🐛 Bug Fixes

- **Codeforces Submit Logic** — Completely overhauled submission flow for reliable verdict polling via CF API
- **OAuth Google Fix** — Fixed redirect URI from localhost to production domain (thanks to Omar for the issue report!)
- **Navigation Arrows** — Fixed `< >` placement in problem header — now correctly positioned after the problem title
- **Landing Page** — Fixed "Watch Demo" button and mobile hero section video playback issues
- **Responsive Design** — Improved mobile responsiveness across the entire mirror problem interface

### 🔧 Technical Improvements

- **Linter Cleanup** — Fixed **120+ linter errors** including:
  - Removed all `any` types → proper TypeScript types
  - Fixed React hooks dependency arrays
  - Removed unused imports and variables
  - Fixed `@ts-ignore` → `@ts-expect-error` with explanations
  - Proper error handling (`catch (error: unknown)`)

### 🧩 Extension v1.0.3

- **Reduced Permissions** — Removed unnecessary permissions for Chrome Web Store compliance
- **Production Ready** — Removed all localhost references, now targets `verdict.run` only
- **Manifest V3** — Fully compliant with latest Chrome extension standards

### 📦 Other Changes

- Renamed all `icpchue` references to `verdict` across the entire codebase
- Cleaned up TODO/FIXME comments
- Removed unused ESLint disable directives
- Added ESLint ignores for Node.js scripts (`mirror/`, `scripts/`)

---

## [1.0.0] - 2026-01-20

### 🎉 Initial Release

- Codeforces problem mirroring
- Monaco code editor with syntax highlighting
- Local test runner with Judge0
- Codeforces submission via browser extension
- Whiteboard for problem-solving notes
- User authentication (Email, GitHub, Google)
- Training sheets system
- Profile pages with statistics

---

*For more details, visit [verdict.run](https://verdict.run)*

