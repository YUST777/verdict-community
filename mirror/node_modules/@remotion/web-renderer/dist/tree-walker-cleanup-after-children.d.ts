export declare const createTreeWalkerCleanupAfterChildren: (treeWalker: TreeWalker) => {
    checkCleanUpAtBeginningOfIteration: () => void;
    addCleanup: (element: Node, cleanupFn: () => void) => void;
    [Symbol.dispose]: () => void;
};
