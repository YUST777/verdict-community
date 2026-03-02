"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDefaultProps = void 0;
const remotion_1 = require("remotion");
const extract_enum_json_paths_1 = require("../components/RenderModal/SchemaEditor/extract-enum-json-paths");
const actions_1 = require("../components/RenderQueue/actions");
const calc_new_props_1 = require("./helpers/calc-new-props");
/*
 * @description Saves the defaultProps for a composition back to the root file.
 * @see [Documentation](https://www.remotion.dev/docs/studio/save-default-props)
 */
const saveDefaultProps = async ({ compositionId, defaultProps, }) => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        throw new Error('saveDefaultProps() is only available in the Studio');
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('saveDefaultProps() is not available in read-only Studio');
    }
    try {
        await Promise.resolve().then(() => __importStar(require('zod')));
    }
    catch (_a) {
        throw new Error('"zod" is required to use saveDefaultProps(), but is not installed.');
    }
    const z = await Promise.resolve().then(() => __importStar(require('zod')));
    let zodTypes = null;
    try {
        zodTypes = await Promise.resolve().then(() => __importStar(require('@remotion/zod-types')));
    }
    catch (_b) { }
    const { generatedDefaultProps, composition } = (0, calc_new_props_1.calcNewProps)(compositionId, defaultProps);
    const res = await (0, actions_1.callUpdateDefaultPropsApi)(compositionId, generatedDefaultProps, composition.schema
        ? (0, extract_enum_json_paths_1.extractEnumJsonPaths)({
            schema: composition.schema,
            zodRuntime: z,
            currentPath: [],
            zodTypes,
        })
        : []);
    if (res.success) {
        return Promise.resolve();
    }
    const err = new Error(res.reason);
    err.stack = res.stack;
    return Promise.reject(err);
};
exports.saveDefaultProps = saveDefaultProps;
