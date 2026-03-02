import type { CodecOrUndefined } from '../codec';
export declare const getOutputCodecOrUndefined: () => CodecOrUndefined;
export declare const videoCodecOption: {
    name: string;
    cliFlag: "codec";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: string;
    docLink: string;
    type: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }, { compositionCodec, configFile, downloadName, outName, uiCodec, }: {
        outName: string | null;
        downloadName: string | null;
        configFile: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
        uiCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
        compositionCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
    }) => {
        value: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        source: string;
    };
    setConfig: (newCodec: CodecOrUndefined) => void;
    id: "codec";
};
