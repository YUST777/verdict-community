"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskAiModal = exports.askAiModalRef = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const ModalContainer_1 = require("./ModalContainer");
const ModalHeader_1 = require("./ModalHeader");
const container = {
    height: 'calc(100vh - 100px)',
    width: 'calc(100vw - 160px)',
    maxWidth: 800,
    maxHeight: 900,
    display: 'block',
};
exports.askAiModalRef = (0, react_1.createRef)();
const AskAiModal = () => {
    const [state, setState] = (0, react_1.useState)('never-opened');
    const iframe = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(exports.askAiModalRef, () => ({
        toggle: () => {
            setState((s) => {
                var _a, _b, _c;
                if (s === 'visible') {
                    (_a = iframe.current) === null || _a === void 0 ? void 0 : _a.blur();
                    (_c = (_b = iframe.current) === null || _b === void 0 ? void 0 : _b.contentWindow) === null || _c === void 0 ? void 0 : _c.blur();
                }
                return s === 'visible' ? 'hidden' : 'visible';
            });
        },
    }), []);
    (0, react_1.useEffect)(() => {
        const onMessage = (event) => {
            var _a;
            try {
                const json = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (json.type === 'cmd-i') {
                    (_a = exports.askAiModalRef.current) === null || _a === void 0 ? void 0 : _a.toggle();
                }
            }
            catch (_b) { }
        };
        window.addEventListener('message', onMessage);
        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, []);
    const onQuit = (0, react_1.useCallback)(() => {
        setState('hidden');
    }, [setState]);
    // When re-toggling the modal, focus the text box
    (0, react_1.useEffect)(() => {
        var _a;
        if (!iframe.current) {
            return;
        }
        if (state === 'visible') {
            (_a = iframe.current.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                type: 'focus',
            }, '*');
        }
    }, [state]);
    if (state === 'never-opened') {
        return null;
    }
    return (jsx_runtime_1.jsx(remotion_1.AbsoluteFill, { style: { display: state === 'visible' ? 'block' : 'none' }, children: jsx_runtime_1.jsxs(ModalContainer_1.ModalContainer, { noZIndex: state === 'hidden', onOutsideClick: onQuit, onEscape: onQuit, children: [
                jsx_runtime_1.jsx(ModalHeader_1.ModalHeader, { title: "Ask AI", onClose: onQuit }), jsx_runtime_1.jsx("iframe", { ref: iframe, frameBorder: 0, style: container, src: "https://www.remotion.dev/ai-embed", allow: "clipboard-read; clipboard-write" })
            ] }) }));
};
exports.AskAiModal = AskAiModal;
