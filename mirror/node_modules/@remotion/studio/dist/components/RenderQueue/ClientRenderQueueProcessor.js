"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRenderQueueProcessor = exports.downloadBlob = void 0;
const web_renderer_1 = require("@remotion/web-renderer");
const react_1 = require("react");
const save_render_output_1 = require("../../api/save-render-output");
const context_1 = require("./context");
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFilename = filename.includes('/')
        ? filename.substring(filename.lastIndexOf('/') + 1)
        : filename;
    a.download = cleanFilename;
    a.click();
    URL.revokeObjectURL(url);
};
exports.downloadBlob = downloadBlob;
const ClientRenderQueueProcessor = () => {
    const { getAbortController, getCompositionForJob, updateClientJobProgress, markClientJobSaving, markClientJobDone, markClientJobFailed, markClientJobCancelled, setProcessJobCallback, } = (0, react_1.useContext)(context_1.RenderQueueContext);
    const processStillJob = (0, react_1.useCallback)(async (job, signal) => {
        var _a, _b;
        const compositionRef = getCompositionForJob(job.id);
        if (!compositionRef) {
            throw new Error(`Composition not found for job ${job.id}`);
        }
        const { blob } = await (0, web_renderer_1.renderStillOnWeb)({
            composition: {
                component: compositionRef.component,
                width: compositionRef.width,
                height: compositionRef.height,
                fps: compositionRef.fps,
                durationInFrames: compositionRef.durationInFrames,
                defaultProps: compositionRef.defaultProps,
                calculateMetadata: (_a = compositionRef.calculateMetadata) !== null && _a !== void 0 ? _a : undefined,
                id: job.compositionId,
            },
            frame: job.frame,
            imageFormat: job.imageFormat,
            inputProps: job.inputProps,
            delayRenderTimeoutInMilliseconds: job.delayRenderTimeout,
            mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
            logLevel: job.logLevel,
            licenseKey: (_b = job.licenseKey) !== null && _b !== void 0 ? _b : undefined,
            scale: job.scale,
            signal,
        });
        return {
            getBlob: () => Promise.resolve(blob),
            width: compositionRef.width,
            height: compositionRef.height,
        };
    }, [getCompositionForJob]);
    const processVideoJob = (0, react_1.useCallback)(async (job, signal, onProgress) => {
        var _a, _b;
        const compositionRef = getCompositionForJob(job.id);
        if (!compositionRef) {
            throw new Error(`Composition not found for job ${job.id}`);
        }
        const totalFrames = job.endFrame - job.startFrame + 1;
        const { getBlob } = await (0, web_renderer_1.renderMediaOnWeb)({
            composition: {
                component: compositionRef.component,
                width: compositionRef.width,
                height: compositionRef.height,
                fps: compositionRef.fps,
                durationInFrames: compositionRef.durationInFrames,
                defaultProps: compositionRef.defaultProps,
                calculateMetadata: (_a = compositionRef.calculateMetadata) !== null && _a !== void 0 ? _a : undefined,
                id: job.compositionId,
            },
            inputProps: job.inputProps,
            delayRenderTimeoutInMilliseconds: job.delayRenderTimeout,
            mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
            logLevel: job.logLevel,
            videoCodec: job.videoCodec,
            audioCodec: job.audioCodec,
            audioBitrate: job.audioBitrate,
            container: job.container,
            videoBitrate: job.videoBitrate,
            hardwareAcceleration: job.hardwareAcceleration,
            keyframeIntervalInSeconds: job.keyframeIntervalInSeconds,
            frameRange: [job.startFrame, job.endFrame],
            transparent: job.transparent,
            muted: job.muted,
            scale: job.scale,
            signal,
            onProgress: (progress) => {
                onProgress(job.id, {
                    encodedFrames: progress.encodedFrames,
                    totalFrames,
                });
            },
            outputTarget: 'web-fs',
            licenseKey: (_b = job.licenseKey) !== null && _b !== void 0 ? _b : undefined,
        });
        return {
            getBlob,
            width: compositionRef.width,
            height: compositionRef.height,
        };
    }, [getCompositionForJob]);
    const processJob = (0, react_1.useCallback)(async (job) => {
        const abortController = getAbortController(job.id);
        try {
            let result;
            if (job.type === 'client-still') {
                result = await processStillJob(job, abortController.signal);
            }
            else if (job.type === 'client-video') {
                result = await processVideoJob(job, abortController.signal, updateClientJobProgress);
            }
            else {
                throw new Error(`Unknown job type`);
            }
            const blob = await result.getBlob();
            const metadata = {
                width: result.width,
                height: result.height,
                sizeInBytes: blob.size,
            };
            markClientJobSaving(job.id);
            const getBlob = () => Promise.resolve(blob);
            const downloadAndFinish = () => {
                (0, exports.downloadBlob)(blob, job.outName);
                markClientJobDone(job.id, metadata, getBlob);
            };
            if (window.remotion_isReadOnlyStudio) {
                downloadAndFinish();
            }
            else {
                try {
                    await (0, save_render_output_1.saveOutputFile)({ blob, filePath: job.outName });
                    await (0, save_render_output_1.registerClientRender)({
                        id: job.id,
                        type: job.type,
                        compositionId: job.compositionId,
                        outName: job.outName,
                        startedAt: job.startedAt,
                        deletedOutputLocation: false,
                        metadata,
                    });
                    markClientJobDone(job.id, metadata);
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to save render output, falling back to browser download.', err);
                    downloadAndFinish();
                }
            }
        }
        catch (err) {
            if (abortController.signal.aborted) {
                markClientJobCancelled(job.id);
            }
            else {
                markClientJobFailed(job.id, err);
            }
        }
    }, [
        getAbortController,
        processStillJob,
        processVideoJob,
        updateClientJobProgress,
        markClientJobSaving,
        markClientJobDone,
        markClientJobFailed,
        markClientJobCancelled,
    ]);
    (0, react_1.useEffect)(() => {
        setProcessJobCallback(processJob);
        return () => setProcessJobCallback(null);
    }, [processJob, setProcessJobCallback]);
    return null;
};
exports.ClientRenderQueueProcessor = ClientRenderQueueProcessor;
