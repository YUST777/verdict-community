"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardMediaParserControllerPauseResume = void 0;
const forwardMediaParserControllerPauseResume = ({ parentController, childController, }) => {
    const onAbort = ({ detail }) => {
        childController.abort(detail.reason);
    };
    const onResume = () => {
        childController.resume();
    };
    const onPause = () => {
        childController.pause();
    };
    parentController.addEventListener('abort', onAbort);
    parentController.addEventListener('resume', onResume);
    parentController.addEventListener('pause', onPause);
    return {
        cleanup: () => {
            parentController.removeEventListener('abort', onAbort);
            parentController.removeEventListener('resume', onResume);
            parentController.removeEventListener('pause', onPause);
        },
    };
};
exports.forwardMediaParserControllerPauseResume = forwardMediaParserControllerPauseResume;
