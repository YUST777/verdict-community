"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnIfRemotionLicenseNotAcknowledged = void 0;
const log_1 = require("./log");
let warningShown = false;
const warnIfRemotionLicenseNotAcknowledged = ({ acknowledgeRemotionLicense, logLevel, apiName, }) => {
    if (acknowledgeRemotionLicense) {
        return;
    }
    if (warningShown) {
        return;
    }
    warningShown = true;
    log_1.Log.warn(logLevel, `Note: Some companies are required to obtain a license to use @remotion/media-parser. See: https://remotion.dev/license\nPass \`acknowledgeRemotionLicense: true\` to \`${apiName}\` function to make this message disappear.`);
};
exports.warnIfRemotionLicenseNotAcknowledged = warnIfRemotionLicenseNotAcknowledged;
