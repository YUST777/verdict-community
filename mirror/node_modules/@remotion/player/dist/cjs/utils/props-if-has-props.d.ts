import type { AnyZodObject } from 'remotion';
type InferZodInput<T> = T extends {
    _zod: {
        input: any;
    };
} ? T['_zod']['input'] : T extends {
    _input: any;
} ? T['_input'] : Record<string, unknown>;
export type PropsIfHasProps<Schema extends AnyZodObject, Props> = AnyZodObject extends Schema ? {} extends Props ? {
    inputProps?: InferZodInput<Schema> & Props;
} : {
    inputProps: Props;
} : {} extends Props ? {
    inputProps: InferZodInput<Schema>;
} : {
    inputProps: InferZodInput<Schema> & Props;
};
export {};
