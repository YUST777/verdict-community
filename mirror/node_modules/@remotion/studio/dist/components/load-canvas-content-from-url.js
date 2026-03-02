"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveCanvasContentFromUrl = void 0;
const url_state_1 = require("../helpers/url-state");
const deriveCanvasContentFromUrl = () => {
    const route = (0, url_state_1.getRoute)();
    const substrings = route.split('/').filter(Boolean);
    // CJK-named composition IDs are not automatically reselected after page refresh
    const lastPart = substrings[substrings.length - 1];
    if (substrings[0] === 'assets') {
        return {
            type: 'asset',
            asset: decodeURIComponent(route.substring('/assets/'.length)),
        };
    }
    if (substrings[0] === 'outputs') {
        return {
            type: 'output',
            path: decodeURIComponent(route.substring('/outputs/'.length)),
        };
    }
    if (lastPart) {
        return {
            type: 'composition',
            compositionId: decodeURIComponent(lastPart),
        };
    }
    return null;
};
exports.deriveCanvasContentFromUrl = deriveCanvasContentFromUrl;
