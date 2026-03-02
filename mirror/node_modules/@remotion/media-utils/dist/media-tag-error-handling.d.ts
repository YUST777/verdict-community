export declare const onMediaError: ({ error, src, reject, cleanup, api, }: {
    error: MediaError;
    src: string;
    reject: (reason: unknown) => void;
    cleanup: () => void;
    api: string;
}) => void;
