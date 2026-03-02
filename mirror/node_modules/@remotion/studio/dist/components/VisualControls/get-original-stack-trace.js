"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOriginalFileName = void 0;
const react_1 = require("react");
const get_stack_1 = require("../Timeline/TimelineStack/get-stack");
const useOriginalFileName = (stack) => {
    const [originalFileName, setOriginalFileName] = (0, react_1.useState)({ type: 'loading' });
    (0, react_1.useEffect)(() => {
        if (!stack) {
            return;
        }
        (0, get_stack_1.getOriginalLocationFromStack)(stack, 'visual-control')
            .then((frame) => {
            if (frame === null) {
                setOriginalFileName({
                    type: 'error',
                    error: new Error('No frame found'),
                });
            }
            else {
                setOriginalFileName({ type: 'loaded', originalFileName: frame });
            }
        })
            .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('Could not get original location of Sequence', err);
        });
    }, [stack]);
    return originalFileName;
};
exports.useOriginalFileName = useOriginalFileName;
