import type { IncomingMessage, ServerResponse } from 'node:http';
export declare const serveHandler: (request: IncomingMessage, response: ServerResponse<IncomingMessage>, config: {
    public: string;
}) => Promise<void>;
