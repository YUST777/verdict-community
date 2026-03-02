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
exports.useStaticFiles = exports.StaticFilesProvider = void 0;
const react_1 = __importStar(require("react"));
const remotion_1 = require("remotion");
const get_static_files_1 = require("../api/get-static-files");
const watch_public_folder_1 = require("../api/watch-public-folder");
const StaticFilesContext = (0, react_1.createContext)([]);
const StaticFilesProvider = ({ children }) => {
    const [files, setFiles] = (0, react_1.useState)(() => (0, get_static_files_1.getStaticFiles)());
    const env = (0, remotion_1.useRemotionEnvironment)();
    (0, react_1.useEffect)(() => {
        if (!env.isStudio) {
            return;
        }
        if (env.isReadOnlyStudio) {
            return;
        }
        const { cancel } = (0, watch_public_folder_1.watchPublicFolder)((newFiles) => {
            setFiles(newFiles);
        });
        return cancel;
    }, [env.isStudio, env.isReadOnlyStudio]);
    return react_1.default.createElement(StaticFilesContext.Provider, { value: files }, children);
};
exports.StaticFilesProvider = StaticFilesProvider;
const useStaticFiles = () => {
    return (0, react_1.useContext)(StaticFilesContext);
};
exports.useStaticFiles = useStaticFiles;
