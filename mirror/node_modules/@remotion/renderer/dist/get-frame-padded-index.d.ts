export type CountType = 'from-zero' | 'actual-frames';
export declare const getFrameOutputFileNameFromPattern: ({ pattern, frame, ext, }: {
    pattern: string;
    frame: string;
    ext: string;
}) => string;
export declare const getFrameOutputFileName: ({ index, frame, imageFormat, countType, lastFrame, totalFrames, imageSequencePattern, }: {
    index: number;
    frame: number;
    imageFormat: "jpeg" | "none" | "png";
    countType: CountType;
    lastFrame: number;
    totalFrames: number;
    imageSequencePattern: string | null;
}) => string;
export declare const getFilePadLength: ({ lastFrame, totalFrames, countType, }: {
    lastFrame: number;
    totalFrames: number;
    countType: CountType;
}) => number;
