"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveCompositionConfigInStudio = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const fast_refresh_context_1 = require("./fast-refresh-context");
const ResolveCompositionConfigInStudio = ({ children }) => {
    const [currentRenderModalComposition, setCurrentRenderModalComposition] = (0, react_1.useState)(null);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const { fastRefreshes, manualRefreshes } = (0, react_1.useContext)(fast_refresh_context_1.FastRefreshContext);
    // don't do anything, this component should should re-render if the value changes
    if (manualRefreshes) {
        /** */
    }
    const selectedComposition = (0, react_1.useMemo)(() => {
        return compositions.find((c) => canvasContent &&
            canvasContent.type === 'composition' &&
            canvasContent.compositionId === c.id);
    }, [canvasContent, compositions]);
    const renderModalComposition = compositions.find((c) => c.id === currentRenderModalComposition);
    const { props: allEditorProps } = (0, react_1.useContext)(remotion_1.Internals.EditorPropsContext);
    const env = remotion_1.Internals.getRemotionEnvironment();
    const inputProps = (0, react_1.useMemo)(() => {
        var _a;
        return typeof window === 'undefined' || env.isPlayer
            ? {}
            : ((_a = (0, remotion_1.getInputProps)()) !== null && _a !== void 0 ? _a : {});
    }, [env.isPlayer]);
    const [resolvedConfigs, setResolvedConfigs] = (0, react_1.useState)({});
    const selectedEditorProps = (0, react_1.useMemo)(() => {
        var _a;
        return selectedComposition
            ? ((_a = allEditorProps[selectedComposition.id]) !== null && _a !== void 0 ? _a : {})
            : {};
    }, [allEditorProps, selectedComposition]);
    const renderModalProps = (0, react_1.useMemo)(() => {
        var _a;
        return renderModalComposition
            ? ((_a = allEditorProps[renderModalComposition.id]) !== null && _a !== void 0 ? _a : {})
            : {};
    }, [allEditorProps, renderModalComposition]);
    const hasResolution = Boolean(currentCompositionMetadata);
    const doResolution = (0, react_1.useCallback)(({ calculateMetadata, combinedProps, compositionDurationInFrames, compositionFps, compositionHeight, compositionId, compositionWidth, defaultProps, }) => {
        const controller = new AbortController();
        if (hasResolution) {
            return controller;
        }
        const { signal } = controller;
        const result = remotion_1.Internals.resolveVideoConfigOrCatch({
            compositionId,
            calculateMetadata: calculateMetadata,
            inputProps: combinedProps,
            signal,
            defaultProps,
            compositionDurationInFrames,
            compositionFps,
            compositionHeight,
            compositionWidth,
        });
        if (result.type === 'error') {
            setResolvedConfigs((r) => ({
                ...r,
                [compositionId]: {
                    type: 'error',
                    error: result.error,
                },
            }));
            return controller;
        }
        const promOrNot = result.result;
        if (typeof promOrNot === 'object' && 'then' in promOrNot) {
            setResolvedConfigs((r) => {
                const prev = r[compositionId];
                if ((prev === null || prev === void 0 ? void 0 : prev.type) === 'success' ||
                    (prev === null || prev === void 0 ? void 0 : prev.type) === 'success-and-refreshing') {
                    return {
                        ...r,
                        [compositionId]: {
                            type: 'success-and-refreshing',
                            result: prev.result,
                        },
                    };
                }
                return {
                    ...r,
                    [compositionId]: {
                        type: 'loading',
                    },
                };
            });
            promOrNot
                .then((c) => {
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r) => ({
                    ...r,
                    [compositionId]: {
                        type: 'success',
                        result: c,
                    },
                }));
            })
                .catch((err) => {
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r) => ({
                    ...r,
                    [compositionId]: {
                        type: 'error',
                        error: err,
                    },
                }));
            });
        }
        else {
            setResolvedConfigs((r) => ({
                ...r,
                [compositionId]: {
                    type: 'success',
                    result: promOrNot,
                },
            }));
        }
        return controller;
    }, [hasResolution]);
    const currentComposition = (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'composition' ? canvasContent.compositionId : null;
    (0, react_1.useImperativeHandle)(remotion_1.Internals.resolveCompositionsRef, () => {
        return {
            setCurrentRenderModalComposition: (id) => {
                setCurrentRenderModalComposition(id);
            },
            reloadCurrentlySelectedComposition: () => {
                var _a, _b, _c, _d, _e, _f;
                if (!currentComposition) {
                    return;
                }
                const composition = compositions.find((c) => c.id === currentComposition);
                if (!composition) {
                    throw new Error(`Could not find composition with id ${currentComposition}`);
                }
                const editorProps = (_a = allEditorProps[currentComposition]) !== null && _a !== void 0 ? _a : {};
                const defaultProps = {
                    ...((_b = composition.defaultProps) !== null && _b !== void 0 ? _b : {}),
                    ...(editorProps !== null && editorProps !== void 0 ? editorProps : {}),
                };
                const props = {
                    ...defaultProps,
                    ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
                };
                doResolution({
                    defaultProps,
                    calculateMetadata: composition.calculateMetadata,
                    combinedProps: props,
                    compositionDurationInFrames: (_c = composition.durationInFrames) !== null && _c !== void 0 ? _c : null,
                    compositionFps: (_d = composition.fps) !== null && _d !== void 0 ? _d : null,
                    compositionHeight: (_e = composition.height) !== null && _e !== void 0 ? _e : null,
                    compositionWidth: (_f = composition.width) !== null && _f !== void 0 ? _f : null,
                    compositionId: composition.id,
                });
            },
        };
    }, [
        allEditorProps,
        compositions,
        currentComposition,
        doResolution,
        inputProps,
    ]);
    const isTheSame = (selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.id) === (renderModalComposition === null || renderModalComposition === void 0 ? void 0 : renderModalComposition.id);
    const currentDefaultProps = (0, react_1.useMemo)(() => {
        var _a;
        return {
            ...((_a = selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.defaultProps) !== null && _a !== void 0 ? _a : {}),
            ...(selectedEditorProps !== null && selectedEditorProps !== void 0 ? selectedEditorProps : {}),
        };
    }, [selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.defaultProps, selectedEditorProps]);
    const originalProps = (0, react_1.useMemo)(() => {
        return {
            ...currentDefaultProps,
            ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
        };
    }, [currentDefaultProps, inputProps]);
    const canResolve = selectedComposition && Boolean(selectedComposition.calculateMetadata);
    const shouldIgnoreUpdate = typeof window !== 'undefined' &&
        window.remotion_ignoreFastRefreshUpdate &&
        fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d;
        if (shouldIgnoreUpdate) {
            return;
        }
        if (canResolve) {
            const controller = doResolution({
                calculateMetadata: selectedComposition.calculateMetadata,
                combinedProps: originalProps,
                compositionDurationInFrames: (_a = selectedComposition.durationInFrames) !== null && _a !== void 0 ? _a : null,
                compositionFps: (_b = selectedComposition.fps) !== null && _b !== void 0 ? _b : null,
                compositionHeight: (_c = selectedComposition.height) !== null && _c !== void 0 ? _c : null,
                compositionWidth: (_d = selectedComposition.width) !== null && _d !== void 0 ? _d : null,
                defaultProps: currentDefaultProps,
                compositionId: selectedComposition.id,
            });
            return () => {
                controller.abort();
            };
        }
    }, [
        canResolve,
        currentDefaultProps,
        doResolution,
        originalProps,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.calculateMetadata,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.durationInFrames,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.fps,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.height,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.id,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.width,
        shouldIgnoreUpdate,
    ]);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e;
        if (renderModalComposition && !isTheSame) {
            const combinedProps = {
                ...((_a = renderModalComposition.defaultProps) !== null && _a !== void 0 ? _a : {}),
                ...(renderModalProps !== null && renderModalProps !== void 0 ? renderModalProps : {}),
                ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
            };
            const controller = doResolution({
                calculateMetadata: renderModalComposition.calculateMetadata,
                compositionDurationInFrames: (_b = renderModalComposition.durationInFrames) !== null && _b !== void 0 ? _b : null,
                compositionFps: (_c = renderModalComposition.fps) !== null && _c !== void 0 ? _c : null,
                compositionHeight: (_d = renderModalComposition.height) !== null && _d !== void 0 ? _d : null,
                compositionId: renderModalComposition.id,
                compositionWidth: (_e = renderModalComposition.width) !== null && _e !== void 0 ? _e : null,
                defaultProps: currentDefaultProps,
                combinedProps,
            });
            return () => {
                controller.abort();
            };
        }
    }, [
        currentDefaultProps,
        doResolution,
        inputProps,
        isTheSame,
        renderModalComposition,
        renderModalProps,
    ]);
    const resolvedConfigsIncludingStaticOnes = (0, react_1.useMemo)(() => {
        const staticComps = compositions.filter((c) => {
            return c.calculateMetadata === null;
        });
        return {
            ...resolvedConfigs,
            ...staticComps.reduce((acc, curr) => {
                var _a;
                return {
                    ...acc,
                    [curr.id]: {
                        type: 'success',
                        result: { ...curr, defaultProps: (_a = curr.defaultProps) !== null && _a !== void 0 ? _a : {} },
                    },
                };
            }, {}),
        };
    }, [compositions, resolvedConfigs]);
    return (jsx_runtime_1.jsx(remotion_1.Internals.ResolveCompositionContext.Provider, { value: resolvedConfigsIncludingStaticOnes, children: children }));
};
exports.ResolveCompositionConfigInStudio = ResolveCompositionConfigInStudio;
