export type FrameRange = number | [number, number] | [number, null];
export declare const getRealFrameRange: (durationInFrames: number, frameRange: FrameRange | null) => [number, number];
