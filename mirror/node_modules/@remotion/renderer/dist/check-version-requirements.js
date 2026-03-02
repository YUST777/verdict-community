"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRuntimeVersion = exports.gLibCErrorMessage = void 0;
const no_react_1 = require("remotion/no-react");
const get_executable_path_1 = require("./compositor/get-executable-path");
const logger_1 = require("./logger");
const getRequiredLibCVersion = () => {
    if (process.platform !== 'linux') {
        return null;
    }
    if ((0, get_executable_path_1.isMusl)({ indent: false, logLevel: 'warn' })) {
        return null;
    }
    // Uses Amazon Linux 2 to compile
    if (process.arch === 'arm64') {
        return [2, 26];
    }
    // Uses Ubuntu 20.04 to compile
    return [2, 31];
};
const required = getRequiredLibCVersion();
const gLibCErrorMessage = (libCString) => {
    if (required === null) {
        return null;
    }
    const split = libCString.split('.');
    if (split.length !== 2) {
        return null;
    }
    if (split[0] === String(required[0]) && Number(split[1]) >= required[1]) {
        return null;
    }
    if (Number(split[0]) > required[0]) {
        return null;
    }
    return `Rendering videos requires glibc ${required.join('.')} on your or higher on your OS. Your system has glibc ${libCString}.`;
};
exports.gLibCErrorMessage = gLibCErrorMessage;
const checkLibCRequirement = (logLevel, indent) => {
    if (process.platform === 'win32' || process.platform === 'darwin') {
        return;
    }
    const { report } = process;
    if (report) {
        const rep = report.getReport();
        if (typeof rep === 'string') {
            logger_1.Log.warn({ logLevel, indent }, 'Bun limitation: process.report.getReport() ' + rep);
            return;
        }
        // @ts-expect-error no types
        const { glibcVersionRuntime } = rep.header;
        if (!glibcVersionRuntime) {
            return;
        }
        const error = (0, exports.gLibCErrorMessage)(glibcVersionRuntime);
        if (error) {
            logger_1.Log.warn({ logLevel, indent }, error);
        }
    }
};
const checkNodeVersion = () => {
    const version = process.version.replace('v', '').split('.');
    const majorVersion = Number(version[0]);
    if (majorVersion < no_react_1.NoReactInternals.MIN_NODE_VERSION) {
        throw new Error(`Remotion requires at least Node ${no_react_1.NoReactInternals.MIN_NODE_VERSION}. You currently have ${process.version}. Update your node version to ${no_react_1.NoReactInternals.MIN_NODE_VERSION} to use Remotion.`);
    }
};
const checkBunVersion = () => {
    if (!Bun.semver.satisfies(Bun.version, `>=${no_react_1.NoReactInternals.MIN_BUN_VERSION}`)) {
        throw new Error(`Remotion requires at least Bun ${no_react_1.NoReactInternals.MIN_BUN_VERSION}. You currently have ${Bun.version}. Update your Bun version to ${no_react_1.NoReactInternals.MIN_BUN_VERSION} to use Remotion.`);
    }
};
const checkRuntimeVersion = (logLevel, indent) => {
    if (typeof Bun === 'undefined') {
        checkNodeVersion();
    }
    else {
        checkBunVersion();
    }
    checkLibCRequirement(logLevel, indent);
};
exports.checkRuntimeVersion = checkRuntimeVersion;
