"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHashAndFinalConfig = exports.getSharedModuleRules = exports.getBaseConfig = exports.getOutputConfig = exports.getResolveConfig = exports.shouldUseReactDomClient = void 0;
const node_crypto_1 = require("node:crypto");
const node_path_1 = __importDefault(require("node:path"));
const react_dom_1 = __importDefault(require("react-dom"));
const no_react_1 = require("remotion/no-react");
const stringify_with_circular_references_1 = require("./stringify-with-circular-references");
const webpack_cache_1 = require("./webpack-cache");
if (!(react_dom_1.default === null || react_dom_1.default === void 0 ? void 0 : react_dom_1.default.version)) {
    throw new Error('Could not find "react-dom" package. Did you install it?');
}
const reactDomVersion = react_dom_1.default.version.split('.')[0];
if (reactDomVersion === '0') {
    throw new Error(`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`);
}
exports.shouldUseReactDomClient = no_react_1.NoReactInternals.ENABLE_V5_BREAKING_CHANGES
    ? true
    : parseInt(reactDomVersion, 10) >= 18;
const getResolveConfig = () => ({
    extensions: ['.ts', '.tsx', '.web.js', '.js', '.jsx', '.mjs', '.cjs'],
    alias: {
        // Only one version of react
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
        react: require.resolve('react'),
        // Needed to not fail on this: https://github.com/remotion-dev/remotion/issues/5045
        'remotion/no-react': node_path_1.default.resolve(require.resolve('remotion'), '..', '..', 'esm', 'no-react.mjs'),
        'remotion/version': node_path_1.default.resolve(require.resolve('remotion'), '..', '..', 'esm', 'version.mjs'),
        remotion: node_path_1.default.resolve(require.resolve('remotion'), '..', '..', 'esm', 'index.mjs'),
        '@remotion/media-parser/worker': node_path_1.default.resolve(require.resolve('@remotion/media-parser'), '..', 'esm', 'worker.mjs'),
        // test visual controls before removing this
        '@remotion/studio': require.resolve('@remotion/studio'),
        'react-dom/client': exports.shouldUseReactDomClient
            ? require.resolve('react-dom/client')
            : require.resolve('react-dom'),
    },
});
exports.getResolveConfig = getResolveConfig;
const getOutputConfig = (environment) => ({
    hashFunction: 'xxhash64',
    filename: no_react_1.NoReactInternals.bundleName,
    devtoolModuleFilenameTemplate: '[resource-path]',
    assetModuleFilename: environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
});
exports.getOutputConfig = getOutputConfig;
const getBaseConfig = (environment, poll) => {
    const isBun = typeof Bun !== 'undefined';
    return {
        optimization: {
            minimize: false,
        },
        experiments: {
            lazyCompilation: isBun
                ? false
                : environment === 'production'
                    ? false
                    : {
                        entries: false,
                    },
        },
        watchOptions: {
            poll: poll !== null && poll !== void 0 ? poll : undefined,
            aggregateTimeout: 0,
            ignored: ['**/.git/**', '**/.turbo/**', '**/node_modules/**'],
        },
        // Higher source map quality in development to power line numbers for stack traces
        devtool: environment === 'development'
            ? 'source-map'
            : 'cheap-module-source-map',
    };
};
exports.getBaseConfig = getBaseConfig;
const getSharedModuleRules = () => [
    {
        test: /\.css$/i,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
        type: 'javascript/auto',
    },
    {
        test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mov|mp3|m4a|wav|aac)$/,
        type: 'asset/resource',
    },
    {
        test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
    },
];
exports.getSharedModuleRules = getSharedModuleRules;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const computeHashAndFinalConfig = (conf, options) => {
    const hash = (0, node_crypto_1.createHash)('md5')
        .update((0, stringify_with_circular_references_1.jsonStringifyWithCircularReferences)(conf))
        .digest('hex');
    return [
        hash,
        {
            ...conf,
            cache: options.enableCaching
                ? {
                    type: 'filesystem',
                    name: (0, webpack_cache_1.getWebpackCacheName)(options.environment, hash),
                    version: hash,
                }
                : false,
            output: {
                ...conf.output,
                ...(options.outDir ? { path: options.outDir } : {}),
            },
            context: options.remotionRoot,
        },
    ];
};
exports.computeHashAndFinalConfig = computeHashAndFinalConfig;
