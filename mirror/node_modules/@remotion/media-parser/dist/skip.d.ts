export type Skip = {
    action: 'skip';
    skipTo: number;
};
export declare const makeSkip: (skipTo: number) => Skip;
export type FetchMoreData = {
    action: 'fetch-more-data';
    bytesNeeded: number;
};
export declare const makeFetchMoreData: (bytesNeeded: number) => FetchMoreData;
