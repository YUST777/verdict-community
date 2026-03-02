"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueItemStatus = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const colors_1 = require("../../helpers/colors");
const modals_1 = require("../../state/modals");
const CircularProgress_1 = require("./CircularProgress");
const context_1 = require("./context");
const iconStyle = {
    height: CircularProgress_1.RENDER_STATUS_INDICATOR_SIZE,
    width: CircularProgress_1.RENDER_STATUS_INDICATOR_SIZE,
};
const invisibleStyle = {
    appearance: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
};
const RenderQueueItemStatus = ({ job }) => {
    const { setSelectedModal } = (0, react_1.useContext)(modals_1.ModalsContext);
    const [hovered, setHovered] = react_1.default.useState(false);
    const isClientJob = (0, context_1.isClientRenderJob)(job);
    const onPointerEnter = (0, react_1.useCallback)(() => {
        setHovered(true);
    }, []);
    const onPointerLeave = (0, react_1.useCallback)(() => {
        setHovered(false);
    }, []);
    const onClick = (0, react_1.useCallback)((e) => {
        e.stopPropagation();
        setSelectedModal({
            type: 'render-progress',
            jobId: job.id,
        });
    }, [job.id, setSelectedModal]);
    if (job.status === 'failed') {
        return (jsx_runtime_1.jsx("button", { type: "button", style: invisibleStyle, onClick: onClick, children: jsx_runtime_1.jsx("svg", { style: iconStyle, viewBox: "0 0 512 512", children: jsx_runtime_1.jsx("path", { fill: colors_1.FAIL_COLOR, d: "M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32l-17 17-47 47 47 47 17 17L320 353.9l-17-17-47-47-47 47-17 17L158.1 320l17-17 47-47-47-47-17-17L192 158.1l17 17 47 47 47-47 17-17L353.9 192z" }) }) }));
    }
    if (job.status === 'idle') {
        return (jsx_runtime_1.jsx("svg", { style: iconStyle, viewBox: "0 0 512 512", children: jsx_runtime_1.jsx("path", { fill: colors_1.LIGHT_TEXT, d: "M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" }) }));
    }
    if (job.status === 'done') {
        return (jsx_runtime_1.jsx("button", { type: "button", style: invisibleStyle, onPointerEnter: onPointerEnter, onPointerLeave: onPointerLeave, onClick: onClick, children: jsx_runtime_1.jsx("svg", { style: iconStyle, viewBox: "0 0 512 512", children: jsx_runtime_1.jsx("path", { fill: hovered ? 'white' : colors_1.LIGHT_TEXT, d: "M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM369 209L241 337l-17 17-17-17-64-64-17-17L160 222.1l17 17 47 47L335 175l17-17L385.9 192l-17 17z" }) }) }));
    }
    if (job.status === 'running') {
        let progressValue;
        if (isClientJob) {
            const { encodedFrames, totalFrames } = job.progress;
            progressValue = totalFrames > 0 ? encodedFrames / totalFrames : 0;
        }
        else {
            progressValue = job.progress.value;
        }
        return (jsx_runtime_1.jsx("button", { type: "button", style: invisibleStyle, onClick: onClick, children: jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: Math.max(0.07, progressValue) }) }));
    }
    if (job.status === 'saving') {
        return (jsx_runtime_1.jsx("button", { type: "button", style: invisibleStyle, onClick: onClick, children: jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: 0.95 }) }));
    }
    if (job.status === 'cancelled') {
        return (jsx_runtime_1.jsx("svg", { style: iconStyle, viewBox: "0 0 512 512", children: jsx_runtime_1.jsx("path", { fill: colors_1.FAIL_COLOR, d: "M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32l-17 17-47 47 47 47 17 17L320 353.9l-17-17-47-47-47 47-17 17L158.1 320l17-17 47-47-47-47-17-17L192 158.1l17 17 47 47 47-47 17-17L353.9 192z" }) }));
    }
    throw new Error('Unknown job status');
};
exports.RenderQueueItemStatus = RenderQueueItemStatus;
