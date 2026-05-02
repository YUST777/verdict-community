const { curriculum } = require('../src/lib/curriculum');

// Mock data from the DB for user 202
const dbRows = [
    { sheet_id: '1', problem_id: '219158:M' },
    { sheet_id: '1', problem_id: '219158:D' },
    { sheet_id: '9', problem_id: '223206:C' },
    { sheet_id: '6', problem_id: '223205:C' },
    { sheet_id: '9', problem_id: '223206:A' },
    { sheet_id: '3', problem_id: '219432:B' },
    { sheet_id: '3', problem_id: '219432:E' },
    { sheet_id: '5', problem_id: '219856:E' },
    { sheet_id: '1', problem_id: '219158:C' },
    { sheet_id: '1', problem_id: '219158:A' },
    { sheet_id: '1', problem_id: '219158:B' },
];

const progress = {};
for (const level of curriculum) {
    progress[level.slug] = { solved: 0, total: level.totalProblems };
}

const solvedProblems = new Set();
for (const row of dbRows) {
    solvedProblems.add(`verdict:${row.sheet_id}:${row.problem_id}`);
}

const uniqueSolvedByLevel = new Set(); // levelSlug:contestId:problemLetter

for (const solveKey of solvedProblems) {
    const parts = solveKey.split(':'); // source:sheetId:contestId:problemLetter
    const contestId = parts[2];
    const problemLetter = parts[3];

    if (!contestId || !problemLetter) continue;

    for (const level of curriculum) {
        const sheet = level.sheets.find(s => s.contestId === contestId);
        if (sheet) {
            uniqueSolvedByLevel.add(`${level.slug}:${contestId}:${problemLetter}`);
            break;
        }
    }
}

// Count unique problems per level
for (const problemKey of uniqueSolvedByLevel) {
    const levelSlug = problemKey.split(':')[0];
    if (progress[levelSlug]) {
        progress[levelSlug].solved += 1;
    }
}

console.log('Final Progress:', progress);
