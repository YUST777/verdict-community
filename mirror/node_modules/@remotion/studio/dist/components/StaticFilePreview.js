"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticFilePreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const client_id_1 = require("../helpers/client-id");
const colors_1 = require("../helpers/colors");
const FilePreview_1 = require("./FilePreview");
const Preview_1 = require("./Preview");
const use_static_files_1 = require("./use-static-files");
const msgStyle = {
    fontSize: 13,
    color: 'white',
    fontFamily: 'sans-serif',
    display: 'flex',
    justifyContent: 'center',
};
const errMsgStyle = {
    ...msgStyle,
    color: colors_1.LIGHT_TEXT,
};
const StaticFilePreview = ({ currentAsset, assetMetadata }) => {
    const fileType = (0, Preview_1.getPreviewFileType)(currentAsset);
    const staticFileSrc = (0, remotion_1.staticFile)(currentAsset);
    const staticFiles = (0, use_static_files_1.useStaticFiles)();
    const connectionStatus = (0, react_1.useContext)(client_id_1.StudioServerConnectionCtx)
        .previewServerState.type;
    const exists = staticFiles.find((file) => file.name === currentAsset);
    if (connectionStatus === 'disconnected') {
        return jsx_runtime_1.jsx("div", { style: errMsgStyle, children: "Studio server disconnected" });
    }
    if (!exists) {
        return (jsx_runtime_1.jsxs("div", { style: errMsgStyle, children: [currentAsset, " does not exist in your public folder."] }));
    }
    if (!currentAsset) {
        return null;
    }
    return (jsx_runtime_1.jsx(FilePreview_1.FilePreview, { currentAsset: currentAsset, fileType: fileType, src: `${staticFileSrc}?date=${assetMetadata && assetMetadata.type === 'found' ? assetMetadata.fetchedAt : 0}`, assetMetadata: assetMetadata }));
};
exports.StaticFilePreview = StaticFilePreview;
