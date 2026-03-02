import React from 'react';
import type { AnyZodObject } from './any-zod-type.js';
import type { StillProps } from './Composition.js';
export declare const Still: <Schema extends AnyZodObject, Props extends Record<string, unknown>>(props: StillProps<Schema, Props>) => React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
