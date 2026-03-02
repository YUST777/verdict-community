"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDownloadMap = exports.makeDownloadMap = exports.makeAndReturn = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const version_1 = require("remotion/version");
const delete_directory_1 = require("../delete-directory");
const offthread_video_server_1 = require("../offthread-video-server");
const tmp_dir_1 = require("../tmp-dir");
const inline_audio_mixing_1 = require("./inline-audio-mixing");
const makeAndReturn = (dir, name) => {
    const p = node_path_1.default.join(dir, name);
    (0, node_fs_1.mkdirSync)(p);
    return p;
};
exports.makeAndReturn = makeAndReturn;
const makeDownloadMap = () => {
    const dir = (0, tmp_dir_1.tmpDir)(`remotion-v${version_1.VERSION}-assets`);
    let prevented = false;
    return {
        isDownloadingMap: {},
        hasBeenDownloadedMap: {},
        listeners: {},
        durationOfAssetCache: {},
        id: String(Math.random()),
        assetDir: dir,
        downloadListeners: [],
        downloadDir: (0, exports.makeAndReturn)(dir, 'remotion-assets-dir'),
        complexFilter: (0, exports.makeAndReturn)(dir, 'remotion-complex-filter'),
        preEncode: (0, exports.makeAndReturn)(dir, 'pre-encode'),
        audioMixing: (0, exports.makeAndReturn)(dir, 'remotion-audio-mixing'),
        audioPreprocessing: (0, exports.makeAndReturn)(dir, 'remotion-audio-preprocessing'),
        stitchFrames: (0, exports.makeAndReturn)(dir, 'remotion-stitch-temp-dir'),
        compositingDir: (0, exports.makeAndReturn)(dir, 'remotion-compositing-temp-dir'),
        emitter: new offthread_video_server_1.OffthreadVideoServerEmitter(),
        preventCleanup: () => {
            prevented = true;
        },
        allowCleanup: () => {
            prevented = false;
        },
        isPreventedFromCleanup: () => {
            return prevented;
        },
        inlineAudioMixing: (0, inline_audio_mixing_1.makeInlineAudioMixing)(dir),
        cleanupController: new AbortController(),
    };
};
exports.makeDownloadMap = makeDownloadMap;
const cleanDownloadMap = (downloadMap) => {
    if (downloadMap.isPreventedFromCleanup()) {
        return;
    }
    downloadMap.cleanupController.abort();
    (0, delete_directory_1.deleteDirectory)(downloadMap.downloadDir);
    (0, delete_directory_1.deleteDirectory)(downloadMap.complexFilter);
    (0, delete_directory_1.deleteDirectory)(downloadMap.compositingDir);
    downloadMap.inlineAudioMixing.cleanup();
    // Assets dir must be last since the others are contained
    (0, delete_directory_1.deleteDirectory)(downloadMap.assetDir);
};
exports.cleanDownloadMap = cleanDownloadMap;
