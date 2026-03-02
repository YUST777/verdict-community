"use strict";
// Kubernetes uses the following command to spawn Docker containers:
// docker run --cpuset-cpus="0,1" to assign only 2 CPUs.
// However, Node.js returns the core count of the host system (up to 96!)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCpuCount = exports.getConcurrencyFromNProc = void 0;
const node_child_process_1 = require("node:child_process");
const node_os_1 = __importDefault(require("node:os"));
let nprocCount;
// We also get it from nproc and use the minimum of the two.
const getConcurrencyFromNProc = () => {
    if (nprocCount !== undefined) {
        return nprocCount;
    }
    try {
        const count = parseInt((0, node_child_process_1.execSync)('nproc', { stdio: 'pipe' }).toString().trim(), 10);
        nprocCount = count;
        return count;
    }
    catch (_a) {
        return null;
    }
};
exports.getConcurrencyFromNProc = getConcurrencyFromNProc;
const getNodeCpuCount = () => {
    // os.availableParallelism() is faster and respects cgroup CPU limits in containers.
    // Available since Node 18.14 / 19.4.
    if (typeof node_os_1.default.availableParallelism === 'function') {
        return node_os_1.default.availableParallelism();
    }
    return node_os_1.default.cpus().length;
};
const getCpuCount = () => {
    const node = getNodeCpuCount();
    const nproc = (0, exports.getConcurrencyFromNProc)();
    if (nproc === null) {
        return node;
    }
    return Math.min(nproc, node);
};
exports.getCpuCount = getCpuCount;
