"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const jsx_dev_runtime_1 = __importDefault(require("react/jsx-dev-runtime"));
const jsx_runtime_1 = __importDefault(require("react/jsx-runtime"));
const remotion_1 = require("remotion");
const componentsToAddStacksTo = remotion_1.Internals.getComponentsToAddStacksTo();
const originalCreateElement = react_1.default.createElement;
const originalJsx = jsx_runtime_1.default.jsx;
const originalJsxDev = jsx_dev_runtime_1.default.jsxDEV;
const enableProxy = (api) => {
    return new Proxy(api, {
        apply(target, thisArg, argArray) {
            if (componentsToAddStacksTo.includes(argArray[0])) {
                const [first, props, ...rest] = argArray;
                const newProps = props.stack
                    ? props
                    : {
                        ...(props !== null && props !== void 0 ? props : {}),
                        stack: new Error().stack,
                    };
                return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
            }
            return Reflect.apply(target, thisArg, argArray);
        },
    });
};
react_1.default.createElement = enableProxy(originalCreateElement);
jsx_runtime_1.default.jsx = enableProxy(originalJsx);
jsx_dev_runtime_1.default.jsxDEV = enableProxy(originalJsxDev);
