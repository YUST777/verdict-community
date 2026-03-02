"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRspackCompiler = exports.rspackConfig = void 0;
const core_1 = require("@rspack/core");
const plugin_react_refresh_1 = __importDefault(require("@rspack/plugin-react-refresh"));
const define_plugin_definitions_1 = require("./define-plugin-definitions");
const shared_bundler_config_1 = require("./shared-bundler-config");
const rspackConfig = async ({ entry, userDefinedComponent, outDir, environment, webpackOverride = (f) => f, onProgress, enableCaching = true, maxTimelineTracks, remotionRoot, keyboardShortcutsEnabled, bufferStateDelayInMilliseconds, poll, experimentalClientSideRenderingEnabled, experimentalVisualModeEnabled, askAIEnabled, }) => {
    let lastProgress = 0;
    const define = new core_1.DefinePlugin((0, define_plugin_definitions_1.getDefinePluginDefinitions)({
        maxTimelineTracks,
        askAIEnabled,
        keyboardShortcutsEnabled,
        bufferStateDelayInMilliseconds,
        experimentalClientSideRenderingEnabled,
        experimentalVisualModeEnabled,
    }));
    const swcLoaderRule = {
        loader: 'builtin:swc-loader',
        options: {
            jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: {
                    react: {
                        runtime: 'automatic',
                        development: environment === 'development',
                        refresh: environment === 'development',
                    },
                },
            },
            env: { targets: 'Chrome >= 85' },
        },
    };
    const swcLoaderRuleJsx = {
        loader: 'builtin:swc-loader',
        options: {
            jsc: {
                parser: { syntax: 'ecmascript', jsx: true },
                transform: {
                    react: {
                        runtime: 'automatic',
                        development: environment === 'development',
                        refresh: environment === 'development',
                    },
                },
            },
            env: { targets: 'Chrome >= 85' },
        },
    };
    // Rspack config is structurally compatible with webpack config at runtime,
    // but the TypeScript types differ. Cast through `any` for the override.
    const conf = (await webpackOverride({
        ...(0, shared_bundler_config_1.getBaseConfig)(environment, poll),
        node: {
            // Suppress the warning in `source-map`
            __dirname: 'mock',
            __filename: 'mock',
        },
        entry: [
            require.resolve('./setup-environment'),
            environment === 'development'
                ? require.resolve('./setup-sequence-stack-traces')
                : null,
            userDefinedComponent,
            require.resolve('../react-shim.js'),
            entry,
        ].filter(Boolean),
        mode: environment,
        plugins: environment === 'development'
            ? [
                new plugin_react_refresh_1.default({ overlay: false }),
                new core_1.rspack.HotModuleReplacementPlugin(),
                define,
            ]
            : [
                new core_1.ProgressPlugin((p) => {
                    if (onProgress) {
                        if ((p === 1 && p > lastProgress) || p - lastProgress > 0.05) {
                            lastProgress = p;
                            onProgress(Number((p * 100).toFixed(2)));
                        }
                    }
                }),
                define,
            ],
        output: (0, shared_bundler_config_1.getOutputConfig)(environment),
        resolve: (0, shared_bundler_config_1.getResolveConfig)(),
        module: {
            rules: [
                ...(0, shared_bundler_config_1.getSharedModuleRules)(),
                {
                    // Emscripten's main.js spawns Workers of itself via
                    // new Worker(new URL('./main.js', import.meta.url)).
                    // This creates a circular chunk dependency that breaks HMR when `@remotion/whisper-web` is used.
                    // TODO: whisper-web does not work in Studio with Rspack, also not with Webpack.
                    // Disable Worker detection so rspack doesn't create a
                    // worker chunk; the new URL() is still handled as an asset.
                    test: /[\\/]whisper-web[\\/]main\.js$/,
                    parser: {
                        worker: false,
                    },
                },
                {
                    test: /\.tsx?$/,
                    use: [swcLoaderRule],
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [swcLoaderRuleJsx],
                },
            ],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }));
    const [hash, finalConf] = (0, shared_bundler_config_1.computeHashAndFinalConfig)(conf, {
        enableCaching,
        environment,
        outDir,
        remotionRoot,
    });
    return [hash, finalConf];
};
exports.rspackConfig = rspackConfig;
const createRspackCompiler = (config) => {
    return (0, core_1.rspack)(config);
};
exports.createRspackCompiler = createRspackCompiler;
