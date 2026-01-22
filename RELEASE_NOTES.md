# 🚀 Verdict v1.0.1 Release Notes

> **Release Date:** January 22, 2026  
> **Extension Version:** 1.0.3

---

## 🔥 Highlights

This release brings major architectural improvements, new features, and over **120 bug fixes** to make Verdict.run faster, more reliable, and Chrome Web Store ready.

---

## 🏗️ Architecture Overhaul

Completely refactored the problem page from a monolithic **1,200-line file** into **6 clean, reusable hooks**:

| Hook | Purpose |
|:-----|:--------|
| `useProblemData` | Problem fetching & analytics |
| `useCodePersistence` | Code/language sync to localStorage |
| `useCustomTestCases` | User test case CRUD with Zod validation |
| `useResizableLayout` | Horizontal panel resize logic |
| `useWhiteboardResize` | Whiteboard height controls |
| `useCodeforcesSubmission` | CF submission & verdict polling |

---

## ✨ New Features

### 🎯 Codeforces Tab
New dedicated tab in the test panel showing:
- Real-time submission status
- Verdict with test case details
- Direct link to submission on Codeforces

### ✏️ Custom Test Cases
- Add your own test cases
- Edit and delete with one click
- Validated with Zod schema
- Persisted to localStorage

### 👤 My Submissions
Your submissions tab now shows **only your submissions** for the current problem — no more scrolling through everyone else's attempts.

### ❓ FAQ Section
Added comprehensive Q&A section to the landing page answering common questions.

---

## 🐛 Critical Fixes

| Issue | Fix |
|:------|:----|
| CF submission unreliable | Overhauled to use CF API polling |
| Google OAuth broken | Fixed redirect URI (thanks Omar!) |
| `< >` arrows misplaced | Now correctly after problem title |
| Demo video not playing | Fixed hero section on mobile |
| Wrong submissions shown | API now filters by user handle |

---

## 🧹 Code Quality

**120+ linter errors fixed:**
- ✅ All `any` types replaced with proper TypeScript
- ✅ React hooks dependencies corrected
- ✅ Unused imports/variables removed
- ✅ Proper error handling patterns
- ✅ Clean ESLint config

---

## 🧩 Extension v1.0.3

**Chrome Web Store Ready:**
- Reduced to minimum required permissions
- Removed all localhost references
- Manifest V3 compliant
- Clean, reviewable code

**Permissions:**
- `cookies` — Check CF login
- `scripting` — Submit code
- `tabs` — Create submission tab

---

## 📊 Stats

| Metric | Before | After |
|:-------|:-------|:------|
| ClientPage.tsx lines | 1,200 | 330 |
| Linter errors | 120+ | 0 |
| Extension permissions | 5 | 3 |
| Custom hooks | 0 | 6 |

---

## 🙏 Credits

- **Omar** — OAuth bug report
- **Community** — Feature requests and feedback

---

## 📥 Download

- **Web App:** [verdict.run](https://verdict.run)
- **Extension:** Chrome Web Store (pending review)
- **Source:** [GitHub](https://github.com/YUST777/Verdictfker)

---

*Built with ❤️ for competitive programmers*

