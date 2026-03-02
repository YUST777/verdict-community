"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshotTask = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const perf_1 = require("./perf");
const screenshotTask = async ({ format, height, omitBackground, page, width, path, jpegQuality, scale, }) => {
    var _a;
    const client = page._client();
    const target = page.target();
    await client.send('Target.activateTarget', {
        targetId: target._targetId,
    });
    if (omitBackground) {
        await client.send('Emulation.setDefaultBackgroundColorOverride', {
            color: { r: 0, g: 0, b: 0, a: 0 },
        });
    }
    const cap = (0, perf_1.startPerfMeasure)('capture');
    try {
        let result;
        if (format === 'pdf') {
            const res = await client.send('Page.printToPDF', {
                paperWidth: width / 96, // Convert to Inch
                paperHeight: height / 96, // Convert to Inch
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                scale: 1,
                printBackground: true,
            });
            result = res.value;
        }
        else {
            // We find that there is a 0.1% framedrop when rendering under memory pressure
            // which can be circumvented by disabling this option on Lambda.
            // To be determined: Is this a problem with Lambda, or the Chrome version
            // we are using on Lambda?
            // We already found out that the problem is not a general Linux problem.
            // However, if `fromSurface` is false, the screenshot is limited to 8192x8192 pixels.
            // If the image is larger, always use `fromSurface: true`.
            const fromSurface = !process.env.DISABLE_FROM_SURFACE || height > 8192 || width > 8192;
            const scaleFactor = fromSurface ? 1 : scale;
            const { value } = await client.send('Page.captureScreenshot', {
                format,
                quality: jpegQuality,
                clip: {
                    x: 0,
                    y: 0,
                    height: height * scaleFactor,
                    scale: 1,
                    width: width * scaleFactor,
                },
                captureBeyondViewport: true,
                optimizeForSpeed: true,
                fromSurface,
            });
            result = value;
        }
        (0, perf_1.stopPerfMeasure)(cap);
        if (omitBackground) {
            await client.send('Emulation.setDefaultBackgroundColorOverride');
        }
        const buffer = Buffer.from(result.data, 'base64');
        if (path) {
            await node_fs_1.default.promises.writeFile(path, buffer);
        }
        return buffer;
    }
    catch (err) {
        if (err.message.includes('Unable to capture screenshot')) {
            const errMessage = [
                'Could not take a screenshot because Google Chrome ran out of memory or disk space.',
                ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.__RESERVED_IS_INSIDE_REMOTION_LAMBDA)
                    ? 'Deploy a new Lambda function with more memory or disk space.'
                    : 'Decrease the concurrency to use less RAM.',
            ].join(' ');
            throw new Error(errMessage);
        }
        throw err;
    }
};
exports.screenshotTask = screenshotTask;
