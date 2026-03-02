"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedPlayerContexts = exports.PLAYER_COMP_ID = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const volume_persistance_js_1 = require("./volume-persistance.js");
exports.PLAYER_COMP_ID = 'player-comp';
const SharedPlayerContexts = ({ children, timelineContext, fps, compositionHeight, compositionWidth, durationInFrames, component, numberOfSharedAudioTags, initiallyMuted, logLevel, audioLatencyHint, volumePersistenceKey, inputProps, audioEnabled, }) => {
    const compositionManagerContext = (0, react_1.useMemo)(() => {
        const context = {
            compositions: [
                {
                    component: component,
                    durationInFrames,
                    height: compositionHeight,
                    width: compositionWidth,
                    fps,
                    id: exports.PLAYER_COMP_ID,
                    nonce: 777,
                    folderName: null,
                    parentFolderName: null,
                    schema: null,
                    calculateMetadata: null,
                },
            ],
            folders: [],
            currentCompositionMetadata: {
                defaultCodec: null,
                defaultOutName: null,
                defaultPixelFormat: null,
                defaultProResProfile: null,
                defaultVideoImageFormat: null,
                durationInFrames,
                fps,
                height: compositionHeight,
                width: compositionWidth,
                props: inputProps,
            },
            canvasContent: { type: 'composition', compositionId: 'player-comp' },
        };
        return context;
    }, [
        component,
        durationInFrames,
        compositionHeight,
        compositionWidth,
        fps,
        inputProps,
    ]);
    const [mediaMuted, setMediaMuted] = (0, react_1.useState)(() => initiallyMuted);
    const [mediaVolume, setMediaVolume] = (0, react_1.useState)(() => (0, volume_persistance_js_1.getPreferredVolume)(volumePersistenceKey !== null && volumePersistenceKey !== void 0 ? volumePersistenceKey : null));
    const mediaVolumeContextValue = (0, react_1.useMemo)(() => {
        return {
            mediaMuted,
            mediaVolume,
        };
    }, [mediaMuted, mediaVolume]);
    const setMediaVolumeAndPersist = (0, react_1.useCallback)((vol) => {
        setMediaVolume(vol);
        (0, volume_persistance_js_1.persistVolume)(vol, logLevel, volumePersistenceKey !== null && volumePersistenceKey !== void 0 ? volumePersistenceKey : null);
    }, [logLevel, volumePersistenceKey]);
    const setMediaVolumeContextValue = (0, react_1.useMemo)(() => {
        return {
            setMediaMuted,
            setMediaVolume: setMediaVolumeAndPersist,
        };
    }, [setMediaVolumeAndPersist]);
    const logLevelContext = (0, react_1.useMemo)(() => {
        return {
            logLevel,
            mountTime: Date.now(),
        };
    }, [logLevel]);
    const env = (0, react_1.useMemo)(() => {
        return {
            isPlayer: true,
            isRendering: false,
            isStudio: false,
            isClientSideRendering: false,
            isReadOnlyStudio: false,
        };
    }, []);
    return (jsx_runtime_1.jsx(remotion_1.Internals.RemotionEnvironmentContext.Provider, { value: env, children: jsx_runtime_1.jsx(remotion_1.Internals.LogLevelContext.Provider, { value: logLevelContext, children: jsx_runtime_1.jsx(remotion_1.Internals.CanUseRemotionHooksProvider, { children: jsx_runtime_1.jsx(remotion_1.Internals.TimelineContext.Provider, { value: timelineContext, children: jsx_runtime_1.jsx(remotion_1.Internals.CompositionManager.Provider, { value: compositionManagerContext, children: jsx_runtime_1.jsx(remotion_1.Internals.PrefetchProvider, { children: jsx_runtime_1.jsx(remotion_1.Internals.DurationsContextProvider, { children: jsx_runtime_1.jsx(remotion_1.Internals.MediaVolumeContext.Provider, { value: mediaVolumeContextValue, children: jsx_runtime_1.jsx(remotion_1.Internals.SetMediaVolumeContext.Provider, { value: setMediaVolumeContextValue, children: jsx_runtime_1.jsx(remotion_1.Internals.SharedAudioContextProvider, { numberOfAudioTags: numberOfSharedAudioTags, audioLatencyHint: audioLatencyHint, audioEnabled: audioEnabled, children: jsx_runtime_1.jsx(remotion_1.Internals.BufferingProvider, { children: children }) }) }) }) }) }) }) }) }) }) }));
};
exports.SharedPlayerContexts = SharedPlayerContexts;
