"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferredVolume = exports.persistVolume = void 0;
const remotion_1 = require("remotion");
const DEFAULT_VOLUME_PERSISTANCE_KEY = 'remotion.volumePreference';
const persistVolume = (volume, logLevel, volumePersistenceKey) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(volumePersistenceKey !== null && volumePersistenceKey !== void 0 ? volumePersistenceKey : DEFAULT_VOLUME_PERSISTANCE_KEY, String(volume));
    }
    catch (e) {
        // User can disallow localStorage access
        // https://github.com/remotion-dev/remotion/issues/3540
        remotion_1.Internals.Log.error({ logLevel, tag: null }, 'Could not persist volume', e);
    }
};
exports.persistVolume = persistVolume;
const getPreferredVolume = (volumePersistenceKey) => {
    if (typeof window === 'undefined') {
        return 1;
    }
    try {
        const val = window.localStorage.getItem(volumePersistenceKey !== null && volumePersistenceKey !== void 0 ? volumePersistenceKey : DEFAULT_VOLUME_PERSISTANCE_KEY);
        return val ? Number(val) : 1;
    }
    catch (_a) {
        // User can disallow localStorage access
        // https://github.com/remotion-dev/remotion/issues/3540
        return 1;
    }
};
exports.getPreferredVolume = getPreferredVolume;
