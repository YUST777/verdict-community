"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackConfig = void 0;
const webpack_1 = __importStar(require("webpack"));
const case_sensitive_paths_1 = require("./case-sensitive-paths");
const define_plugin_definitions_1 = require("./define-plugin-definitions");
const fast_refresh_1 = require("./fast-refresh");
const hide_expression_dependency_1 = require("./hide-expression-dependency");
const ignore_packfilecache_warnings_1 = require("./ignore-packfilecache-warnings");
const optional_dependencies_1 = require("./optional-dependencies");
const shared_bundler_config_1 = require("./shared-bundler-config");
const esbuild = require("esbuild");
function truthy(value) {
    return Boolean(value);
}
const webpackConfig = async ({ entry, userDefinedComponent, outDir, environment, webpackOverride = (f) => f, onProgress, enableCaching = true, maxTimelineTracks, remotionRoot, keyboardShortcutsEnabled, bufferStateDelayInMilliseconds, poll, experimentalClientSideRenderingEnabled, experimentalVisualModeEnabled, askAIEnabled, }) => {
    const esbuildLoaderOptions = {
        target: 'chrome85',
        loader: 'tsx',
        implementation: esbuild,
        remotionRoot,
    };
    let lastProgress = 0;
    const define = new webpack_1.default.DefinePlugin((0, define_plugin_definitions_1.getDefinePluginDefinitions)({
        maxTimelineTracks,
        askAIEnabled,
        keyboardShortcutsEnabled,
        bufferStateDelayInMilliseconds,
        experimentalClientSideRenderingEnabled,
        experimentalVisualModeEnabled,
    }));
    const conf = await webpackOverride({
        ...(0, shared_bundler_config_1.getBaseConfig)(environment, poll),
        entry: [
            // Fast Refresh must come first,
            // because setup-environment imports ReactDOM.
            // If React DOM is imported before Fast Refresh, Fast Refresh does not work
            environment === 'development'
                ? require.resolve('./fast-refresh/runtime.js')
                : null,
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
                new fast_refresh_1.ReactFreshWebpackPlugin(),
                new case_sensitive_paths_1.CaseSensitivePathsPlugin(),
                new webpack_1.default.HotModuleReplacementPlugin(),
                define,
                new optional_dependencies_1.AllowOptionalDependenciesPlugin(),
                new hide_expression_dependency_1.AllowDependencyExpressionPlugin(),
                new ignore_packfilecache_warnings_1.IgnorePackFileCacheWarningsPlugin(),
            ]
            : [
                new webpack_1.ProgressPlugin((p) => {
                    if (onProgress) {
                        if ((p === 1 && p > lastProgress) || p - lastProgress > 0.05) {
                            lastProgress = p;
                            onProgress(Number((p * 100).toFixed(2)));
                        }
                    }
                }),
                define,
                new optional_dependencies_1.AllowOptionalDependenciesPlugin(),
                new hide_expression_dependency_1.AllowDependencyExpressionPlugin(),
                new ignore_packfilecache_warnings_1.IgnorePackFileCacheWarningsPlugin(),
            ],
        output: (0, shared_bundler_config_1.getOutputConfig)(environment),
        resolve: (0, shared_bundler_config_1.getResolveConfig)(),
        module: {
            rules: [
                ...(0, shared_bundler_config_1.getSharedModuleRules)(),
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: require.resolve('./esbuild-loader/index.js'),
                            options: esbuildLoaderOptions,
                        },
                        // Keep the order to match babel-loader
                        environment === 'development'
                            ? {
                                loader: require.resolve('./fast-refresh/loader.js'),
                            }
                            : null,
                    ].filter(truthy),
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: require.resolve('./esbuild-loader/index.js'),
                            options: esbuildLoaderOptions,
                        },
                        environment === 'development'
                            ? {
                                loader: require.resolve('./fast-refresh/loader.js'),
                            }
                            : null,
                    ].filter(truthy),
                },
            ],
        },
    });
    return (0, shared_bundler_config_1.computeHashAndFinalConfig)(conf, {
        enableCaching,
        environment,
        outDir,
        remotionRoot,
    });
};
exports.webpackConfig = webpackConfig;
