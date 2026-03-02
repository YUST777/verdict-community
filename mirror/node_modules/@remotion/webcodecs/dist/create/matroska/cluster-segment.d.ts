export declare const CLUSTER_MIN_VINT_WIDTH = 8;
export declare const createClusterSegment: (timestamp: number) => import("./matroska-utils").BytesAndOffset;
export declare const makeSimpleBlock: ({ bytes, trackNumber, timecodeRelativeToCluster, keyframe, invisible, lacing, }: {
    bytes: Uint8Array<ArrayBufferLike>;
    trackNumber: number;
    timecodeRelativeToCluster: number;
    keyframe: boolean;
    invisible: boolean;
    lacing: number;
}) => Uint8Array<ArrayBufferLike>;
