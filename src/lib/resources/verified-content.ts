
// Curated Source of Truth for Competitive Programming Resources
// Mapped from CP-Algorithms and USACO Guide

export interface ResourceTopic {
    id: string; // key
    title: string;
    description: string;
    articles: Array<{
        title: string;
        url: string; // CP-Algorithms, USACO Guide, or GeeksForGeeks (primary sources)
        source: 'USACO Guide' | 'CP-Algorithms' | 'GeeksForGeeks' | 'Other';
    }>;
    videos: Array<{
        title: string;
        videoId: string; // YouTube Video ID
        channel: string;
    }>;
}

export const SAFE_CHANNELS = [
    'WilliamFiset',
    'Errichto',
    'William Lin',
    'USACO Guide',
    'abdul_bari', // Excellent for algorithms
    'geeksforgeeks',
    'freecodecamp'
];

// Map of normalized topic keys to curated resources
export const VERIFIED_TOPICS: Record<string, ResourceTopic> = {
    // === Graph Theory ===
    'bfs': {
        id: 'bfs',
        title: 'Breadth First Search (BFS)',
        description: 'Algorithm for traversing or searching tree or graph data structures.',
        articles: [
            { title: 'Breadth First Search', url: 'https://cp-algorithms.com/graph/breadth-first-search.html', source: 'CP-Algorithms' },
            { title: 'BFS Introduction', url: 'https://usaco.guide/silver/bfs', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Breadth First Search Algorithm | Shortest Path | Graph Theory', videoId: 'oDqjPvD54Ss', channel: 'WilliamFiset' }
        ]
    },
    'dfs': {
        id: 'dfs',
        title: 'Depth First Search (DFS)',
        description: 'Algorithm for traversing or searching tree or graph data structures.',
        articles: [
            { title: 'Depth First Search', url: 'https://cp-algorithms.com/graph/depth-first-search.html', source: 'CP-Algorithms' },
            { title: 'DFS Introduction', url: 'https://usaco.guide/silver/dfs', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Depth First Search Algorithm | Graph Theory', videoId: '7fujbpJ0LB4', channel: 'WilliamFiset' }
        ]
    },
    'dijkstra': {
        id: 'dijkstra',
        title: 'Dijkstra\'s Algorithm',
        description: 'Shortest path algorithm for graphs with non-negative edge weights.',
        articles: [
            { title: 'Dijkstra Algorithm', url: 'https://cp-algorithms.com/graph/dijkstra.html', source: 'CP-Algorithms' },
            { title: 'Shortest Paths with Non-Negative Edge Weights', url: 'https://usaco.guide/gold/shortest-paths', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Dijkstra\'s Shortest Path Algorithm | Graph Theory', videoId: 'XB4MIexjvY0', channel: 'WilliamFiset' }
        ]
    },
    'dsu': {
        id: 'dsu',
        title: 'Disjoint Set Union (DSU)',
        description: 'Data structure that keeps track of a set of elements partitioned into a number of disjoint (non-overlapping) subsets.',
        articles: [
            { title: 'Disjoint Set Union', url: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html', source: 'CP-Algorithms' },
            { title: 'DSU Introduction', url: 'https://usaco.guide/gold/dsu', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Disjoint Set Union (DSU) / Union Find', videoId: 'wU6udHRIkcc', channel: 'WilliamFiset' }
        ]
    },

    // === Dynamic Programming ===
    'dp_intro': {
        id: 'dp_intro',
        title: 'Dynamic Programming (Introduction)',
        description: 'Method for solving complex problems by breaking them down into simpler subproblems.',
        articles: [
            { title: 'Dynamic Programming', url: 'https://usaco.guide/gold/intro-dp', source: 'USACO Guide' },
            { title: 'DP on CP-Algorithms', url: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html', source: 'CP-Algorithms' }
        ],
        videos: [
            { title: 'Dynamic Programming - Learn to Solve Algorithmic Problems', videoId: 'oBt53YbR9Kk', channel: 'freeCodeCamp' }
        ]
    },
    'knapsack': {
        id: 'knapsack',
        title: 'Knapsack Problem',
        description: 'Classic DP problem: maximize value in a knapsack of limited capacity.',
        articles: [
            { title: 'Knapsack DP', url: 'https://usaco.guide/gold/knapsack', source: 'USACO Guide' }
        ],
        videos: [
            { title: '0/1 Knapsack Problem - Dynamic Programming', videoId: '8LusJS5-AGo', channel: 'Abdul Bari' }
        ]
    },

    // === Math ===
    'gcd': {
        id: 'gcd',
        title: 'Euclidean Algorithm (GCD)',
        description: 'Efficient method for computing the greatest common divisor.',
        articles: [
            { title: 'Euclidean algorithm', url: 'https://cp-algorithms.com/algebra/euclidean-algorithm.html', source: 'CP-Algorithms' }
        ],
        videos: []
    },
    'sieve': {
        id: 'sieve',
        title: 'Sieve of Eratosthenes',
        description: 'Algorithm to find all prime numbers up to a specified integer.',
        articles: [
            { title: 'Sieve of Eratosthenes', url: 'https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html', source: 'CP-Algorithms' }
        ],
        videos: [
            { title: 'Sieve of Eratosthenes Algorithm for Prime Numbers', videoId: 'klcIklsWzrY', channel: 'GeeksForGeeks' }
        ]
    },
    'modular_arithmetic': {
        id: 'modular_arithmetic',
        title: 'Modular Arithmetic',
        description: 'System of arithmetic for integers, where numbers "wrap around".',
        articles: [
            { title: 'Modular Arithmetic', url: 'https://usaco.guide/gold/modular', source: 'USACO Guide' },
            { title: 'Modular Inverse', url: 'https://cp-algorithms.com/algebra/module-inverse.html', source: 'CP-Algorithms' }
        ],
        videos: []
    },

    // === Data Structures ===
    'segment_tree': {
        id: 'segment_tree',
        title: 'Segment Tree',
        description: 'Tree data structure for storing intervals or segments.',
        articles: [
            { title: 'Segment Tree', url: 'https://cp-algorithms.com/data_structures/segment_tree.html', source: 'CP-Algorithms' },
            { title: 'Segment Trees', url: 'https://usaco.guide/gold/segtree', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Segment Tree Range Queries', videoId: 'ZBHKZF5w4YU', channel: 'WilliamFiset' }
        ]
    },
    'fenwick_tree': {
        id: 'fenwick_tree',
        title: 'Fenwick Tree (BIT)',
        description: 'Binary Indexed Tree for efficient update and prefix sum queries.',
        articles: [
            { title: 'Fenwick Tree', url: 'https://cp-algorithms.com/data_structures/fenwick_tree.html', source: 'CP-Algorithms' },
            { title: 'Binary Indexed Tree', url: 'https://usaco.guide/gold/BIT', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Fenwick Tree (Binary Indexed Tree)', videoId: 'v_wj_mOAlig', channel: 'WilliamFiset' }
        ]
    },

    // === General / Introductory ===
    'binary_search': {
        id: 'binary_search',
        title: 'Binary Search',
        description: 'Search algorithm that finds the position of a target value within a sorted array.',
        articles: [
            { title: 'Binary Search', url: 'https://cp-algorithms.com/num_methods/binary_search.html', source: 'CP-Algorithms' },
            { title: 'Binary Search', url: 'https://usaco.guide/silver/binary-search', source: 'USACO Guide' }
        ],
        videos: [
            { title: 'Binary Search Algorithm', videoId: 'P3YID7liBug', channel: 'WilliamFiset' }
        ]
    },
    'two_pointers': {
        id: 'two_pointers',
        title: 'Two Pointers',
        description: 'Technique mostly used for searching pairs in a sorted array.',
        articles: [
            { title: 'Two Pointers', url: 'https://usaco.guide/silver/two-pointers', source: 'USACO Guide' }
        ],
        videos: []
    },
    'greedy': {
        id: 'greedy',
        title: 'Greedy Algorithms',
        description: 'Algorithmic paradigm that follows the problem solving heuristic of making the locally optimal choice.',
        articles: [
            { title: 'Greedy Algorithms', url: 'https://usaco.guide/silver/greedy', source: 'USACO Guide' }
        ],
        videos: []
    }
};

export const normalizeTopic = (topic: string): string | null => {
    const t = topic.toLowerCase().trim();
    if (t.includes('bfs') || t.includes('breadth')) return 'bfs';
    if (t.includes('dfs') || t.includes('depth')) return 'dfs';
    if (t.includes('dijkstra')) return 'dijkstra';
    if (t.includes('dsu') || t.includes('disjoint') || t.includes('union find')) return 'dsu';
    if (t.includes('segment tree')) return 'segment_tree';
    if (t.includes('fenwick') || t.includes('binary indexed')) return 'fenwick_tree';
    if (t.includes('binary search')) return 'binary_search';
    if (t.includes('two pointer')) return 'two_pointers';
    if (t.includes('greedy')) return 'greedy';
    if (t.includes('knapsack')) return 'knapsack';
    if (t.includes('dp') || t.includes('dynamic program')) return 'dp_intro';
    if (t.includes('gcd') || t.includes('euclidean')) return 'gcd';
    if (t.includes('sieve') || t.includes('prime')) return 'sieve';
    if (t.includes('modular') || t.includes('modulo')) return 'modular_arithmetic';
    return null;
};
