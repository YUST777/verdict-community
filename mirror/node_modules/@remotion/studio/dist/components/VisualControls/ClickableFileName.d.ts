import type { OriginalPosition } from '../../error-overlay/react-overlay/utils/get-source-map';
export type OriginalFileNameState = {
    type: 'loaded';
    originalFileName: OriginalPosition;
} | {
    type: 'error';
    error: Error;
} | {
    type: 'loading';
};
export declare const ClickableFileName: ({ originalFileName, }: {
    readonly originalFileName: OriginalFileNameState;
}) => import("react/jsx-runtime").JSX.Element;
