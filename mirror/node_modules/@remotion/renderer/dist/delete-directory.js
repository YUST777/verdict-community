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
exports.deleteDirectory = void 0;
const node_fs_1 = __importStar(require("node:fs"));
const is_serve_url_1 = require("./is-serve-url");
const deleteDirectory = (directory) => {
    if ((0, is_serve_url_1.isServeUrl)(directory)) {
        return;
    }
    if (!(0, node_fs_1.existsSync)(directory)) {
        return;
    }
    // Working around a bug with NodeJS 16 on Windows:
    // If a subdirectory is already deleted, it will fail with EPERM
    // even with force: true and recursive and maxRetries set higher.
    // This is even with the fixWinEPERMSync function being called by Node.JS.
    // This is a workaround for this issue.
    let retries = 2;
    while (retries >= 0) {
        try {
            node_fs_1.default.rmSync(directory, {
                maxRetries: 2,
                recursive: true,
                force: true,
                retryDelay: 100,
            });
        }
        catch (_a) {
            retries--;
            continue;
        }
        break;
    }
};
exports.deleteDirectory = deleteDirectory;
