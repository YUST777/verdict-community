"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingQueue = processingQueue;
const io_synchronizer_1 = require("./io-manager/io-synchronizer");
function processingQueue({ onOutput, logLevel, label, onError, controller, }) {
    const ioSynchronizer = (0, io_synchronizer_1.makeIoSynchronizer)({
        logLevel,
        label,
        controller,
    });
    let queue = Promise.resolve();
    let stopped = false;
    const input = (item) => {
        if (stopped) {
            return;
        }
        if (controller._internals._mediaParserController._internals.signal.aborted) {
            stopped = true;
            return;
        }
        const { timestamp } = item; // Saving in variable, because timestamp might become nulled
        ioSynchronizer.inputItem(timestamp);
        queue = queue
            .then(() => {
            if (stopped) {
                return;
            }
            if (controller._internals._mediaParserController._internals.signal.aborted) {
                stopped = true;
                return;
            }
            return onOutput(item);
        })
            .then(() => {
            ioSynchronizer.onOutput(timestamp);
            return Promise.resolve();
        })
            .catch((err) => {
            stopped = true;
            onError(err);
        });
    };
    return {
        input,
        ioSynchronizer,
    };
}
