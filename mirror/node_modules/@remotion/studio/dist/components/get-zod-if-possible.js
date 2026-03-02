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
exports.ZodProvider = exports.useZodTypesIfPossible = exports.useZodV3IfPossible = exports.getZTypesIfPossible = exports.getZodV3IfPossible = void 0;
exports.getZodIfPossible = getZodIfPossible;
exports.useZodIfPossible = useZodIfPossible;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
async function getZodIfPossible() {
    try {
        const { z } = await Promise.resolve().then(() => __importStar(require('zod')));
        return z;
    }
    catch (_a) {
        return null;
    }
}
const getZodV3IfPossible = async () => {
    try {
        const mod = await Promise.resolve().then(() => __importStar(require('zod/v3')));
        return mod;
    }
    catch (_a) {
        return null;
    }
};
exports.getZodV3IfPossible = getZodV3IfPossible;
const getZTypesIfPossible = async () => {
    try {
        const mod = await Promise.resolve().then(() => __importStar(require('@remotion/zod-types')));
        return mod;
    }
    catch (_a) {
        return null;
    }
};
exports.getZTypesIfPossible = getZTypesIfPossible;
function useZodIfPossible() {
    var _a;
    const context = (0, react_1.useContext)(ZodContext);
    return (_a = context === null || context === void 0 ? void 0 : context.zod) !== null && _a !== void 0 ? _a : null;
}
const useZodV3IfPossible = () => {
    var _a;
    const context = (0, react_1.useContext)(ZodContext);
    return (_a = context === null || context === void 0 ? void 0 : context.zodV3) !== null && _a !== void 0 ? _a : null;
};
exports.useZodV3IfPossible = useZodV3IfPossible;
const useZodTypesIfPossible = () => {
    var _a;
    const context = (0, react_1.useContext)(ZodContext);
    return (_a = context === null || context === void 0 ? void 0 : context.zodTypes) !== null && _a !== void 0 ? _a : null;
};
exports.useZodTypesIfPossible = useZodTypesIfPossible;
const ZodContext = (0, react_1.createContext)(null);
const ZodProvider = ({ children }) => {
    const [zod, setZod] = (0, react_1.useState)(null);
    const [zodV3, setZodV3] = (0, react_1.useState)(null);
    const [zodTypes, setZodTypes] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        getZodIfPossible().then((z) => setZod(z));
    }, []);
    (0, react_1.useEffect)(() => {
        (0, exports.getZodV3IfPossible)().then((z) => setZodV3(z));
    }, []);
    (0, react_1.useEffect)(() => {
        (0, exports.getZTypesIfPossible)().then((z) => setZodTypes(z));
    }, []);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            zod,
            zodV3,
            zodTypes,
        };
    }, [zod, zodV3, zodTypes]);
    return (jsx_runtime_1.jsx(ZodContext.Provider, { value: contextValue, children: children }));
};
exports.ZodProvider = ZodProvider;
