import type { WebCodecsController } from '../webcodecs-controller';
export declare const makeTimeoutPromise: ({ label, ms, controller, }: {
    label: () => string;
    ms: number;
    controller: WebCodecsController | null;
}) => {
    timeoutPromise: Promise<void>;
    clear: () => void;
};
