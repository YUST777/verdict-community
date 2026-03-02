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
exports.screenshot = void 0;
const assert = __importStar(require("node:assert"));
const screenshot_task_1 = require("./screenshot-task");
const screenshot = (options) => {
    if (options.jpegQuality) {
        assert.ok(typeof options.jpegQuality === 'number', 'Expected options.quality to be a number but found ' +
            typeof options.jpegQuality);
        assert.ok(Number.isInteger(options.jpegQuality), 'Expected options.quality to be an integer');
        assert.ok(options.jpegQuality >= 0 && options.jpegQuality <= 100, 'Expected options.quality to be between 0 and 100 (inclusive), got ' +
            options.jpegQuality);
    }
    return options.page.screenshotTaskQueue.postTask(() => (0, screenshot_task_1.screenshotTask)({
        page: options.page,
        format: options.type,
        height: options.height,
        width: options.width,
        omitBackground: options.omitBackground,
        path: options.path,
        jpegQuality: options.type === 'jpeg' ? options.jpegQuality : undefined,
        scale: options.scale,
    }));
};
exports.screenshot = screenshot;
