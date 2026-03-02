"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcNewProps = void 0;
const remotion_1 = require("remotion");
const calcNewProps = (compositionId, defaultProps) => {
    var _a, _b;
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        throw new Error('saveDefaultProps can only be called in the Remotion Studio.');
    }
    const { compositionsRef, editorPropsProviderRef } = remotion_1.Internals;
    const compositionsStore = compositionsRef.current;
    if (!compositionsStore) {
        throw new Error('No compositions ref found. Are you in the Remotion Studio and are the Remotion versions aligned?');
    }
    const compositions = compositionsStore.getCompositions();
    const composition = compositions.find((c) => c.id === compositionId);
    if (!composition) {
        throw new Error(`No composition with the ID ${compositionId} found. Available compositions: ${compositions.map((c) => c.id).join(', ')}`);
    }
    const propsStore = editorPropsProviderRef.current;
    if (!propsStore) {
        throw new Error('No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?');
    }
    const savedDefaultProps = (_a = composition.defaultProps) !== null && _a !== void 0 ? _a : {};
    const unsavedDefaultProps = (_b = propsStore.getProps()[compositionId]) !== null && _b !== void 0 ? _b : savedDefaultProps;
    const generatedDefaultProps = defaultProps({
        schema: composition.schema,
        savedDefaultProps,
        unsavedDefaultProps,
    });
    return {
        composition,
        generatedDefaultProps,
    };
};
exports.calcNewProps = calcNewProps;
