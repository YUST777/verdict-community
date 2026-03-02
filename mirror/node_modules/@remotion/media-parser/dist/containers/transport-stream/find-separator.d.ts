export type FindNthSubarrayIndexNotFound = {
    type: 'not-found';
    index: number;
    count: number;
};
type ReturnType = {
    type: 'found';
    index: number;
} | FindNthSubarrayIndexNotFound;
export declare function findNthSubarrayIndex({ array, subarray, n, startIndex, startCount, }: {
    array: Uint8Array;
    subarray: Uint8Array;
    n: number;
    startIndex: number;
    startCount: number;
}): ReturnType;
export {};
