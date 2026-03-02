"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFullscreenSupport = void 0;
const checkFullscreenSupport = () => {
    return (document.fullscreenEnabled ||
        // @ts-expect-error Types not defined
        document.webkitFullscreenEnabled);
};
exports.checkFullscreenSupport = checkFullscreenSupport;
