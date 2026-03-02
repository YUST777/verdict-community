import type { WebCodecsController } from './webcodecs-controller';
export declare const videoFrameSorter: ({ controller, onOutput, }: {
    controller: WebCodecsController;
    onOutput: (frame: VideoFrame) => Promise<void>;
}) => {
    inputFrame: (frame: VideoFrame) => void;
    waitUntilProcessed: () => Promise<void>;
    flush: () => Promise<void>;
};
