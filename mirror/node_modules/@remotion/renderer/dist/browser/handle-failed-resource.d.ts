import type { LoadingFailedEvent, ResponseReceivedExtraInfoEvent } from './devtools-types';
import type { HTTPRequest } from './HTTPRequest';
export declare const handleFailedResource: ({ extraInfo, logLevel, indent, request, event, }: {
    extraInfo: ResponseReceivedExtraInfoEvent[];
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    request: HTTPRequest;
    event: LoadingFailedEvent;
}) => void;
