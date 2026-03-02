import type { SymbolicatedStackFrame } from '@remotion/studio-shared';
import type { OriginalPosition } from '../error-overlay/react-overlay/utils/get-source-map';
export declare const openInEditor: (stack: SymbolicatedStackFrame) => Promise<Response>;
export declare const openOriginalPositionInEditor: (originalPosition: OriginalPosition) => Promise<void>;
