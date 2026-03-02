"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTimelineSetInOutFramePosition = exports.useTimelineInOutFramePosition = exports.SetTimelineInOutContext = exports.TimelineInOutContext = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
exports.TimelineInOutContext = (0, react_1.createContext)({});
exports.SetTimelineInOutContext = (0, react_1.createContext)({
    setInAndOutFrames: () => {
        throw new Error('default');
    },
});
const useTimelineInOutFramePosition = () => {
    const videoConfig = remotion_1.Internals.useUnsafeVideoConfig();
    const state = (0, react_1.useContext)(exports.TimelineInOutContext);
    const id = videoConfig === null || videoConfig === void 0 ? void 0 : videoConfig.id;
    const durationInFrames = videoConfig === null || videoConfig === void 0 ? void 0 : videoConfig.durationInFrames;
    return (0, react_1.useMemo)(() => {
        var _a, _b;
        var _c, _d;
        if (!id || !durationInFrames) {
            return { inFrame: null, outFrame: null };
        }
        const maxFrame = durationInFrames - 1;
        const actualInFrame = (_c = (_a = state[id]) === null || _a === void 0 ? void 0 : _a.inFrame) !== null && _c !== void 0 ? _c : null;
        const actualOutFrame = (_d = (_b = state[id]) === null || _b === void 0 ? void 0 : _b.outFrame) !== null && _d !== void 0 ? _d : null;
        return {
            inFrame: actualInFrame === null
                ? null
                : actualInFrame >= maxFrame
                    ? null
                    : actualInFrame,
            outFrame: actualOutFrame === null
                ? null
                : actualOutFrame >= maxFrame
                    ? null
                    : actualOutFrame,
        };
    }, [durationInFrames, id, state]);
};
exports.useTimelineInOutFramePosition = useTimelineInOutFramePosition;
const useTimelineSetInOutFramePosition = () => {
    const { setInAndOutFrames } = (0, react_1.useContext)(exports.SetTimelineInOutContext);
    return { setInAndOutFrames };
};
exports.useTimelineSetInOutFramePosition = useTimelineSetInOutFramePosition;
