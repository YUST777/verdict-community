"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectAssets = void 0;
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const collectAssets = async ({ frame, freePage, timeoutInMilliseconds, }) => {
    const { value } = await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        pageFunction: () => {
            return window.remotion_collectAssets();
        },
        args: [],
        frame,
        page: freePage,
        timeoutInMilliseconds,
    });
    const fixedArtifacts = value.map((asset) => {
        if (asset.type !== 'artifact') {
            return asset;
        }
        if (asset.contentType === 'binary' || asset.contentType === 'text') {
            if (typeof asset.content !== 'string') {
                throw new Error(`Expected string content for artifact ${asset.id}, but got ${asset.content}`);
            }
            const stringOrUintArray = asset.contentType === 'binary'
                ? new TextEncoder().encode(atob(asset.content))
                : asset.content;
            return {
                ...asset,
                content: stringOrUintArray,
            };
        }
        if (asset.contentType === 'thumbnail') {
            return asset;
        }
        return asset;
    });
    return fixedArtifacts;
};
exports.collectAssets = collectAssets;
