import type { Options, ParseMediaFields } from './fields';
import type { ParseMediaOptions, ParseMediaResult } from './options';
export declare const parseMediaOnWorkerImplementation: <F extends Options<ParseMediaFields>>({ controller, reader, ...params }: ParseMediaOptions<F>, worker: Worker, apiName: string) => Promise<ParseMediaResult<F>>;
