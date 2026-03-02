import type { AnyComposition, AnyZodObject } from 'remotion';
export type UpdateDefaultPropsFunction = (currentValues: {
    schema: AnyZodObject | null;
    savedDefaultProps: Record<string, unknown>;
    unsavedDefaultProps: Record<string, unknown>;
}) => Record<string, unknown>;
export declare const calcNewProps: (compositionId: string, defaultProps: UpdateDefaultPropsFunction) => {
    composition: AnyComposition;
    generatedDefaultProps: Record<string, unknown>;
};
