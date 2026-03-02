"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDefaultProps = void 0;
const remotion_1 = require("remotion");
const calc_new_props_1 = require("./helpers/calc-new-props");
const updateDefaultProps = ({ compositionId, defaultProps, }) => {
    const { generatedDefaultProps, composition } = (0, calc_new_props_1.calcNewProps)(compositionId, defaultProps);
    const propsStore = remotion_1.Internals.editorPropsProviderRef.current;
    if (!propsStore) {
        throw new Error('No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?');
    }
    propsStore.setProps((prev) => {
        return {
            ...prev,
            [composition.id]: generatedDefaultProps,
        };
    });
    window.dispatchEvent(new CustomEvent(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, {
        detail: {
            resetUnsaved: null,
        },
    }));
};
exports.updateDefaultProps = updateDefaultProps;
