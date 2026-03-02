import type { Reader } from '../reader';
type ReturnType = {
    reader: Reader;
    contentLength: number | null;
    needsContentRange: boolean;
};
export declare const getLengthAndReader: ({ canLiveWithoutContentLength, res, ownController, requestedWithoutRange, }: {
    canLiveWithoutContentLength: boolean;
    res: Response;
    ownController: AbortController;
    requestedWithoutRange: boolean;
}) => Promise<ReturnType>;
export {};
