import { CFProblemData } from '@/components/mirror/shared/types';

export const theatreSquareProblem: CFProblemData = {
    meta: {
        title: "Theatre Square",
        timeLimitMs: 1000,
        memoryLimitMB: 256
    },
    tags: ["math", "geometry"],
    story: "Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters. On the occasion of the city's anniversary, a decision was taken to pave the Square with square granite flagstones. Each flagstone is of the size a × a.\\n\\nWhat is the least number of flagstones needed to pave the Square? It's allowed to cover the surface larger than the Theatre Square, but the Square has to be covered. It's not allowed to break the flagstones. The sides of flagstones should be parallel to the sides of the Square.",
    inputSpec: "The input contains three positive integer numbers in the first line: n, m and a (1 ≤ n, m, a ≤ 10^9).",
    outputSpec: "Write the needed number of flagstones.",
    testCases: [
        { input: "6 6 4", output: "4" }
    ],
    note: ""
};
