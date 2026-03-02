"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFrameWithOptionToReject = void 0;
const path_1 = __importDefault(require("path"));
const download_and_map_assets_to_file_1 = require("./assets/download-and-map-assets-to-file");
const collect_assets_1 = require("./collect-assets");
const compress_assets_1 = require("./compress-assets");
const handle_javascript_exception_1 = require("./error-handling/handle-javascript-exception");
const filter_asset_types_1 = require("./filter-asset-types");
const get_frame_padded_index_1 = require("./get-frame-padded-index");
const logger_1 = require("./logger");
const seek_to_frame_1 = require("./seek-to-frame");
const take_frame_1 = require("./take-frame");
const truthy_1 = require("./truthy");
const renderFrameWithOptionToReject = async ({ reject, width, height, compId, attempt, stoppedSignal, indent, logLevel, timeoutInMilliseconds, outputDir, onFrameBuffer, imageFormat, onError, lastFrame, jpegQuality, frameDir, scale, countType, assets, framesToRender, onArtifact, onDownload, downloadMap, binariesDirectory, cancelSignal, framesRenderedObj, onFrameUpdate, frame, page, imageSequencePattern, fps, trimLeftOffset, trimRightOffset, allFramesAndExtraFrames, }) => {
    const startTime = performance.now();
    const index = framesToRender.indexOf(frame);
    const assetsOnly = index === -1;
    if (stoppedSignal.stopped) {
        return Promise.reject(new Error('Render was stopped'));
    }
    const errorCallbackOnFrame = (err) => {
        reject(err);
    };
    const cleanupPageError = (0, handle_javascript_exception_1.handleJavascriptException)({
        page,
        onError: errorCallbackOnFrame,
        frame,
    });
    page.on('error', errorCallbackOnFrame);
    const startSeeking = Date.now();
    await (0, seek_to_frame_1.seekToFrame)({
        frame,
        page,
        composition: compId,
        timeoutInMilliseconds,
        indent,
        logLevel,
        attempt,
    });
    const timeToSeek = Date.now() - startSeeking;
    if (timeToSeek > 1000) {
        logger_1.Log.verbose({ indent, logLevel }, `Seeking to frame ${frame} took ${timeToSeek}ms`);
    }
    if (!outputDir && !onFrameBuffer && imageFormat !== 'none') {
        throw new Error('Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`');
    }
    if (outputDir && onFrameBuffer && imageFormat !== 'none') {
        throw new Error('Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.');
    }
    const [buffer, collectedAssets] = await Promise.all([
        (0, take_frame_1.takeFrame)({
            freePage: page,
            height,
            imageFormat: assetsOnly ? 'none' : imageFormat,
            output: index === null
                ? null
                : path_1.default.join(frameDir, (0, get_frame_padded_index_1.getFrameOutputFileName)({
                    frame,
                    imageFormat,
                    index,
                    countType,
                    lastFrame,
                    totalFrames: framesToRender.length,
                    imageSequencePattern,
                })),
            jpegQuality,
            width,
            scale,
            wantsBuffer: Boolean(onFrameBuffer),
            timeoutInMilliseconds,
        }),
        (0, collect_assets_1.collectAssets)({
            frame,
            freePage: page,
            timeoutInMilliseconds,
        }),
    ]);
    if (onFrameBuffer && !assetsOnly) {
        if (!buffer) {
            throw new Error('unexpected null buffer');
        }
        onFrameBuffer(buffer, frame);
    }
    const onlyAvailableAssets = assets.filter(truthy_1.truthy);
    const previousAudioRenderAssets = onlyAvailableAssets
        .map((a) => a.audioAndVideoAssets)
        .flat(2);
    const previousArtifactAssets = onlyAvailableAssets
        .map((a) => a.artifactAssets)
        .flat(2);
    const audioAndVideoAssets = (0, filter_asset_types_1.onlyAudioAndVideoAssets)(collectedAssets);
    const artifactAssets = (0, filter_asset_types_1.onlyArtifact)({
        assets: collectedAssets,
        frameBuffer: buffer,
    });
    for (const artifact of artifactAssets) {
        for (const previousArtifact of previousArtifactAssets) {
            if (artifact.filename === previousArtifact.filename) {
                return Promise.reject(new Error(`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${artifact.frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`));
            }
        }
        onArtifact === null || onArtifact === void 0 ? void 0 : onArtifact(artifact);
    }
    const compressedAssets = audioAndVideoAssets.map((asset) => {
        return (0, compress_assets_1.compressAsset)(previousAudioRenderAssets, asset);
    });
    const inlineAudioAssets = (0, filter_asset_types_1.onlyInlineAudio)(collectedAssets);
    assets.push({
        audioAndVideoAssets: compressedAssets,
        frame,
        artifactAssets: artifactAssets.map((a) => {
            return {
                frame: a.frame,
                filename: a.filename,
            };
        }),
        inlineAudioAssets,
    });
    for (const renderAsset of compressedAssets) {
        (0, download_and_map_assets_to_file_1.downloadAndMapAssetsToFileUrl)({
            renderAsset,
            onDownload,
            downloadMap,
            indent,
            logLevel,
            binariesDirectory,
            cancelSignalForAudioAnalysis: cancelSignal,
            shouldAnalyzeAudioImmediately: true,
        }).catch((err) => {
            const truncateWithEllipsis = renderAsset.src.substring(0, 1000) +
                (renderAsset.src.length > 1000 ? '...' : '');
            onError(new Error(`Error while downloading ${truncateWithEllipsis}: ${err.stack}`));
        });
    }
    for (const renderAsset of inlineAudioAssets) {
        downloadMap.inlineAudioMixing.addAsset({
            asset: renderAsset,
            fps,
            totalNumberOfFrames: allFramesAndExtraFrames.length,
            firstFrame: allFramesAndExtraFrames[0],
            trimLeftOffset,
            trimRightOffset,
        });
    }
    cleanupPageError();
    page.off('error', errorCallbackOnFrame);
    if (!assetsOnly) {
        framesRenderedObj.count++;
        onFrameUpdate === null || onFrameUpdate === void 0 ? void 0 : onFrameUpdate(framesRenderedObj.count, frame, performance.now() - startTime);
    }
};
exports.renderFrameWithOptionToReject = renderFrameWithOptionToReject;
