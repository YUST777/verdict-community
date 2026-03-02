"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
exports.parseLocation = parseLocation;
const get_metadata_1 = require("./metadata/get-metadata");
function parseLocation(locationString) {
    const locationPattern = /^([+-]\d{2}\.?\d{0,10})([+-]\d{3}\.?\d{0,10})([+-]\d+(\.\d+)?)?\/$/;
    const match = locationString.match(locationPattern);
    if (!match) {
        return null;
    }
    // Extract latitude, longitude, and altitude
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    const altitude = match[3] ? parseFloat(match[3]) : null;
    return {
        latitude,
        longitude,
        altitude,
    };
}
const getLocation = (state) => {
    const metadata = (0, get_metadata_1.getMetadata)(state);
    const locationEntry = metadata.find((entry) => entry.key === 'com.apple.quicktime.location.ISO6709');
    const horizontalAccuracy = metadata.find((entry) => entry.key === 'com.apple.quicktime.location.accuracy.horizontal');
    if (locationEntry) {
        const parsed = parseLocation(locationEntry.value);
        if (parsed === null) {
            return null;
        }
        return {
            ...parsed,
            horizontalAccuracy: (horizontalAccuracy === null || horizontalAccuracy === void 0 ? void 0 : horizontalAccuracy.value)
                ? parseFloat(String(horizontalAccuracy.value))
                : null,
        };
    }
    return null;
};
exports.getLocation = getLocation;
