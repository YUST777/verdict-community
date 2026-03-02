"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeFrame = void 0;
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const puppeteer_screenshot_1 = require("./puppeteer-screenshot");
const takeFrame = async ({ freePage, imageFormat, jpegQuality, width, height, output, scale, wantsBuffer, timeoutInMilliseconds, }) => {
    var _a;
    if (imageFormat === 'none') {
        return null;
    }
    if (imageFormat === 'png' ||
        imageFormat === 'pdf' ||
        imageFormat === 'webp') {
        await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
            pageFunction: () => {
                document.body.style.background = 'transparent';
            },
            args: [],
            frame: null,
            page: freePage,
            timeoutInMilliseconds,
        });
    }
    else {
        await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
            pageFunction: () => {
                document.body.style.background = 'black';
            },
            args: [],
            frame: null,
            page: freePage,
            timeoutInMilliseconds,
        });
    }
    const buf = await (0, puppeteer_screenshot_1.screenshot)({
        page: freePage,
        omitBackground: imageFormat === 'png',
        path: (_a = (wantsBuffer ? undefined : output)) !== null && _a !== void 0 ? _a : undefined,
        type: imageFormat,
        jpegQuality,
        width,
        height,
        scale,
    });
    return buf;
};
exports.takeFrame = takeFrame;
