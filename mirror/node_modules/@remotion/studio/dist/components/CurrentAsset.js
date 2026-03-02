"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentAsset = exports.CURRENT_ASSET_HEIGHT = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const studio_shared_1 = require("@remotion/studio-shared");
const mediabunny_1 = require("mediabunny");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../helpers/colors");
const use_static_files_1 = require("./use-static-files");
exports.CURRENT_ASSET_HEIGHT = 80;
const container = {
    height: exports.CURRENT_ASSET_HEIGHT,
    display: 'block',
    borderBottom: `1px solid ${colors_1.BORDER_COLOR}`,
    padding: 12,
    color: 'white',
    backgroundColor: colors_1.BACKGROUND,
};
const title = {
    fontWeight: 'bold',
    fontSize: 12,
    whiteSpace: 'nowrap',
    lineHeight: '18px',
    backgroundColor: colors_1.BACKGROUND,
};
const subtitle = {
    fontSize: 12,
    opacity: 0.8,
    whiteSpace: 'nowrap',
    lineHeight: '18px',
    backgroundColor: colors_1.BACKGROUND,
};
const row = {
    display: 'flex',
    flexDirection: 'row',
    lineHeight: '18px',
    backgroundColor: colors_1.BACKGROUND,
};
const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const sFixed = s.toFixed(2).padStart(5, '0');
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${sFixed}`;
    }
    return `${String(m).padStart(2, '0')}:${sFixed}`;
};
const CurrentAsset = () => {
    var _a;
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const assetName = (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'asset' ? canvasContent.asset : null;
    const staticFiles = (0, use_static_files_1.useStaticFiles)();
    const sizeInBytes = (0, react_1.useMemo)(() => {
        var _a;
        if (!assetName) {
            return null;
        }
        const file = staticFiles.find((f) => f.name === assetName);
        return (_a = file === null || file === void 0 ? void 0 : file.sizeInBytes) !== null && _a !== void 0 ? _a : null;
    }, [assetName, staticFiles]);
    const [mediaMetadata, setMediaMetadata] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        setMediaMetadata(null);
        if (!assetName) {
            return;
        }
        const url = (0, remotion_1.staticFile)(assetName);
        const input = new mediabunny_1.Input({
            formats: mediabunny_1.ALL_FORMATS,
            source: new mediabunny_1.UrlSource(url),
        });
        Promise.all([
            input.computeDuration(),
            input.getFormat(),
            input.getPrimaryVideoTrack(),
        ])
            .then(([duration, format, videoTrack]) => {
            var _a, _b;
            setMediaMetadata({
                duration,
                format: format.name,
                width: (_a = videoTrack === null || videoTrack === void 0 ? void 0 : videoTrack.displayWidth) !== null && _a !== void 0 ? _a : null,
                height: (_b = videoTrack === null || videoTrack === void 0 ? void 0 : videoTrack.displayHeight) !== null && _b !== void 0 ? _b : null,
            });
        })
            .catch(() => {
            // InputDisposedError (user navigated away) and
            // non-media files (e.g. .png, .json) — ignore silently
        });
        return () => {
            input.dispose();
        };
    }, [assetName]);
    if (!assetName) {
        return jsx_runtime_1.jsx("div", { style: container });
    }
    const fileName = (_a = assetName.split('/').pop()) !== null && _a !== void 0 ? _a : assetName;
    const subtitleParts = [];
    if (sizeInBytes !== null) {
        subtitleParts.push((0, studio_shared_1.formatBytes)(sizeInBytes));
    }
    if (mediaMetadata) {
        subtitleParts.push(mediaMetadata.format);
        if (mediaMetadata.width !== null && mediaMetadata.height !== null) {
            subtitleParts.push(`${mediaMetadata.width}x${mediaMetadata.height}`);
        }
    }
    return (jsx_runtime_1.jsx("div", { style: container, children: jsx_runtime_1.jsx("div", { style: row, children: jsx_runtime_1.jsxs("div", { children: [
                    jsx_runtime_1.jsx("div", { style: title, children: fileName }), subtitleParts.length > 0 ? (jsx_runtime_1.jsx("div", { style: subtitle, children: subtitleParts.join(' · ') })) : null, mediaMetadata ? (jsx_runtime_1.jsx("div", { style: subtitle, children: formatDuration(mediaMetadata.duration) })) : null] }) }) }));
};
exports.CurrentAsset = CurrentAsset;
