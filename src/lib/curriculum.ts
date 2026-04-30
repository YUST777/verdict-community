/**
 * Static curriculum data ported from ICPCHUE.
 * Used as the source of truth for levels, sheets, and problem letters.
 * The DB stores user progress; this file defines the content.
 */

export interface Sheet {
    id: string;
    name: string;
    title: string;
    description: string;
    contestId: string;
    groupId: string;
    problems: string[];
}

export interface Level {
    id: string;
    slug: string;
    name: string;
    title: string;
    description: string;
    durationWeeks: number;
    image: string;
    totalProblems: number;
    sheets: Sheet[];
}

const LETTERS_26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTERS_15 = 'ABCDEFGHIJKLMNO'.split('');

export const curriculum: Level[] = [
    {
        id: 'level0',
        slug: 'level-0',
        name: 'Level 0',
        title: 'Newcomers Training',
        description: 'Start here if you\'re new to programming. Learn C++ basics, problem solving fundamentals, and build your foundation.',
        durationWeeks: 6,
        image: '/images/lessons/levels/0.webp',
        totalProblems: 249,
        sheets: [
            { id: 'sheet-a', name: 'Sheet A', title: 'Data Types & Conditions', description: 'Learn how to store data in variables, work with different data types, and make decisions using if-else statements.', contestId: '219158', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-b', name: 'Sheet B', title: 'Loops', description: 'Master the art of repetition! Learn how to execute code multiple times using different loop structures.', contestId: '219432', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-c', name: 'Sheet C', title: 'Arrays', description: 'Store and manipulate collections of data efficiently using arrays.', contestId: '219774', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-d', name: 'Sheet D', title: 'Strings', description: 'Work with text data — one of the most common data types in programming.', contestId: '219856', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-e', name: 'Sheet E', title: 'Functions', description: 'Write reusable, organized, and modular code using functions.', contestId: '223205', groupId: 'MWSDmqGsZm', problems: LETTERS_15 },
            { id: 'sheet-f', name: 'Sheet F', title: 'Math & Geometry', description: 'Essential mathematics and geometry for competitive programming.', contestId: '223338', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-g', name: 'Sheet G', title: 'Recursion', description: 'Learn the powerful technique of solving problems by breaking them into smaller subproblems.', contestId: '223339', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-h', name: 'Sheet H', title: 'General Easy', description: 'Practice with 800–1000 rated Codeforces problems.', contestId: '223206', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-i', name: 'Sheet I', title: 'General Medium', description: 'Practice with 1000–1200 rated Codeforces problems.', contestId: '223207', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
            { id: 'sheet-j', name: 'Sheet J', title: 'General Hard', description: 'Practice with 1200–1400 rated Codeforces problems.', contestId: '223340', groupId: 'MWSDmqGsZm', problems: LETTERS_26 },
        ],
    },
    {
        id: 'level1',
        slug: 'level-1',
        name: 'Level 1',
        title: 'Intermediate Training',
        description: 'Master STL, algorithms, and intermediate data structures. Build the skills needed for competitive contests.',
        durationWeeks: 8,
        image: '/images/lessons/levels/1.webp',
        totalProblems: 226,
        sheets: [
            { id: 'sheet-a', name: 'Sheet A', title: 'Time Complexity & Vectors', description: 'Learn algorithm efficiency, vectors, prefix sum, and frequency arrays.', contestId: '372026', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-b', name: 'Sheet B', title: 'STL Containers', description: 'Master Pair, Tuple, Vector, Set, Map, and unordered containers.', contestId: '373244', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-c', name: 'Sheet C', title: 'STL & Sorting', description: 'Stack, Queue, Priority Queue, Deque, and custom comparators.', contestId: '374321', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-d', name: 'Sheet D', title: 'Binary Search & Two Pointers', description: 'The most important algorithm in competitive programming!', contestId: '376466', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-e', name: 'Sheet E', title: 'Bitmask', description: 'Unlock the power of bit manipulation!', contestId: '377898', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-f', name: 'Sheet F', title: 'Number Theory Basics', description: 'Essential mathematics for competitive programming.', contestId: '379012', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-g', name: 'Sheet G', title: 'Prefix Sum & Frequency Array', description: 'Essential techniques for range queries and counting.', contestId: '380145', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
            { id: 'sheet-h', name: 'Sheet H', title: 'Two Pointers & Sliding Window', description: 'Elegant O(n) solutions for array problems.', contestId: '381278', groupId: '3nQaj5GMG5', problems: LETTERS_26 },
        ],
    },
    {
        id: 'level2',
        slug: 'level-2',
        name: 'Level 2',
        title: 'Advanced Training',
        description: 'Graphs, Dynamic Programming, and advanced problem-solving techniques. Prepare for regional and international competitions.',
        durationWeeks: 10,
        image: '/images/lessons/levels/2.webp',
        totalProblems: 171,
        sheets: [],
    },
];

export function getLevel(levelId: string): Level | undefined {
    return curriculum.find(l => l.id === levelId || l.slug === levelId);
}

export function getSheet(levelId: string, sheetId: string): Sheet | undefined {
    const level = getLevel(levelId);
    return level?.sheets.find(s => s.id === sheetId);
}

export function getProblemUrl(sheet: Sheet, problemLetter: string): string {
    return `https://codeforces.com/group/${sheet.groupId}/contest/${sheet.contestId}/problem/${problemLetter}`;
}
