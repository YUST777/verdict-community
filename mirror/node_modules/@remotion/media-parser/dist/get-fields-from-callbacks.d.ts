import type { Options, ParseMediaFields } from './fields';
import type { ParseMediaCallbacks } from './options';
export declare const getFieldsFromCallback: <F extends Options<ParseMediaFields>>({ fields, callbacks, }: {
    fields: F;
    callbacks: ParseMediaCallbacks;
}) => Options<ParseMediaFields>;
