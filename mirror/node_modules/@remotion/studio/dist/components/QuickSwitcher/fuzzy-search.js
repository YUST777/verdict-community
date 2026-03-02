"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuzzySearch = fuzzySearch;
function fuzzySearch(query, dataset) {
    const q = query ? query.trim().toLowerCase() : '';
    const matchingIndices = [];
    if (q.length === 0) {
        for (let i = 0; i < dataset.length; i++) {
            matchingIndices.push(i);
        }
        return dataset.filter((_, i) => matchingIndices.includes(i));
    }
    dataset.forEach((d, index) => {
        const s = d.title.trim().toLowerCase();
        let i = 0;
        let n = -1;
        let l;
        for (; (l = q[i++]);)
            if (!~(n = s.indexOf(l, n + 1)))
                return;
        matchingIndices.push(index);
    });
    return dataset.filter((_, i) => matchingIndices.includes(i));
}
