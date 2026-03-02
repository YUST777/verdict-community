"use strict";
// While an FFMPEG filter can be passed directly, if it's too long
// we run into Windows command length limits.
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
exports.makeFfmpegFilterFileStr = exports.makeFfmpegFilterFile = void 0;
const node_fs_1 = __importStar(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const makeFfmpegFilterFile = (complexFilter, downloadMap) => {
    if (complexFilter.filter === null) {
        return {
            file: null,
            cleanup: () => undefined,
        };
    }
    return (0, exports.makeFfmpegFilterFileStr)(complexFilter.filter, downloadMap);
};
exports.makeFfmpegFilterFile = makeFfmpegFilterFile;
const makeFfmpegFilterFileStr = async (complexFilter, downloadMap) => {
    const random = Math.random().toString().replace('.', '');
    const filterFile = node_path_1.default.join(downloadMap.complexFilter, 'complex-filter-' + random + '.txt');
    // Race condition: Sometimes the download map is deleted before the file is written.
    // Can remove this once the original bug has been fixed
    if (!(0, node_fs_1.existsSync)(downloadMap.complexFilter)) {
        node_fs_1.default.mkdirSync(downloadMap.complexFilter, { recursive: true });
    }
    await node_fs_1.default.promises.writeFile(filterFile, complexFilter);
    return {
        file: filterFile,
        cleanup: () => {
            node_fs_1.default.unlinkSync(filterFile);
        },
    };
};
exports.makeFfmpegFilterFileStr = makeFfmpegFilterFileStr;
