"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWindowedAudioData = void 0;
const mediabunny_1 = require("mediabunny");
const react_1 = require("react");
const remotion_1 = require("remotion");
const combine_float32_arrays_1 = require("./combine-float32-arrays");
const get_partial_audio_data_1 = require("./get-partial-audio-data");
const is_remote_asset_1 = require("./is-remote-asset");
const warnedMatroska = {};
const useWindowedAudioData = ({ src, frame, fps, windowInSeconds, channelIndex = 0, }) => {
    const isMounted = (0, react_1.useRef)(true);
    const [audioUtils, setAudioUtils] = (0, react_1.useState)(null);
    const [waveFormMap, setWaveformMap] = (0, react_1.useState)({});
    const requests = (0, react_1.useRef)({});
    const [initialWindowInSeconds] = (0, react_1.useState)(windowInSeconds);
    if (windowInSeconds !== initialWindowInSeconds) {
        throw new Error('windowInSeconds cannot be changed dynamically');
    }
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            Object.values(requests.current).forEach((controller) => {
                if (controller) {
                    controller.abort();
                }
            });
            requests.current = {};
            setWaveformMap({});
            if (audioUtils) {
                audioUtils.input.dispose();
            }
        };
    }, [audioUtils]);
    const { delayRender, continueRender } = (0, remotion_1.useDelayRender)();
    const fetchMetadata = (0, react_1.useCallback)(async (signal) => {
        const handle = delayRender(`Waiting for audio metadata with src="${src}" to be loaded`);
        const cont = () => {
            continueRender(handle);
        };
        signal.addEventListener('abort', cont, { once: true });
        const input = new mediabunny_1.Input({
            formats: mediabunny_1.ALL_FORMATS,
            source: new mediabunny_1.UrlSource(src),
        });
        const onAbort = () => {
            input.dispose();
        };
        signal.addEventListener('abort', onAbort, { once: true });
        try {
            const durationInSeconds = await input.computeDuration();
            const audioTrack = await input.getPrimaryAudioTrack();
            if (!audioTrack) {
                throw new Error('No audio track found');
            }
            const canDecode = await audioTrack.canDecode();
            if (!canDecode) {
                throw new Error('Audio track cannot be decoded');
            }
            if (channelIndex >= audioTrack.numberOfChannels || channelIndex < 0) {
                throw new Error(`Invalid channel index ${channelIndex} for audio with ${audioTrack.numberOfChannels} channels`);
            }
            const { numberOfChannels, sampleRate } = audioTrack;
            const format = await input.getFormat();
            const isMatroska = format === mediabunny_1.MATROSKA || format === mediabunny_1.WEBM;
            if (isMounted.current) {
                setAudioUtils({
                    input,
                    track: audioTrack,
                    metadata: {
                        durationInSeconds,
                        numberOfChannels,
                        sampleRate,
                    },
                    isMatroska,
                });
            }
            continueRender(handle);
        }
        catch (err) {
            (0, remotion_1.cancelRender)(err);
        }
        finally {
            signal.removeEventListener('abort', cont);
            signal.removeEventListener('abort', onAbort);
        }
    }, [src, delayRender, continueRender, channelIndex]);
    (0, react_1.useLayoutEffect)(() => {
        const controller = new AbortController();
        fetchMetadata(controller.signal);
        return () => {
            controller.abort();
        };
    }, [fetchMetadata]);
    const currentTime = frame / fps;
    const currentWindowIndex = Math.floor(currentTime / windowInSeconds);
    const windowsToFetch = (0, react_1.useMemo)(() => {
        if (!(audioUtils === null || audioUtils === void 0 ? void 0 : audioUtils.metadata)) {
            return [];
        }
        const maxWindowIndex = Math.floor(
        // If an audio is exactly divisible by windowInSeconds, we need to
        // subtract 0.000000000001 to avoid fetching an extra window.
        audioUtils.metadata.durationInSeconds / windowInSeconds - 0.000000000001);
        // needs to be in order because we rely on the concatenation below
        return [
            currentWindowIndex === 0 ? null : currentWindowIndex - 1,
            currentWindowIndex,
            currentWindowIndex + 1 > maxWindowIndex ? null : currentWindowIndex + 1,
        ]
            .filter((i) => i !== null)
            .filter((i) => i >= 0);
    }, [currentWindowIndex, audioUtils, windowInSeconds]);
    const fetchAndSetWaveformData = (0, react_1.useCallback)(async (windowIndex) => {
        if (!(audioUtils === null || audioUtils === void 0 ? void 0 : audioUtils.metadata) || !audioUtils) {
            throw new Error('MediaBunny context is not loaded yet');
        }
        // Cancel any existing request for this window, we don't want to over-fetch
        const existingController = requests.current[windowIndex];
        if (existingController) {
            existingController.abort();
        }
        const controller = new AbortController();
        requests.current[windowIndex] = controller;
        if (controller.signal.aborted) {
            return;
        }
        const fromSeconds = windowIndex * windowInSeconds;
        const toSeconds = (windowIndex + 1) * windowInSeconds;
        // if both fromSeconds and toSeconds are outside of the audio duration, skip fetching
        if (fromSeconds >= audioUtils.metadata.durationInSeconds ||
            toSeconds <= 0) {
            return;
        }
        try {
            const { isMatroska } = audioUtils;
            if (isMatroska && !warnedMatroska[src]) {
                warnedMatroska[src] = true;
                remotion_1.Internals.Log.warn({ logLevel: 'info', tag: '@remotion/media-utils' }, `[useWindowedAudioData] Matroska/WebM file detected at "${src}".\n\nDue to format limitation, audio decoding must start from the beginning of the file, which may lead to increased memory usage and slower performance for large files. Consider converting the audio to a more suitable format like MP3 or AAC for better performance.`);
            }
            const partialWaveData = await (0, get_partial_audio_data_1.getPartialAudioData)({
                track: audioUtils.track,
                fromSeconds,
                toSeconds,
                channelIndex,
                signal: controller.signal,
                isMatroska,
            });
            if (!controller.signal.aborted) {
                setWaveformMap((prev) => {
                    const entries = Object.keys(prev);
                    const windowsToClear = entries.filter((entry) => !windowsToFetch.includes(Number(entry)));
                    return {
                        ...prev,
                        ...windowsToClear.reduce((acc, key) => {
                            acc[key] = null;
                            return acc;
                        }, {}),
                        [windowIndex]: partialWaveData,
                    };
                });
            }
        }
        catch (err) {
            if (controller.signal.aborted) {
                return;
            }
            if (err instanceof mediabunny_1.InputDisposedError) {
                return;
            }
            throw err;
        }
        finally {
            if (requests.current[windowIndex] === controller) {
                requests.current[windowIndex] = null;
            }
        }
    }, [channelIndex, audioUtils, windowInSeconds, windowsToFetch, src]);
    (0, react_1.useEffect)(() => {
        if (!(audioUtils === null || audioUtils === void 0 ? void 0 : audioUtils.metadata)) {
            return;
        }
        const windowsToClear = Object.keys(requests.current).filter((entry) => !windowsToFetch.includes(Number(entry)));
        for (const windowIndex of windowsToClear) {
            const controller = requests.current[windowIndex];
            if (controller) {
                controller.abort();
                requests.current[windowIndex] = null;
            }
        }
        // Only fetch windows that don't already exist
        const windowsToActuallyFetch = windowsToFetch.filter((windowIndex) => !waveFormMap[windowIndex] && !requests.current[windowIndex]);
        if (windowsToActuallyFetch.length === 0) {
            return;
        }
        // Prioritize the current window where playback is at.
        // On slow connections, this ensures the most important window loads first.
        const currentWindowNeedsFetch = windowsToActuallyFetch.includes(currentWindowIndex);
        const otherWindowsToFetch = windowsToActuallyFetch.filter((w) => w !== currentWindowIndex);
        const fetchWindows = async () => {
            // First, load the current window where playback is at
            if (currentWindowNeedsFetch) {
                await fetchAndSetWaveformData(currentWindowIndex);
            }
            // Then load the surrounding windows in parallel
            if (otherWindowsToFetch.length > 0) {
                await Promise.all(otherWindowsToFetch.map((windowIndex) => {
                    return fetchAndSetWaveformData(windowIndex);
                }));
            }
        };
        fetchWindows().catch((err) => {
            var _a, _b, _c, _d, _e;
            if ((_a = err.stack) === null || _a === void 0 ? void 0 : _a.includes('Cancelled')) {
                return;
            }
            if ((_c = (_b = err.stack) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === null || _c === void 0 ? void 0 : _c.includes('aborted')) {
                return;
            }
            // firefox
            if ((_e = (_d = err.message) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === null || _e === void 0 ? void 0 : _e.includes('aborted')) {
                return;
            }
            (0, remotion_1.cancelRender)(err);
        });
    }, [
        fetchAndSetWaveformData,
        audioUtils,
        windowsToFetch,
        waveFormMap,
        currentWindowIndex,
    ]);
    // Calculate available windows for reuse
    const availableWindows = (0, react_1.useMemo)(() => {
        return windowsToFetch.filter((i) => waveFormMap[i]);
    }, [windowsToFetch, waveFormMap]);
    const currentAudioData = (0, react_1.useMemo)(() => {
        if (!(audioUtils === null || audioUtils === void 0 ? void 0 : audioUtils.metadata)) {
            return null;
        }
        if (availableWindows.length === 0) {
            return null;
        }
        const windows = availableWindows.map((i) => waveFormMap[i]);
        const data = (0, combine_float32_arrays_1.combineFloat32Arrays)(windows);
        return {
            channelWaveforms: [data],
            durationInSeconds: audioUtils.metadata.durationInSeconds,
            isRemote: (0, is_remote_asset_1.isRemoteAsset)(src),
            numberOfChannels: 1,
            resultId: `${src}-windows-${availableWindows.join(',')}`,
            sampleRate: audioUtils.metadata.sampleRate,
        };
    }, [src, waveFormMap, audioUtils, availableWindows]);
    const isBeyondAudioDuration = audioUtils
        ? currentTime >= audioUtils.metadata.durationInSeconds
        : false;
    (0, react_1.useLayoutEffect)(() => {
        if (currentAudioData) {
            return;
        }
        if (isBeyondAudioDuration) {
            return;
        }
        const handle = delayRender(`Waiting for audio data with src="${src}" to be loaded`);
        return () => {
            continueRender(handle);
        };
    }, [
        currentAudioData,
        src,
        delayRender,
        continueRender,
        isBeyondAudioDuration,
    ]);
    const audioData = isBeyondAudioDuration ? null : currentAudioData;
    return {
        audioData,
        dataOffsetInSeconds: availableWindows.length > 0 ? availableWindows[0] * windowInSeconds : 0,
    };
};
exports.useWindowedAudioData = useWindowedAudioData;
