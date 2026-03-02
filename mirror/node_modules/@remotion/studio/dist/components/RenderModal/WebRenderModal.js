"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRenderModalWithLoader = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const studio_shared_1 = require("@remotion/studio-shared");
const web_renderer_1 = require("@remotion/web-renderer");
const react_1 = require("react");
const ShortcutHint_1 = require("../../error-overlay/remotion-overlay/ShortcutHint");
const audio_1 = require("../../icons/audio");
const certificate_1 = require("../../icons/certificate");
const data_1 = require("../../icons/data");
const file_1 = require("../../icons/file");
const frame_1 = require("../../icons/frame");
const gear_1 = require("../../icons/gear");
const modals_1 = require("../../state/modals");
const sidebar_1 = require("../../state/sidebar");
const Button_1 = require("../Button");
const is_menu_item_1 = require("../Menu/is-menu-item");
const ModalHeader_1 = require("../ModalHeader");
const DismissableModal_1 = require("../NewComposition/DismissableModal");
const OptionsPanel_1 = require("../OptionsPanel");
const context_1 = require("../RenderQueue/context");
const SegmentedControl_1 = require("../SegmentedControl");
const vertical_1 = require("../Tabs/vertical");
const DataEditor_1 = require("./DataEditor");
const get_string_before_suffix_1 = require("./get-string-before-suffix");
const render_modals_1 = require("./render-modals");
const ResolveCompositionBeforeModal_1 = require("./ResolveCompositionBeforeModal");
const use_encodable_audio_codecs_1 = require("./use-encodable-audio-codecs");
const use_encodable_video_codecs_1 = require("./use-encodable-video-codecs");
const WebRendererExperimentalBadge_1 = require("./WebRendererExperimentalBadge");
const WebRenderModalAdvanced_1 = require("./WebRenderModalAdvanced");
const WebRenderModalAudio_1 = require("./WebRenderModalAudio");
const WebRenderModalBasic_1 = require("./WebRenderModalBasic");
const WebRenderModalLicense_1 = require("./WebRenderModalLicense");
const WebRenderModalPicture_1 = require("./WebRenderModalPicture");
const invalidCharacters = ['?', '*', '+', ':', '%'];
const isValidStillExtension = (extension, stillImageFormat) => {
    if (stillImageFormat === 'jpeg' && extension === 'jpg') {
        return true;
    }
    return extension === stillImageFormat;
};
const validateOutnameForStill = ({ outName, stillImageFormat, }) => {
    try {
        const extension = outName.substring(outName.lastIndexOf('.') + 1);
        const prefix = outName.substring(0, outName.lastIndexOf('.'));
        const hasDotAfterSlash = () => {
            const substrings = prefix.split('/');
            for (const str of substrings) {
                if (str[0] === '.') {
                    return true;
                }
            }
            return false;
        };
        const hasInvalidChar = () => {
            return prefix.split('').some((char) => invalidCharacters.includes(char));
        };
        if (prefix.length < 1) {
            throw new Error('The prefix must be at least 1 character long');
        }
        if (prefix[0] === '.' || hasDotAfterSlash()) {
            throw new Error('The output name must not start with a dot');
        }
        if (hasInvalidChar()) {
            throw new Error("Filename can't contain the following characters:  ?, *, +, %, :");
        }
        if (!isValidStillExtension(extension, stillImageFormat)) {
            throw new Error(`The extension ${extension} is not supported for still image format ${stillImageFormat}`);
        }
        return { valid: true };
    }
    catch (err) {
        return { valid: false, error: err };
    }
};
// TODO: Switch to server-side rendering
// TODO: Filter out codecs that are not supported for the container
// TODO: Add more containers
// TODO: Shortcut: Shift + R
// TODO: Apply defaultCodec
// TODO: Apply defaultOutName
const WebRenderModal = ({ initialFrame, defaultProps, inFrameMark, outFrameMark, initialLogLevel, initialLicenseKey, initialStillImageFormat, initialDefaultOutName, initialScale, initialDelayRenderTimeout, initialMediaCacheSizeInBytes, initialContainer, initialVideoCodec, initialAudioCodec, initialAudioBitrate, initialVideoBitrate, initialHardwareAcceleration, initialKeyframeIntervalInSeconds, initialTransparent, initialMuted, }) => {
    var _a;
    const context = (0, react_1.useContext)(ResolveCompositionBeforeModal_1.ResolvedCompositionContext);
    const { setSelectedModal } = (0, react_1.useContext)(modals_1.ModalsContext);
    const { setSidebarCollapsedState } = (0, react_1.useContext)(sidebar_1.SidebarContext);
    const { addClientStillJob, addClientVideoJob } = (0, react_1.useContext)(context_1.RenderQueueContext);
    if (!context) {
        throw new Error('Should not be able to render without resolving comp first');
    }
    const { resolved: { result: resolvedComposition }, unresolved: unresolvedComposition, } = context;
    const [isVideo] = (0, react_1.useState)(() => {
        return typeof resolvedComposition.durationInFrames === 'undefined'
            ? true
            : resolvedComposition.durationInFrames > 1;
    });
    const [renderMode, setRenderMode] = (0, react_1.useState)(isVideo ? 'video' : 'still');
    const [tab, setTab] = (0, react_1.useState)('general');
    const [imageFormat, setImageFormat] = (0, react_1.useState)(() => initialStillImageFormat !== null && initialStillImageFormat !== void 0 ? initialStillImageFormat : 'png');
    const [frame, setFrame] = (0, react_1.useState)(() => initialFrame);
    const [logLevel, setLogLevel] = (0, react_1.useState)(() => initialLogLevel);
    const [inputProps, setInputProps] = (0, react_1.useState)(() => defaultProps);
    const [delayRenderTimeout, setDelayRenderTimeout] = (0, react_1.useState)(initialDelayRenderTimeout !== null && initialDelayRenderTimeout !== void 0 ? initialDelayRenderTimeout : 30000);
    const [mediaCacheSizeInBytes, setMediaCacheSizeInBytes] = (0, react_1.useState)(initialMediaCacheSizeInBytes);
    const [saving, setSaving] = (0, react_1.useState)(false);
    // Video-specific state
    const [codec, setCodec] = (0, react_1.useState)(initialVideoCodec !== null && initialVideoCodec !== void 0 ? initialVideoCodec : 'h264');
    const [container, setContainer] = (0, react_1.useState)(initialContainer !== null && initialContainer !== void 0 ? initialContainer : 'mp4');
    const [audioCodec, setAudioCodec] = (0, react_1.useState)(initialAudioCodec !== null && initialAudioCodec !== void 0 ? initialAudioCodec : 'aac');
    const [audioBitrate, setAudioBitrate] = (0, react_1.useState)(initialAudioBitrate !== null && initialAudioBitrate !== void 0 ? initialAudioBitrate : 'medium');
    const [videoBitrate, setVideoBitrate] = (0, react_1.useState)(initialVideoBitrate !== null && initialVideoBitrate !== void 0 ? initialVideoBitrate : 'high');
    const [hardwareAcceleration, setHardwareAcceleration] = (0, react_1.useState)((_a = initialHardwareAcceleration) !== null && _a !== void 0 ? _a : 'no-preference');
    const [keyframeIntervalInSeconds, setKeyframeIntervalInSeconds] = (0, react_1.useState)(initialKeyframeIntervalInSeconds !== null && initialKeyframeIntervalInSeconds !== void 0 ? initialKeyframeIntervalInSeconds : 5);
    const [startFrame, setStartFrame] = (0, react_1.useState)(() => inFrameMark);
    const [endFrame, setEndFrame] = (0, react_1.useState)(() => outFrameMark);
    const [transparent, setTransparent] = (0, react_1.useState)(initialTransparent !== null && initialTransparent !== void 0 ? initialTransparent : false);
    const [muted, setMuted] = (0, react_1.useState)(initialMuted !== null && initialMuted !== void 0 ? initialMuted : false);
    const [scale, setScale] = (0, react_1.useState)(initialScale !== null && initialScale !== void 0 ? initialScale : 1);
    const [licenseKey, setLicenseKey] = (0, react_1.useState)(initialLicenseKey);
    const encodableAudioCodecs = (0, use_encodable_audio_codecs_1.useEncodableAudioCodecs)(container);
    const encodableVideoCodecs = (0, use_encodable_video_codecs_1.useEncodableVideoCodecs)(container);
    const effectiveAudioCodec = (0, react_1.useMemo)(() => {
        var _a;
        if (encodableAudioCodecs.includes(audioCodec)) {
            return audioCodec;
        }
        return (_a = encodableAudioCodecs[0]) !== null && _a !== void 0 ? _a : audioCodec;
    }, [audioCodec, encodableAudioCodecs]);
    const effectiveVideoCodec = (0, react_1.useMemo)(() => {
        var _a;
        if (encodableVideoCodecs.includes(codec)) {
            return codec;
        }
        return (_a = encodableVideoCodecs[0]) !== null && _a !== void 0 ? _a : codec;
    }, [codec, encodableVideoCodecs]);
    const finalEndFrame = (0, react_1.useMemo)(() => {
        if (endFrame === null) {
            return resolvedComposition.durationInFrames - 1;
        }
        return Math.max(0, Math.min(resolvedComposition.durationInFrames - 1, endFrame));
    }, [endFrame, resolvedComposition.durationInFrames]);
    const finalStartFrame = (0, react_1.useMemo)(() => {
        if (startFrame === null) {
            return 0;
        }
        return Math.max(0, Math.min(finalEndFrame, startFrame));
    }, [finalEndFrame, startFrame]);
    const [initialOutNameState] = (0, react_1.useState)(() => {
        var _a;
        var _b;
        if (initialDefaultOutName) {
            return initialDefaultOutName;
        }
        const defaultOut = (0, studio_shared_1.getDefaultOutLocation)({
            compositionName: resolvedComposition.id,
            defaultExtension: renderMode === 'still'
                ? imageFormat
                : isVideo
                    ? container
                    : imageFormat,
            type: 'asset',
            compositionDefaultOutName: resolvedComposition.defaultOutName,
            outputLocation: (_b = (_a = window.remotion_renderDefaults) === null || _a === void 0 ? void 0 : _a.outputLocation) !== null && _b !== void 0 ? _b : null,
        });
        if (window.remotion_isReadOnlyStudio) {
            return defaultOut.replace(/^out\//, '');
        }
        return defaultOut;
    });
    const [outName, setOutName] = (0, react_1.useState)(() => initialOutNameState);
    const setStillFormat = (0, react_1.useCallback)((format) => {
        setImageFormat(format);
        setOutName((prev) => {
            const newFileName = (0, get_string_before_suffix_1.getStringBeforeSuffix)(prev) + '.' + format;
            return newFileName;
        });
    }, []);
    const setContainerFormat = (0, react_1.useCallback)((newContainer) => {
        setContainer(newContainer);
        setAudioCodec((0, web_renderer_1.getDefaultAudioCodecForContainer)(newContainer));
        setOutName((prev) => {
            const newFileName = (0, get_string_before_suffix_1.getStringBeforeSuffix)(prev) + '.' + newContainer;
            return newFileName;
        });
    }, []);
    const onRenderModeChange = (0, react_1.useCallback)((newMode) => {
        setRenderMode(newMode);
        if (newMode === 'video') {
            setOutName((prev) => {
                const newFileName = (0, get_string_before_suffix_1.getStringBeforeSuffix)(prev) + '.' + container;
                return newFileName;
            });
        }
        else if (newMode === 'still') {
            setOutName((prev) => {
                const newFileName = (0, get_string_before_suffix_1.getStringBeforeSuffix)(prev) + '.' + imageFormat;
                return newFileName;
            });
        }
    }, [container, imageFormat]);
    const renderTabOptions = (0, react_1.useMemo)(() => {
        const options = [
            {
                label: 'Still',
                onClick: () => {
                    onRenderModeChange('still');
                },
                key: 'still',
                selected: renderMode === 'still',
            },
        ];
        // Only show video option if composition has more than 1 frame
        if (resolvedComposition.durationInFrames > 1) {
            options.push({
                label: 'Video',
                onClick: () => {
                    onRenderModeChange('video');
                },
                key: 'video',
                selected: renderMode === 'video',
            });
        }
        return options;
    }, [renderMode, resolvedComposition.durationInFrames, onRenderModeChange]);
    const onFrameSetDirectly = (0, react_1.useCallback)((newFrame) => {
        setFrame(newFrame);
    }, [setFrame]);
    const onFrameChanged = (0, react_1.useCallback)((e) => {
        setFrame((q) => {
            const newFrame = parseFloat(e);
            if (Number.isNaN(newFrame)) {
                return q;
            }
            return newFrame;
        });
    }, [setFrame]);
    const onOutNameChange = (0, react_1.useCallback)((e) => {
        setOutName(e.target.value);
    }, []);
    const outnameValidation = (0, react_1.useMemo)(() => {
        if (renderMode === 'still') {
            return validateOutnameForStill({
                outName,
                stillImageFormat: imageFormat,
            });
        }
        // Validate for video
        try {
            const extension = outName.substring(outName.lastIndexOf('.') + 1);
            const prefix = outName.substring(0, outName.lastIndexOf('.'));
            const hasDotAfterSlash = () => {
                const substrings = prefix.split('/');
                for (const str of substrings) {
                    if (str[0] === '.') {
                        return true;
                    }
                }
                return false;
            };
            const hasInvalidChar = () => {
                return prefix
                    .split('')
                    .some((char) => invalidCharacters.includes(char));
            };
            if (prefix.length < 1) {
                throw new Error('The prefix must be at least 1 character long');
            }
            if (prefix[0] === '.' || hasDotAfterSlash()) {
                throw new Error('The output name must not start with a dot');
            }
            if (hasInvalidChar()) {
                throw new Error("Filename can't contain the following characters:  ?, *, +, %, :");
            }
            if (extension !== container) {
                throw new Error(`The extension ${extension} is not supported for container format ${container}`);
            }
            return { valid: true };
        }
        catch (err) {
            return { valid: false, error: err };
        }
    }, [outName, imageFormat, renderMode, container]);
    const onAddToQueue = (0, react_1.useCallback)(() => {
        var _a;
        var _b;
        const compositionRef = {
            component: unresolvedComposition.component,
            calculateMetadata: (_b = unresolvedComposition.calculateMetadata) !== null && _b !== void 0 ? _b : null,
            width: resolvedComposition.width,
            height: resolvedComposition.height,
            fps: resolvedComposition.fps,
            durationInFrames: resolvedComposition.durationInFrames,
            defaultProps: resolvedComposition.defaultProps,
        };
        if (renderMode === 'still') {
            addClientStillJob({
                type: 'client-still',
                compositionId: resolvedComposition.id,
                outName,
                imageFormat,
                frame,
                inputProps,
                delayRenderTimeout,
                mediaCacheSizeInBytes,
                logLevel,
                licenseKey,
                scale,
            }, compositionRef);
        }
        else {
            addClientVideoJob({
                type: 'client-video',
                compositionId: resolvedComposition.id,
                outName,
                container,
                videoCodec: effectiveVideoCodec,
                audioCodec: effectiveAudioCodec,
                startFrame: finalStartFrame,
                endFrame: finalEndFrame,
                audioBitrate,
                videoBitrate,
                hardwareAcceleration,
                keyframeIntervalInSeconds,
                transparent,
                muted,
                inputProps,
                delayRenderTimeout,
                mediaCacheSizeInBytes,
                logLevel,
                licenseKey,
                scale,
            }, compositionRef);
        }
        setSidebarCollapsedState({ left: null, right: 'expanded' });
        (0, OptionsPanel_1.persistSelectedOptionsSidebarPanel)('renders');
        (_a = OptionsPanel_1.optionsSidebarTabs.current) === null || _a === void 0 ? void 0 : _a.selectRendersPanel();
        setSelectedModal(null);
    }, [
        renderMode,
        unresolvedComposition.component,
        unresolvedComposition.calculateMetadata,
        resolvedComposition.width,
        resolvedComposition.height,
        resolvedComposition.fps,
        resolvedComposition.durationInFrames,
        resolvedComposition.defaultProps,
        resolvedComposition.id,
        setSidebarCollapsedState,
        outName,
        imageFormat,
        frame,
        inputProps,
        delayRenderTimeout,
        mediaCacheSizeInBytes,
        logLevel,
        licenseKey,
        container,
        effectiveVideoCodec,
        effectiveAudioCodec,
        finalStartFrame,
        finalEndFrame,
        audioBitrate,
        videoBitrate,
        hardwareAcceleration,
        keyframeIntervalInSeconds,
        transparent,
        muted,
        setSelectedModal,
        addClientStillJob,
        addClientVideoJob,
        scale,
    ]);
    return (jsx_runtime_1.jsxs("div", { style: render_modals_1.outerModalStyle, children: [
            jsx_runtime_1.jsx(ModalHeader_1.ModalHeader, { title: `Render ${resolvedComposition.id}` }), jsx_runtime_1.jsxs("div", { style: render_modals_1.container, children: [
                    jsx_runtime_1.jsx(SegmentedControl_1.SegmentedControl, { items: renderTabOptions, needsWrapping: false }), jsx_runtime_1.jsx("div", { style: render_modals_1.flexer }), jsx_runtime_1.jsxs(Button_1.Button, { autoFocus: true, onClick: onAddToQueue, style: render_modals_1.buttonStyle, disabled: !outnameValidation.valid, children: ["Render ", renderMode, jsx_runtime_1.jsx(ShortcutHint_1.ShortcutHint, { keyToPress: "\u21B5", cmdOrCtrl: true })
                        ] })
                ] }), jsx_runtime_1.jsx("div", { style: render_modals_1.container, children: jsx_runtime_1.jsx(WebRendererExperimentalBadge_1.WebRendererExperimentalBadge, {}) }), jsx_runtime_1.jsxs("div", { style: render_modals_1.horizontalLayout, children: [
                    jsx_runtime_1.jsxs("div", { style: render_modals_1.leftSidebar, children: [
                            jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'general', onClick: () => setTab('general'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(file_1.FileIcon, { style: render_modals_1.icon }) }),
                                    "General"] }), jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'data', onClick: () => setTab('data'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(data_1.DataIcon, { style: render_modals_1.icon }) }),
                                    "Input Props"] }), jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'picture', onClick: () => setTab('picture'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(frame_1.PicIcon, { style: render_modals_1.icon }) }),
                                    "Picture"] }), renderMode === 'video' ? (jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'audio', onClick: () => setTab('audio'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(audio_1.AudioIcon, { style: render_modals_1.icon }) }),
                                    "Audio"] })) : null, jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'advanced', onClick: () => setTab('advanced'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(gear_1.GearIcon, { style: render_modals_1.icon }) }),
                                    "Other"] }), jsx_runtime_1.jsxs(vertical_1.VerticalTab, { style: render_modals_1.horizontalTab, selected: tab === 'license', onClick: () => setTab('license'), children: [
                                    jsx_runtime_1.jsx("div", { style: render_modals_1.iconContainer, children: jsx_runtime_1.jsx(certificate_1.CertificateIcon, { style: render_modals_1.icon }) }),
                                    "License"] })
                        ] }), jsx_runtime_1.jsx("div", { style: render_modals_1.optionsPanel, className: is_menu_item_1.VERTICAL_SCROLLBAR_CLASSNAME, children: tab === 'general' ? (jsx_runtime_1.jsx(WebRenderModalBasic_1.WebRenderModalBasic, { renderMode: renderMode, resolvedComposition: resolvedComposition, imageFormat: imageFormat, setStillFormat: setStillFormat, frame: frame, onFrameChanged: onFrameChanged, onFrameSetDirectly: onFrameSetDirectly, container: container, setContainerFormat: setContainerFormat, setCodec: setCodec, encodableVideoCodecs: encodableVideoCodecs, effectiveVideoCodec: effectiveVideoCodec, startFrame: finalStartFrame, setStartFrame: setStartFrame, endFrame: finalEndFrame, setEndFrame: setEndFrame, outName: outName, onOutNameChange: onOutNameChange, validationMessage: outnameValidation.valid ? null : outnameValidation.error.message, logLevel: logLevel, setLogLevel: setLogLevel })) : tab === 'data' ? (jsx_runtime_1.jsx(DataEditor_1.DataEditor, { defaultProps: inputProps, setDefaultProps: setInputProps, unresolvedComposition: unresolvedComposition, mayShowSaveButton: false, propsEditType: "input-props", saving: saving, setSaving: setSaving, readOnlyStudio: false })) : tab === 'picture' ? (jsx_runtime_1.jsx(WebRenderModalPicture_1.WebRenderModalPicture, { renderMode: renderMode, videoBitrate: videoBitrate, setVideoBitrate: setVideoBitrate, keyframeIntervalInSeconds: keyframeIntervalInSeconds, setKeyframeIntervalInSeconds: setKeyframeIntervalInSeconds, transparent: transparent, setTransparent: setTransparent, scale: scale, setScale: setScale, compositionWidth: resolvedComposition.width, compositionHeight: resolvedComposition.height })) : tab === 'audio' ? (jsx_runtime_1.jsx(WebRenderModalAudio_1.WebRenderModalAudio, { muted: muted, setMuted: setMuted, audioCodec: audioCodec, setAudioCodec: setAudioCodec, audioBitrate: audioBitrate, setAudioBitrate: setAudioBitrate, container: container, encodableCodecs: encodableAudioCodecs, effectiveAudioCodec: effectiveAudioCodec })) : tab === 'advanced' ? (jsx_runtime_1.jsx(WebRenderModalAdvanced_1.WebRenderModalAdvanced, { renderMode: renderMode, delayRenderTimeout: delayRenderTimeout, setDelayRenderTimeout: setDelayRenderTimeout, mediaCacheSizeInBytes: mediaCacheSizeInBytes, setMediaCacheSizeInBytes: setMediaCacheSizeInBytes, hardwareAcceleration: hardwareAcceleration, setHardwareAcceleration: setHardwareAcceleration })) : (jsx_runtime_1.jsx(WebRenderModalLicense_1.WebRenderModalLicense, { licenseKey: licenseKey, setLicenseKey: setLicenseKey, initialPublicLicenseKey: initialLicenseKey })) })
                ] })
        ] }));
};
const WebRenderModalWithLoader = (props) => {
    return (jsx_runtime_1.jsx(DismissableModal_1.DismissableModal, { children: jsx_runtime_1.jsx(ResolveCompositionBeforeModal_1.ResolveCompositionBeforeModal, { compositionId: props.compositionId, children: jsx_runtime_1.jsx(WebRenderModal, { ...props }) }) }));
};
exports.WebRenderModalWithLoader = WebRenderModalWithLoader;
