"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPackages = void 0;
const remotion_1 = require("remotion");
const call_api_1 = require("../components/call-api");
const installPackages = (packageNames) => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        throw new Error('installPackages() is only available in the Studio');
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('installPackages() is not available in Read-Only Studio');
    }
    return (0, call_api_1.callApi)('/api/install-package', { packageNames });
};
exports.installPackages = installPackages;
