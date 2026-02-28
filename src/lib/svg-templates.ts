/**
 * SVG Templates for video scene fallbacks.
 * When the AI fails to generate an SVG for problem/concept scenes,
 * we auto-inject a relevant template based on keywords in the text.
 */

const TEMPLATES: Record<string, string> = {
    // Array / Sequence visualization
    array: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="100" y="100" width="200" height="60" fill="none" stroke="#ffffff" stroke-width="1.5"/><line x1="150" y1="100" x2="150" y2="160" stroke="#ffffff" stroke-opacity="0.3"/><line x1="200" y1="100" x2="200" y2="160" stroke="#ffffff" stroke-opacity="0.3"/><line x1="250" y1="100" x2="250" y2="160" stroke="#ffffff" stroke-opacity="0.3"/><text x="125" y="138" text-anchor="middle" fill="#10b981" font-size="20" font-family="monospace">a</text><text x="175" y="138" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="20" font-family="monospace">b</text><text x="225" y="138" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="20" font-family="monospace">c</text><text x="275" y="138" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="20" font-family="monospace">d</text></svg>`,

    // Grid / Matrix visualization
    grid: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="100" y="80" width="200" height="140" fill="none" stroke="#ffffff" stroke-width="1.5"/><text x="200" y="65" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="16" font-family="monospace">N</text><text x="85" y="155" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="16" font-family="monospace">M</text></svg>`,

    // Graph / Tree visualization
    graph: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="80" r="16" fill="none" stroke="#3b82f6" stroke-width="2"/><circle cx="140" cy="180" r="16" fill="none" stroke="#ffffff" stroke-width="1.5"/><circle cx="260" cy="180" r="16" fill="none" stroke="#ffffff" stroke-width="1.5"/><line x1="190" y1="92" x2="150" y2="168" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5"/><line x1="210" y1="92" x2="250" y2="168" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5"/><text x="200" y="85" text-anchor="middle" fill="#ffffff" fill-opacity="0.8" font-size="14" font-family="monospace">u</text><text x="140" y="185" text-anchor="middle" fill="#ffffff" fill-opacity="0.8" font-size="14" font-family="monospace">v</text><text x="260" y="185" text-anchor="middle" fill="#ffffff" fill-opacity="0.8" font-size="14" font-family="monospace">w</text></svg>`,

    // Math / DP / Formula visualization
    dp: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="120" y="100" width="160" height="60" fill="none" stroke="#10b981" stroke-width="1.5" rx="6"/><text x="200" y="140" text-anchor="middle" fill="#3b82f6" fill-opacity="0.9" font-size="28" font-family="monospace">f(n)</text><path d="M120 130 C80 130, 80 170, 160 170" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4"/><path d="M152 165 L160 170 L152 175" fill="none" stroke="#10b981" stroke-width="1.5"/></svg>`,

    // Generic / Placeholder visualization
    generic: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="150" r="80" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5"/><circle cx="200" cy="150" r="50" fill="none" stroke="#10b981" stroke-opacity="0.3" stroke-width="1.5"/><circle cx="200" cy="150" r="20" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="2"/><line x1="100" y1="150" x2="170" y2="150" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/><line x1="230" y1="150" x2="300" y2="150" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/><line x1="200" y1="50" x2="200" y2="120" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/><line x1="200" y1="180" x2="200" y2="250" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/></svg>`,
};

const KEYWORD_MAP: [RegExp, string][] = [
    [/\b(array|vector|list|sequence|subarray|sliding|window|two.?pointer|prefix|suffix|sort|bar|element)\b/i, 'array'],
    [/\b(grid|matrix|board|tile|cell|row|col|2d|field|rectangle)\b/i, 'grid'],
    [/\b(graph|tree|node|edge|vertex|dfs|bfs|traversal|path|connect|cycle|root|leaf|linked|adjacent)\b/i, 'graph'],
    [/\b(dp|dynamic|memo|tabul|state|transition|recur|optim|knapsack|subsequence|lcs|lis)\b/i, 'dp'],
    // Arabic keyword equivalents
    [/(\u0645\u0635\u0641\u0648\u0641\u0629|\u0645\u062a\u062c\u0647|\u0639\u0646\u0627\u0635\u0631|\u062a\u0631\u062a\u064a\u0628)/i, 'array'],
    [/(\u0634\u0628\u0643\u0629|\u0645\u0635\u0641\u0648\u0641\u0629 \u062b\u0646\u0627\u0626\u064a\u0629|\u062e\u0644\u064a\u0629|\u0633\u0627\u062d\u0629|\u0628\u0644\u0627\u0637)/i, 'grid'],
    [/(\u0631\u0633\u0645 \u0628\u064a\u0627\u0646\u064a|\u0634\u062c\u0631\u0629|\u0639\u0642\u062f\u0629|\u062d\u0627\u0641\u0629)/i, 'graph'],
];

/**
 * Returns an SVG template based on keywords found in the given text.
 * Falls back to the generic template if no keywords match.
 */
export function getSvgForKeywords(text: string): string {
    for (const [pattern, key] of KEYWORD_MAP) {
        if (pattern.test(text)) {
            return TEMPLATES[key];
        }
    }
    return TEMPLATES.generic;
}
