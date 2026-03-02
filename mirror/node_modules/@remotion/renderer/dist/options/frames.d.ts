import type { FrameRange } from '../frame-range';
export declare const framesOption: {
    name: string;
    cliFlag: "frames";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "frameRange";
    docLink: string;
    type: FrameRange | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: FrameRange | null;
    };
    setConfig: (value: FrameRange | null) => void;
    id: "frames";
};
