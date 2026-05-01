export interface LogEntry {
    id: number;
    version_short: string;
    category: string;
    date: string;
    title: string;
    subtitle: string;
    description: string;
    highlights?: string[];
}

export const devLogs: LogEntry[] = [
    {
        id: 1,
        version_short: 'v2.2',
        category: 'Platform',
        date: '2026-04-30',
        title: 'University System Launch',
        subtitle: '64 Egyptian universities, rooms, and scoped leaderboards',
        description: 'Verdict now supports all Egyptian universities with .edu.eg email auto-detection. Each university gets its own room with announcements, a scoped leaderboard, and member tracking. The registration flow validates email domains and links users to their university automatically.',
        highlights: [
            'Auto-detect university from 64 .edu.eg email domains',
            'University rooms with announcements and member lists',
            'National vs University scoped leaderboard toggle',
            'Room auto-creation when first user from a university registers',
            'University-vs-university rankings page',
        ],
    },
    {
        id: 2,
        version_short: 'v2.1',
        category: 'Curriculum',
        date: '2026-04-28',
        title: 'Full ICPCHUE Curriculum Port',
        subtitle: '3 levels, 43 sheets, 646 problems from ICPC Assiut',
        description: 'The complete ICPCHUE training curriculum has been ported to Verdict. All Level 0 (Newcomers), Level 1 (Intermediate), and Level 2 (Advanced) sheets with their problems are now available. The problem page renders the full mirror UI with Monaco editor, test runner, and CF submission.',
        highlights: [
            'Ported curriculum_levels, curriculum_sheets, curriculum_problems tables',
            'Inline mirror UI for solving problems (Monaco + Judge0 + CF submit)',
            'Per-sheet and per-problem progress tracking',
            'Visual roadmap page showing all levels and sheets',
        ],
    },
    {
        id: 3,
        version_short: 'v2.0',
        category: 'Security',
        date: '2026-04-25',
        title: 'Cheat Detection & Behavior Tracking',
        subtitle: 'Comprehensive anti-cheating system ported from ICPCHUE',
        description: 'The full behavior tracking system is now active. Every problem-solving session tracks tab switches, paste events, idle time, DevTools detection, and more. Submissions record cheat metrics (tab_switches, paste_events, time_to_solve) for admin review.',
            'Shadow ban system: is_shadow_banned + cheating_flags on users',
            'Judge0 submit records tab_switches, paste_events, time_to_solve_seconds',
    },
    {
        id: 4,
        version_short: 'v1.0',
        category: 'Launch',
        date: '2026-03-01',
        title: 'Verdict Goes Live',
        subtitle: 'Codeforces mirror, AI tutor, and workspace',
        description: 'The initial launch of verdict.run with the core Codeforces mirror, Monaco editor workspace, AI-powered code tutoring via Gemini, Excalidraw whiteboard integration, and the browser extension for submitting to external judges.',
        highlights: [
            'CF Mirror: paste any Codeforces URL and solve in LeetCode-style UI',
            'Monaco editor with multi-language support and custom snippets',
            'Judge0 self-hosted code execution (2 workers)',
            'Gemini AI tutor for code explanations and hints',
            'Excalidraw whiteboard for algorithm visualization',
        ],
    },
];
