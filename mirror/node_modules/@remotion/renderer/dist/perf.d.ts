type PerfId = 'capture' | 'extract-frame' | 'piping';
export declare const startPerfMeasure: (marker: PerfId) => number;
export declare const stopPerfMeasure: (id: number) => void;
export declare const getPerf: () => string[];
export {};
