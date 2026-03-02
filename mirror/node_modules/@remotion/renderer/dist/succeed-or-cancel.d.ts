import { type CancelSignal } from './make-cancel-signal';
export declare const succeedOrCancel: <T>({ happyPath, cancelSignal, cancelMessage, }: {
    happyPath: Promise<T>;
    cancelSignal: CancelSignal | undefined;
    cancelMessage: string;
}) => Promise<T>;
