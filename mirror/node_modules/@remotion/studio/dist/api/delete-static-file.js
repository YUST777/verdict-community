"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaticFile = void 0;
const remotion_1 = require("remotion");
const call_api_1 = require("../components/call-api");
const deleteStaticFile = async (relativePath) => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        throw new Error('deleteStaticFile() is only available in the Studio');
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('deleteStaticFile() is not available in Read-Only Studio');
    }
    if (relativePath.startsWith(window.remotion_staticBase)) {
        relativePath = relativePath.substring(window.remotion_staticBase.length + 1);
    }
    const res = await (0, call_api_1.callApi)('/api/delete-static-file', { relativePath });
    return res;
};
exports.deleteStaticFile = deleteStaticFile;
