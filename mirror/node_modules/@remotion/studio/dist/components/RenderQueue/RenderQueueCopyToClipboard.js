"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueCopyToClipboard = exports.supportsCopyingToClipboard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const get_asset_metadata_1 = require("../../helpers/get-asset-metadata");
const clipboard_1 = require("../../icons/clipboard");
const InlineAction_1 = require("../InlineAction");
const NotificationCenter_1 = require("../Notifications/NotificationCenter");
const revealIconStyle = {
    height: 12,
    color: 'currentColor',
};
const supportsCopyingToClipboard = (job) => {
    if (job.status !== 'done') {
        return false;
    }
    if (job.type !== 'still') {
        return false;
    }
    if (job.imageFormat === 'png') {
        return true;
    }
    if (job.imageFormat === 'jpeg') {
        return true;
    }
    return false;
};
exports.supportsCopyingToClipboard = supportsCopyingToClipboard;
const RenderQueueCopyToClipboard = ({ job }) => {
    const renderCopyAction = (0, react_1.useCallback)((color) => {
        return jsx_runtime_1.jsx(clipboard_1.ClipboardIcon, { style: revealIconStyle, color: color });
    }, []);
    const onClick = (0, react_1.useCallback)(async (e) => {
        e.stopPropagation();
        try {
            const src = `${get_asset_metadata_1.remotion_outputsBase}/${job.outName}`;
            const content = await fetch(src);
            const contentType = content.headers.get('content-type');
            if (!contentType) {
                throw new Error('Expected content-type header');
            }
            const blob = await content.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [contentType]: blob,
                }),
            ]);
            (0, NotificationCenter_1.showNotification)('Copied to clipboard!', 1000);
        }
        catch (err) {
            (0, NotificationCenter_1.showNotification)(`Could not copy to clipboard: ${err.message}`, 2000);
        }
    }, [job.outName]);
    return (jsx_runtime_1.jsx(InlineAction_1.InlineAction, { title: "Copy to clipboard", renderAction: renderCopyAction, onClick: onClick }));
};
exports.RenderQueueCopyToClipboard = RenderQueueCopyToClipboard;
