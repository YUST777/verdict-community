import type { UpdateDefaultPropsFunction } from './helpers/calc-new-props';
export declare const saveDefaultProps: ({ compositionId, defaultProps, }: {
    compositionId: string;
    defaultProps: UpdateDefaultPropsFunction;
}) => Promise<void>;
