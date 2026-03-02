"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultOutLocation = void 0;
const hasFileExtension = (location) => {
    var _a;
    const lastSegment = (_a = location.split('/').pop()) !== null && _a !== void 0 ? _a : location;
    return lastSegment.includes('.');
};
const getDefaultOutLocation = ({ compositionName, defaultExtension, type, compositionDefaultOutName, outputLocation, }) => {
    if (outputLocation && hasFileExtension(outputLocation)) {
        return outputLocation;
    }
    const base = outputLocation !== null && outputLocation !== void 0 ? outputLocation : 'out';
    const dir = base.endsWith('/') ? base : `${base}/`;
    const nameToUse = compositionDefaultOutName !== null && compositionDefaultOutName !== void 0 ? compositionDefaultOutName : compositionName;
    if (type === 'sequence') {
        return `${dir}${nameToUse}`;
    }
    return `${dir}${nameToUse}.${defaultExtension}`;
};
exports.getDefaultOutLocation = getDefaultOutLocation;
