export declare const validOpenGlRenderers: readonly ["swangle", "angle", "egl", "swiftshader", "vulkan", "angle-egl"];
export type OpenGlRenderer = (typeof validOpenGlRenderers)[number];
export declare const DEFAULT_OPENGL_RENDERER: OpenGlRenderer | null;
export declare const getChromiumOpenGlRenderer: () => "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
export declare const setChromiumOpenGlRenderer: (renderer: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan") => void;
export declare const glOption: {
    cliFlag: "gl";
    docLink: string;
    name: string;
    type: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
    ssrName: string;
    description: () => import("react/jsx-runtime").JSX.Element;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan";
        source: string;
    } | {
        value: null;
        source: string;
    };
    setConfig: (value: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null) => void;
    id: "gl";
};
export declare const validateOpenGlRenderer: (option: unknown) => "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
