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
exports.useLazyComponent = void 0;
const react_1 = __importStar(require("react"));
// Expected, it can be any component props
const useLazyComponent = ({ compProps, componentName, noSuspense, }) => {
    // Why a ref + stable wrapper instead of returning compProps.component directly?
    //
    // When a user edits their component and saves, React Fast Refresh re-executes
    // the module, giving compProps.component a new function reference.
    // Previously, this new reference flowed into useMemo (which depended on
    // compProps.component), producing a new `lazy` value. Composition.tsx then
    // rendered `<Comp />` where Comp had a different identity, so React unmounted
    // the old tree and mounted a fresh one — losing all component state.
    //
    // To fix this, we store the latest component in a ref (updated every render)
    // and return a stable Wrapper from useMemo (created once). React sees the same
    // Wrapper component across Fast Refresh updates, preserves the tree and state,
    // while the ref ensures the Wrapper always delegates to the latest code.
    //
    // To reproduce: use packages/example/src/NewVideo.tsx, edit Component
    // (e.g. change volume={1} to volume={2}) and save. Without this fix,
    // Component would fully remount instead of fast-refreshing in place.
    const componentRef = (0, react_1.useRef)(null);
    if ('component' in compProps) {
        componentRef.current = compProps.component;
    }
    const lazy = (0, react_1.useMemo)(() => {
        if ('component' in compProps) {
            // In SSR, suspense is not yet supported, we cannot use React.lazy
            if (typeof document === 'undefined' || noSuspense) {
                return compProps.component;
            }
            if (typeof compProps.component === 'undefined') {
                throw new Error(`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${componentName}/> component.`);
            }
            const Wrapper = (props) => {
                const Comp = componentRef.current;
                return react_1.default.createElement(Comp, props);
            };
            return Wrapper;
        }
        if ('lazyComponent' in compProps &&
            typeof compProps.lazyComponent !== 'undefined') {
            if (typeof compProps.lazyComponent === 'undefined') {
                throw new Error(`A value of \`undefined\` was passed to the \`lazyComponent\` prop. Check the value you are passing to the <${componentName}/> component.`);
            }
            return react_1.default.lazy(compProps.lazyComponent);
        }
        throw new Error("You must pass either 'component' or 'lazyComponent'");
        // Very important to leave the dependencies as they are, or instead
        // the player will remount on every frame.
        // For the 'component' case, we intentionally do NOT depend on
        // compProps.component — the stable wrapper reads from componentRef instead.
        // @ts-expect-error
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compProps.lazyComponent]);
    return lazy;
};
exports.useLazyComponent = useLazyComponent;
