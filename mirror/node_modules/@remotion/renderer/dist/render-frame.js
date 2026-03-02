"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFrame = void 0;
const render_frame_with_option_to_reject_1 = require("./render-frame-with-option-to-reject");
const renderFrame = ({ attempt, binariesDirectory, cancelSignal, imageFormat, indent, logLevel, assets, countType, downloadMap, frameDir, framesToRender, jpegQuality, onArtifact, onDownload, scale, composition, onError, outputDir, stoppedSignal, timeoutInMilliseconds, lastFrame, onFrameBuffer, onFrameUpdate, framesRenderedObj, frame, page, imageSequencePattern, trimLeftOffset, trimRightOffset, allFramesAndExtraFrames, }) => {
    return new Promise((resolve, reject) => {
        (0, render_frame_with_option_to_reject_1.renderFrameWithOptionToReject)({
            reject,
            width: composition.width,
            height: composition.height,
            compId: composition.id,
            attempt,
            indent,
            logLevel,
            stoppedSignal,
            timeoutInMilliseconds,
            imageFormat,
            onFrameBuffer,
            outputDir,
            assets,
            binariesDirectory,
            cancelSignal,
            countType,
            downloadMap,
            frameDir,
            framesToRender,
            jpegQuality,
            lastFrame,
            onArtifact,
            onDownload,
            onError,
            scale,
            framesRenderedObj,
            onFrameUpdate,
            frame,
            page,
            imageSequencePattern,
            fps: composition.fps,
            trimLeftOffset,
            trimRightOffset,
            allFramesAndExtraFrames,
        })
            .then(() => {
            resolve();
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.renderFrame = renderFrame;
