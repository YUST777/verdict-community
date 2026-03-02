"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVisualControlChange = exports.canUpdateDefaultProps = exports.callUpdateDefaultPropsApi = exports.getProjectInfo = exports.updateAvailable = exports.cancelRenderJob = exports.removeRenderJob = exports.applyCodemod = exports.openInFileExplorer = exports.subscribeToFileExistenceWatcher = exports.unsubscribeFromFileExistenceWatcher = exports.addVideoRenderJob = exports.addSequenceRenderJob = exports.addStillRenderJob = void 0;
const no_react_1 = require("remotion/no-react");
const call_api_1 = require("../call-api");
const addStillRenderJob = ({ compositionId, outName, imageFormat, jpegQuality, frame, scale, logLevel, chromiumOptions, delayRenderTimeout, envVariables, inputProps, offthreadVideoCacheSizeInBytes, offthreadVideoThreads, multiProcessOnLinux, beepOnFinish, metadata, chromeMode, mediaCacheSizeInBytes, }) => {
    return (0, call_api_1.callApi)('/api/render', {
        compositionId,
        type: 'still',
        outName,
        imageFormat,
        jpegQuality,
        frame,
        scale,
        logLevel,
        chromiumOptions,
        delayRenderTimeout,
        envVariables,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            data: inputProps,
            staticBase: window.remotion_staticBase,
            indent: undefined,
        }).serializedString,
        offthreadVideoCacheSizeInBytes,
        offthreadVideoThreads,
        multiProcessOnLinux,
        beepOnFinish,
        metadata,
        chromeMode,
        mediaCacheSizeInBytes,
    });
};
exports.addStillRenderJob = addStillRenderJob;
const addSequenceRenderJob = ({ compositionId, outName, imageFormat, startFrame, endFrame, scale, logLevel, chromiumOptions, delayRenderTimeout, envVariables, inputProps, concurrency, offthreadVideoCacheSizeInBytes, offthreadVideoThreads, jpegQuality, disallowParallelEncoding, multiProcessOnLinux, beepOnFinish, repro, metadata, chromeMode, mediaCacheSizeInBytes, }) => {
    return (0, call_api_1.callApi)('/api/render', {
        compositionId,
        type: 'sequence',
        outName,
        imageFormat,
        jpegQuality,
        scale,
        startFrame,
        endFrame,
        logLevel,
        chromiumOptions,
        delayRenderTimeout,
        envVariables,
        concurrency,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            data: inputProps,
            staticBase: window.remotion_staticBase,
            indent: undefined,
        }).serializedString,
        offthreadVideoCacheSizeInBytes,
        offthreadVideoThreads,
        disallowParallelEncoding,
        multiProcessOnLinux,
        beepOnFinish,
        repro,
        metadata,
        chromeMode,
        mediaCacheSizeInBytes,
    });
};
exports.addSequenceRenderJob = addSequenceRenderJob;
const addVideoRenderJob = ({ compositionId, outName, imageFormat, jpegQuality, scale, logLevel, codec, concurrency, crf, startFrame, endFrame, muted, enforceAudioTrack, proResProfile, x264Preset, pixelFormat, audioBitrate, videoBitrate, everyNthFrame, numberOfGifLoops, delayRenderTimeout, audioCodec, disallowParallelEncoding, chromiumOptions, envVariables, inputProps, offthreadVideoCacheSizeInBytes, offthreadVideoThreads, colorSpace, multiProcessOnLinux, encodingMaxRate, encodingBufferSize, beepOnFinish, repro, forSeamlessAacConcatenation, separateAudioTo, metadata, hardwareAcceleration, chromeMode, mediaCacheSizeInBytes, }) => {
    return (0, call_api_1.callApi)('/api/render', {
        compositionId,
        type: 'video',
        outName,
        imageFormat,
        jpegQuality,
        scale,
        logLevel,
        codec,
        concurrency,
        crf,
        endFrame,
        startFrame,
        muted,
        enforceAudioTrack,
        proResProfile,
        x264Preset,
        pixelFormat,
        audioBitrate,
        videoBitrate,
        everyNthFrame,
        numberOfGifLoops,
        delayRenderTimeout,
        audioCodec,
        disallowParallelEncoding,
        chromiumOptions,
        envVariables,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            data: inputProps,
            staticBase: window.remotion_staticBase,
            indent: undefined,
        }).serializedString,
        offthreadVideoCacheSizeInBytes,
        offthreadVideoThreads,
        colorSpace,
        multiProcessOnLinux,
        encodingBufferSize,
        encodingMaxRate,
        beepOnFinish,
        repro,
        forSeamlessAacConcatenation,
        separateAudioTo,
        metadata,
        hardwareAcceleration,
        chromeMode,
        mediaCacheSizeInBytes,
    });
};
exports.addVideoRenderJob = addVideoRenderJob;
const unsubscribeFromFileExistenceWatcher = ({ file, clientId, }) => {
    return (0, call_api_1.callApi)('/api/unsubscribe-from-file-existence', { file, clientId });
};
exports.unsubscribeFromFileExistenceWatcher = unsubscribeFromFileExistenceWatcher;
const subscribeToFileExistenceWatcher = async ({ file, clientId, }) => {
    const { exists } = await (0, call_api_1.callApi)('/api/subscribe-to-file-existence', {
        file,
        clientId,
    });
    return exists;
};
exports.subscribeToFileExistenceWatcher = subscribeToFileExistenceWatcher;
const openInFileExplorer = ({ directory }) => {
    const body = {
        directory,
    };
    return (0, call_api_1.callApi)('/api/open-in-file-explorer', body);
};
exports.openInFileExplorer = openInFileExplorer;
const applyCodemod = ({ codemod, dryRun, signal, }) => {
    const body = {
        codemod,
        dryRun,
    };
    return (0, call_api_1.callApi)('/api/apply-codemod', body, signal);
};
exports.applyCodemod = applyCodemod;
const removeRenderJob = (job) => {
    return (0, call_api_1.callApi)('/api/remove-render', {
        jobId: job.id,
    });
};
exports.removeRenderJob = removeRenderJob;
const cancelRenderJob = (job) => {
    return (0, call_api_1.callApi)('/api/cancel', {
        jobId: job.id,
    });
};
exports.cancelRenderJob = cancelRenderJob;
const updateAvailable = (signal) => {
    return (0, call_api_1.callApi)('/api/update-available', {}, signal);
};
exports.updateAvailable = updateAvailable;
const getProjectInfo = (signal) => {
    return (0, call_api_1.callApi)('/api/project-info', {}, signal);
};
exports.getProjectInfo = getProjectInfo;
const callUpdateDefaultPropsApi = (compositionId, defaultProps, enumPaths) => {
    return (0, call_api_1.callApi)('/api/update-default-props', {
        compositionId,
        defaultProps: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            data: defaultProps,
            indent: undefined,
            staticBase: window.remotion_staticBase,
        }).serializedString,
        enumPaths,
    });
};
exports.callUpdateDefaultPropsApi = callUpdateDefaultPropsApi;
const canUpdateDefaultProps = (compositionId, readOnlyStudio) => {
    if (readOnlyStudio) {
        return Promise.resolve({
            canUpdate: false,
            reason: 'Read-only studio',
        });
    }
    return (0, call_api_1.callApi)('/api/can-update-default-props', {
        compositionId,
    });
};
exports.canUpdateDefaultProps = canUpdateDefaultProps;
const applyVisualControlChange = ({ fileName, changes, }) => {
    return (0, call_api_1.callApi)('/api/apply-visual-control-change', {
        fileName,
        changes,
    });
};
exports.applyVisualControlChange = applyVisualControlChange;
