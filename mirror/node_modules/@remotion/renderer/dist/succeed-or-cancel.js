"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.succeedOrCancel = void 0;
const succeedOrCancel = ({ happyPath, cancelSignal, cancelMessage, }) => {
    if (!cancelSignal) {
        return happyPath;
    }
    let resolveCancel = () => undefined;
    const cancelProm = new Promise((_resolve, reject) => {
        cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
            resolveCancel = _resolve;
            reject(new Error(cancelMessage));
        });
    });
    return Promise.race([
        happyPath.then((result) => {
            process.nextTick(() => resolveCancel === null || resolveCancel === void 0 ? void 0 : resolveCancel(undefined));
            return result;
        }),
        cancelProm,
    ]);
};
exports.succeedOrCancel = succeedOrCancel;
