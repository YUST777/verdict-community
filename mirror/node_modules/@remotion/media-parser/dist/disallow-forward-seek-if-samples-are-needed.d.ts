import type { AllOptions, ParseMediaFields } from './fields';
export declare const disallowForwardSeekIfSamplesAreNeeded: ({ seekTo, previousPosition, fields, }: {
    fields: Partial<AllOptions<ParseMediaFields>>;
    seekTo: number;
    previousPosition: number;
}) => void;
