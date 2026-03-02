"use strict";
/**
 * @description Restarts the Remotion Studio.
 * @see [Documentation](https://www.remotion.dev/docs/studio/restart-studio)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartStudio = void 0;
const remotion_1 = require("remotion");
const call_api_1 = require("../components/call-api");
const restartStudio = () => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        throw new Error('restartStudio() is only available in the Studio');
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('restartStudio() is not available in read-only Studio');
    }
    return (0, call_api_1.callApi)('/api/restart-studio', {});
};
exports.restartStudio = restartStudio;
