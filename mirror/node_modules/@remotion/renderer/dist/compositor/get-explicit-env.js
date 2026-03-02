"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExplicitEnv = void 0;
const getExplicitEnv = (cwd) => {
    return process.platform === 'darwin'
        ? {
            // Should work out of the box, but sometimes it doesn't
            // https://github.com/remotion-dev/remotion/issues/3862
            DYLD_LIBRARY_PATH: cwd,
        }
        : undefined;
};
exports.getExplicitEnv = getExplicitEnv;
