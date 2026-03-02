"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeRemotionLicenseMessage = void 0;
const remotion_1 = require("remotion");
let warningShown = false;
const acknowledgeRemotionLicenseMessage = (acknowledge, logLevel) => {
    if (acknowledge) {
        return;
    }
    if (warningShown) {
        return;
    }
    warningShown = true;
    remotion_1.Internals.Log.warn({ logLevel, tag: null }, 'Note: Some companies are required to obtain a license to use Remotion. See: https://remotion.dev/license\nPass the `acknowledgeRemotionLicense` prop to `<Player />` function to make this message disappear.');
};
exports.acknowledgeRemotionLicenseMessage = acknowledgeRemotionLicenseMessage;
