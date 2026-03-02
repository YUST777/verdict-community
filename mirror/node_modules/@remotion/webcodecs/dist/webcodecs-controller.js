"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webcodecsController = void 0;
const media_parser_1 = require("@remotion/media-parser");
const webcodecsController = () => {
    const controller = (0, media_parser_1.mediaParserController)();
    return {
        abort: controller.abort,
        pause: controller.pause,
        resume: controller.resume,
        addEventListener: controller.addEventListener,
        removeEventListener: controller.removeEventListener,
        _internals: { _mediaParserController: controller },
    };
};
exports.webcodecsController = webcodecsController;
