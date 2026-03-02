import type { AllOptions, Options, ParseMediaFields } from '../fields';
export declare const fieldsNeedSamplesMap: Record<keyof Options<ParseMediaFields>, boolean>;
export declare const needsToIterateOverSamples: ({ fields, emittedFields, }: {
    fields: Options<ParseMediaFields>;
    emittedFields: AllOptions<ParseMediaFields>;
}) => boolean;
export declare const needsToIterateOverEverySample: ({ fields, emittedFields, }: {
    fields: Options<ParseMediaFields>;
    emittedFields: AllOptions<ParseMediaFields>;
}) => boolean;
