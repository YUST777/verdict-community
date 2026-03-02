"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openOriginalPositionInEditor = exports.openInEditor = void 0;
const openInEditor = (stack) => {
    const { originalFileName, originalLineNumber, originalColumnNumber, originalFunctionName, originalScriptCode, } = stack;
    return fetch(`/api/open-in-editor`, {
        method: 'post',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            stack: {
                originalFileName,
                originalLineNumber,
                originalColumnNumber,
                originalFunctionName,
                originalScriptCode,
            },
        }),
    });
};
exports.openInEditor = openInEditor;
const openOriginalPositionInEditor = async (originalPosition) => {
    await (0, exports.openInEditor)({
        originalColumnNumber: originalPosition.column,
        originalFileName: originalPosition.source,
        originalFunctionName: null,
        originalLineNumber: originalPosition.line,
        originalScriptCode: null,
    });
};
exports.openOriginalPositionInEditor = openOriginalPositionInEditor;
