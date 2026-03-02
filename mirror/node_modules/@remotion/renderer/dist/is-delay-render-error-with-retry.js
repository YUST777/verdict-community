"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetriesLeftFromError = void 0;
const no_react_1 = require("remotion/no-react");
const getRetriesLeftFromError = (error) => {
    if (!error) {
        throw new Error('Expected stack');
    }
    const { stack } = error;
    if (!stack) {
        throw new Error('Expected stack: ' + JSON.stringify(error));
    }
    const beforeIndex = stack.indexOf(no_react_1.NoReactInternals.DELAY_RENDER_ATTEMPT_TOKEN);
    if (beforeIndex === -1) {
        throw new Error('Expected to find attempt token in stack');
    }
    const afterIndex = stack.indexOf(no_react_1.NoReactInternals.DELAY_RENDER_RETRY_TOKEN);
    if (afterIndex === -1) {
        throw new Error('Expected to find retry token in stack');
    }
    const inbetween = stack.substring(beforeIndex + no_react_1.NoReactInternals.DELAY_RENDER_ATTEMPT_TOKEN.length, afterIndex);
    const parsed = Number(inbetween);
    if (Number.isNaN(parsed)) {
        throw new Error(`Expected to find a number in the stack ${stack}`);
    }
    return parsed;
};
exports.getRetriesLeftFromError = getRetriesLeftFromError;
