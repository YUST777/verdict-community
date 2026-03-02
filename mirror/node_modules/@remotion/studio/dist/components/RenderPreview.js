"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderPreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_id_1 = require("../helpers/client-id");
const colors_1 = require("../helpers/colors");
const get_asset_metadata_1 = require("../helpers/get-asset-metadata");
const FilePreview_1 = require("./FilePreview");
const Preview_1 = require("./Preview");
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
const RenderPreview = ({ path, assetMetadata, getBlob }) => {
    const fileType = (0, Preview_1.getPreviewFileType)(path);
    const connectionStatus = (0, react_1.useContext)(client_id_1.StudioServerConnectionCtx)
        .previewServerState.type;
    const [blobUrl, setBlobUrl] = (0, react_1.useState)(null);
    const [blobError, setBlobError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!getBlob) {
            setBlobUrl(null);
            setBlobError(null);
            return;
        }
        let cancelled = false;
        let blobUrlToRevoke = null;
        setBlobError(null);
        getBlob()
            .then((blob) => {
            const url = URL.createObjectURL(blob);
            if (cancelled) {
                URL.revokeObjectURL(url);
                return;
            }
            blobUrlToRevoke = url;
            setBlobUrl(url);
        })
            .catch((err) => {
            if (cancelled) {
                return;
            }
            setBlobError(err instanceof Error ? err : new Error(String(err)));
        });
        return () => {
            cancelled = true;
            if (blobUrlToRevoke) {
                URL.revokeObjectURL(blobUrlToRevoke);
            }
        };
    }, [getBlob]);
    const src = blobUrl !== null && blobUrl !== void 0 ? blobUrl : get_asset_metadata_1.remotion_outputsBase + path;
    if (connectionStatus === 'disconnected') {
        return jsx_runtime_1.jsx("div", { style: errMsgStyle, children: "Studio server disconnected" });
    }
    if (getBlob && blobError) {
        return (jsx_runtime_1.jsxs("div", { style: errMsgStyle, children: ["Failed to load preview: ", blobError.message] }));
    }
    if (getBlob && !blobUrl) {
        return jsx_runtime_1.jsx("div", { style: msgStyle, children: "Loading preview..." });
    }
    return (jsx_runtime_1.jsx(FilePreview_1.FilePreview, { assetMetadata: assetMetadata, currentAsset: path, fileType: fileType, src: src }));
};
exports.RenderPreview = RenderPreview;
