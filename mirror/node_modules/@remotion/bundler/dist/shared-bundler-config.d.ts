export declare const shouldUseReactDomClient: boolean;
export declare const getResolveConfig: () => {
    extensions: string[];
    alias: {
        'react/jsx-runtime': string;
        'react/jsx-dev-runtime': string;
        react: string;
        'remotion/no-react': string;
        'remotion/version': string;
        remotion: string;
        '@remotion/media-parser/worker': string;
        '@remotion/studio': string;
        'react-dom/client': string;
    };
};
export declare const getOutputConfig: (environment: "development" | "production") => {
    hashFunction: "xxhash64";
    filename: string;
    devtoolModuleFilenameTemplate: string;
    assetModuleFilename: string;
};
export declare const getBaseConfig: (environment: "development" | "production", poll: number | null) => {
    optimization: {
        minimize: boolean;
    };
    experiments: {
        lazyCompilation: boolean | {
            entries: boolean;
        };
    };
    watchOptions: {
        poll: number | undefined;
        aggregateTimeout: number;
        ignored: string[];
    };
    devtool: "cheap-module-source-map" | "source-map";
};
export declare const getSharedModuleRules: () => ({
    test: RegExp;
    use: string[];
    type: "javascript/auto";
} | {
    use?: undefined;
    test: RegExp;
    type: "asset/resource";
})[];
export declare const computeHashAndFinalConfig: <T extends {
    output?: any;
}>(conf: T, options: {
    enableCaching: boolean;
    environment: "development" | "production";
    outDir: string | null;
    remotionRoot: string;
}) => [string, T];
