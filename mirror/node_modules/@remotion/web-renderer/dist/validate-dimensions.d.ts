import type { CanRenderIssue } from './can-render-types';
import type { WebRendererVideoCodec } from './mediabunny-mappings';
export declare const validateDimensions: (options: {
    width: number;
    height: number;
    codec: WebRendererVideoCodec;
}) => CanRenderIssue | null;
