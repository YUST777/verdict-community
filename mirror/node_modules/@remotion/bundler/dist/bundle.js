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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalBundle = exports.findClosestFolderWithItem = exports.getConfig = void 0;
exports.bundle = bundle;
const node_fs_1 = __importStar(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = require("node:util");
const node_worker_threads_1 = require("node:worker_threads");
const studio_shared_1 = require("@remotion/studio-shared");
const webpack_1 = __importDefault(require("webpack"));
const copy_dir_1 = require("./copy-dir");
const index_html_1 = require("./index-html");
const read_recursively_1 = require("./read-recursively");
const rspack_config_1 = require("./rspack-config");
const webpack_config_1 = require("./webpack-config");
const promisified = (0, node_util_1.promisify)(webpack_1.default);
const prepareOutDir = async (specified) => {
    if (specified) {
        await node_fs_1.default.promises.mkdir(specified, { recursive: true });
        return specified;
    }
    return node_fs_1.default.promises.mkdtemp(node_path_1.default.join(node_os_1.default.tmpdir(), 'remotion-webpack-bundle-'));
};
const trimLeadingSlash = (p) => {
    if (p.startsWith('/')) {
        return trimLeadingSlash(p.substr(1));
    }
    return p;
};
const trimTrailingSlash = (p) => {
    if (p.endsWith('/')) {
        return trimTrailingSlash(p.substr(0, p.length - 1));
    }
    return p;
};
const getConfig = ({ entryPoint, outDir, resolvedRemotionRoot, onProgress, options, bufferStateDelayInMilliseconds, maxTimelineTracks, experimentalClientSideRenderingEnabled, experimentalVisualModeEnabled, }) => {
    var _a, _b, _c, _d;
    const configArgs = {
        entry: node_path_1.default.join(require.resolve('@remotion/studio/renderEntry'), '..', 'esm', 'renderEntry.mjs'),
        userDefinedComponent: entryPoint,
        outDir,
        environment: 'production',
        webpackOverride: (_a = options === null || options === void 0 ? void 0 : options.webpackOverride) !== null && _a !== void 0 ? _a : ((f) => f),
        onProgress: (p) => {
            onProgress === null || onProgress === void 0 ? void 0 : onProgress(p);
        },
        enableCaching: (_b = options === null || options === void 0 ? void 0 : options.enableCaching) !== null && _b !== void 0 ? _b : true,
        maxTimelineTracks,
        remotionRoot: resolvedRemotionRoot,
        keyboardShortcutsEnabled: (_c = options === null || options === void 0 ? void 0 : options.keyboardShortcutsEnabled) !== null && _c !== void 0 ? _c : true,
        bufferStateDelayInMilliseconds,
        poll: null,
        experimentalClientSideRenderingEnabled,
        experimentalVisualModeEnabled,
        askAIEnabled: (_d = options === null || options === void 0 ? void 0 : options.askAIEnabled) !== null && _d !== void 0 ? _d : true,
    };
    if (options.rspack) {
        return (0, rspack_config_1.rspackConfig)(configArgs);
    }
    return (0, webpack_config_1.webpackConfig)(configArgs);
};
exports.getConfig = getConfig;
const convertArgumentsIntoOptions = (args) => {
    var _a;
    if (args.length === 0) {
        throw new TypeError('bundle() was called without arguments');
    }
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
        return {
            entryPoint: firstArg,
            onProgress: args[1],
            ...((_a = args[2]) !== null && _a !== void 0 ? _a : {}),
        };
    }
    if (typeof firstArg.entryPoint !== 'string') {
        throw new TypeError('bundle() was called without the `entryPoint` option');
    }
    return firstArg;
};
const recursionLimit = 5;
const findClosestFolderWithItem = (currentDir, file) => {
    let possibleFile = '';
    for (let i = 0; i < recursionLimit; i++) {
        possibleFile = node_path_1.default.join(currentDir, file);
        const exists = node_fs_1.default.existsSync(possibleFile);
        if (exists) {
            return node_path_1.default.dirname(possibleFile);
        }
        currentDir = node_path_1.default.dirname(currentDir);
    }
    return null;
};
exports.findClosestFolderWithItem = findClosestFolderWithItem;
const findClosestPackageJsonFolder = (currentDir) => {
    return (0, exports.findClosestFolderWithItem)(currentDir, 'package.json');
};
const validateEntryPoint = async (entryPoint) => {
    const contents = await node_fs_1.promises.readFile(entryPoint, 'utf8');
    if (!contents.includes('registerRoot')) {
        throw new Error([
            `You passed ${entryPoint} as your entry point, but this file does not contain "registerRoot".`,
            'You should use the file that calls registerRoot() as the entry point.',
            'To ignore this error, pass "ignoreRegisterRootWarning" to bundle().',
            'This error cannot be ignored on the CLI.',
        ].join(' '));
    }
};
const internalBundle = async (actualArgs) => {
    var _a;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const entryPoint = node_path_1.default.resolve(process.cwd(), actualArgs.entryPoint);
    const resolvedRemotionRoot = (_c = (_b = actualArgs === null || actualArgs === void 0 ? void 0 : actualArgs.rootDir) !== null && _b !== void 0 ? _b : findClosestPackageJsonFolder(entryPoint)) !== null && _c !== void 0 ? _c : process.cwd();
    if (!actualArgs.ignoreRegisterRootWarning) {
        await validateEntryPoint(entryPoint);
    }
    const outDir = await prepareOutDir((_d = actualArgs === null || actualArgs === void 0 ? void 0 : actualArgs.outDir) !== null && _d !== void 0 ? _d : null);
    (_a = actualArgs.onDirectoryCreated) === null || _a === void 0 ? void 0 : _a.call(actualArgs, outDir);
    // The config might use an override which might use
    // `process.cwd()`. The context should always be the Remotion root.
    // This is not supported in worker threads (used for tests)
    const currentCwd = process.cwd();
    if (node_worker_threads_1.isMainThread) {
        process.chdir(resolvedRemotionRoot);
    }
    const { onProgress, ...options } = actualArgs;
    const [, config] = await (0, exports.getConfig)({
        outDir,
        entryPoint,
        resolvedRemotionRoot,
        onProgress,
        options,
        // Should be null to keep cache hash working
        bufferStateDelayInMilliseconds: (_e = actualArgs.bufferStateDelayInMilliseconds) !== null && _e !== void 0 ? _e : null,
        maxTimelineTracks: actualArgs.maxTimelineTracks,
        experimentalClientSideRenderingEnabled: actualArgs.experimentalClientSideRenderingEnabled,
        experimentalVisualModeEnabled: actualArgs.experimentalVisualModeEnabled,
    });
    if (actualArgs.rspack) {
        const { rspack: rspackFn } = require('@rspack/core');
        const rspackCompiler = rspackFn(config);
        const rspackOutput = await new Promise((resolve, reject) => {
            rspackCompiler.run((err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                rspackCompiler.close(() => {
                    resolve(stats);
                });
            });
        });
        if (node_worker_threads_1.isMainThread) {
            process.chdir(currentCwd);
        }
        const { errors } = rspackOutput.toJson({});
        if (errors !== undefined && errors.length > 0) {
            throw new Error(errors[0].message + '\n' + errors[0].details);
        }
    }
    else {
        const output = (await promisified([config]));
        if (node_worker_threads_1.isMainThread) {
            process.chdir(currentCwd);
        }
        if (!output) {
            throw new Error('Expected webpack output');
        }
        const { errors } = output.toJson();
        if (errors !== undefined && errors.length > 0) {
            throw new Error(errors[0].message + '\n' + errors[0].details);
        }
    }
    const publicPath = (_f = actualArgs === null || actualArgs === void 0 ? void 0 : actualArgs.publicPath) !== null && _f !== void 0 ? _f : '/';
    const staticHash = '/' +
        [trimTrailingSlash(trimLeadingSlash(publicPath)), 'public']
            .filter(Boolean)
            .join('/');
    const from = (options === null || options === void 0 ? void 0 : options.publicDir)
        ? node_path_1.default.resolve(resolvedRemotionRoot, options.publicDir)
        : node_path_1.default.join(resolvedRemotionRoot, 'public');
    const to = node_path_1.default.join(outDir, 'public');
    let symlinkWarningShown = false;
    const showSymlinkWarning = (ent, src) => {
        if (symlinkWarningShown) {
            return;
        }
        const absolutePath = node_path_1.default.join(src, ent.name);
        if (options.onSymlinkDetected) {
            options.onSymlinkDetected(absolutePath);
            return;
        }
        symlinkWarningShown = true;
        // eslint-disable-next-line no-console
        console.warn(`\nFound a symbolic link in the public folder (${absolutePath}). The symlink will be forwarded into the bundle.`);
    };
    if (node_fs_1.default.existsSync(from)) {
        await (0, copy_dir_1.copyDir)({
            src: from,
            dest: to,
            onSymlinkDetected: showSymlinkWarning,
            onProgress: (prog) => {
                var _a;
                return (_a = options.onPublicDirCopyProgress) === null || _a === void 0 ? void 0 : _a.call(options, prog);
            },
            copiedBytes: 0,
            lastReportedProgress: 0,
        });
    }
    const html = (0, index_html_1.indexHtml)({
        staticHash,
        publicPath,
        editorName: null,
        inputProps: null,
        remotionRoot: resolvedRemotionRoot,
        studioServerCommand: null,
        renderQueue: null,
        numberOfAudioTags: 0,
        publicFiles: (0, read_recursively_1.readRecursively)({
            folder: '.',
            startPath: from,
            staticHash,
            limit: 10000,
        }).map((f) => {
            return {
                ...f,
                name: f.name.split(node_path_1.default.sep).join('/'),
            };
        }),
        includeFavicon: true,
        title: 'Remotion Bundle',
        renderDefaults: (_g = actualArgs.renderDefaults) !== null && _g !== void 0 ? _g : undefined,
        publicFolderExists: `${publicPath + (publicPath.endsWith('/') ? '' : '/')}public`,
        gitSource: (_h = actualArgs.gitSource) !== null && _h !== void 0 ? _h : null,
        projectName: (0, studio_shared_1.getProjectName)({
            gitSource: (_j = actualArgs.gitSource) !== null && _j !== void 0 ? _j : null,
            resolvedRemotionRoot,
            basename: node_path_1.default.basename,
        }),
        installedDependencies: null,
        packageManager: 'unknown',
        // Actual log level is set in setPropsAndEnv()
        logLevel: 'info',
        mode: 'bundle',
        audioLatencyHint: (_k = actualArgs.audioLatencyHint) !== null && _k !== void 0 ? _k : 'interactive',
    });
    node_fs_1.default.writeFileSync(node_path_1.default.join(outDir, 'index.html'), html);
    node_fs_1.default.copyFileSync(node_path_1.default.join(__dirname, '../favicon.ico'), node_path_1.default.join(outDir, 'favicon.ico'));
    node_fs_1.default.copyFileSync(node_path_1.default.resolve(require.resolve('source-map'), '..', 'lib', 'mappings.wasm'), node_path_1.default.join(outDir, studio_shared_1.SOURCE_MAP_ENDPOINT.replace('/', '')));
    return outDir;
};
exports.internalBundle = internalBundle;
/*
 * @description Bundles a Remotion project using Webpack and prepares it for rendering.
 * @see [Documentation](https://remotion.dev/docs/bundle)
 */
async function bundle(...args) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const actualArgs = convertArgumentsIntoOptions(args);
    const result = await (0, exports.internalBundle)({
        bufferStateDelayInMilliseconds: (_a = actualArgs.bufferStateDelayInMilliseconds) !== null && _a !== void 0 ? _a : null,
        enableCaching: (_b = actualArgs.enableCaching) !== null && _b !== void 0 ? _b : true,
        entryPoint: actualArgs.entryPoint,
        gitSource: (_c = actualArgs.gitSource) !== null && _c !== void 0 ? _c : null,
        ignoreRegisterRootWarning: (_d = actualArgs.ignoreRegisterRootWarning) !== null && _d !== void 0 ? _d : false,
        maxTimelineTracks: (_e = actualArgs.maxTimelineTracks) !== null && _e !== void 0 ? _e : null,
        onDirectoryCreated: (_f = actualArgs.onDirectoryCreated) !== null && _f !== void 0 ? _f : (() => { }),
        onProgress: (_g = actualArgs.onProgress) !== null && _g !== void 0 ? _g : (() => { }),
        onPublicDirCopyProgress: (_h = actualArgs.onPublicDirCopyProgress) !== null && _h !== void 0 ? _h : (() => { }),
        onSymlinkDetected: (_j = actualArgs.onSymlinkDetected) !== null && _j !== void 0 ? _j : (() => { }),
        outDir: (_k = actualArgs.outDir) !== null && _k !== void 0 ? _k : null,
        publicDir: (_l = actualArgs.publicDir) !== null && _l !== void 0 ? _l : null,
        publicPath: (_m = actualArgs.publicPath) !== null && _m !== void 0 ? _m : null,
        rootDir: (_o = actualArgs.rootDir) !== null && _o !== void 0 ? _o : null,
        webpackOverride: (_p = actualArgs.webpackOverride) !== null && _p !== void 0 ? _p : ((f) => f),
        audioLatencyHint: (_q = actualArgs.audioLatencyHint) !== null && _q !== void 0 ? _q : null,
        experimentalClientSideRenderingEnabled: (_r = actualArgs.experimentalClientSideRenderingEnabled) !== null && _r !== void 0 ? _r : false,
        experimentalVisualModeEnabled: (_s = actualArgs.experimentalVisualModeEnabled) !== null && _s !== void 0 ? _s : false,
        renderDefaults: (_t = actualArgs.renderDefaults) !== null && _t !== void 0 ? _t : null,
        askAIEnabled: (_u = actualArgs.askAIEnabled) !== null && _u !== void 0 ? _u : true,
        keyboardShortcutsEnabled: (_v = actualArgs.keyboardShortcutsEnabled) !== null && _v !== void 0 ? _v : true,
        rspack: (_w = actualArgs.rspack) !== null && _w !== void 0 ? _w : false,
    });
    return result;
}
