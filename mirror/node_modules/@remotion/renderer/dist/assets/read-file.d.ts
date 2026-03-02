import http from 'node:http';
type NodeRequestAndResponse = {
    request: http.ClientRequest;
    response: http.IncomingMessage;
};
export declare const readFile: (url: string, redirectsSoFar?: number) => Promise<NodeRequestAndResponse>;
export {};
