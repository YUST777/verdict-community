"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableMemory = void 0;
const node_os_1 = require("node:os");
const logger_1 = require("../logger");
const from_docker_cgroup_1 = require("./from-docker-cgroup");
const from_lambda_env_1 = require("./from-lambda-env");
const from_proc_meminfo_1 = require("./from-proc-meminfo");
const getAvailableMemory = (logLevel) => {
    // If we are in Lambda, the most reliable way is to read the environment variable
    // This is also pretty much free
    const maxMemory = (0, from_lambda_env_1.getMaxLambdaMemory)();
    if (maxMemory !== null) {
        const nodeMemory = (0, node_os_1.freemem)();
        return Math.min(nodeMemory, maxMemory);
    }
    // If cgroup memory data is available, we are in Docker, and we should respect it
    const cgroupMemory = (0, from_docker_cgroup_1.getAvailableMemoryFromCgroup)();
    if (cgroupMemory !== null) {
        // There are 2 Docker memory configurations:
        // 1. --memory=[num]
        // 2. Global Docker memory limit
        // If cgroup limit is higher than global memory, the global memory limit still applies
        const nodeMemory = (0, node_os_1.freemem)();
        const _procInfo = (0, from_proc_meminfo_1.getFreeMemoryFromProcMeminfo)(logLevel);
        if (cgroupMemory > nodeMemory * 1.25 && Number.isFinite(cgroupMemory)) {
            logger_1.Log.warn({ indent: false, logLevel }, 'Detected differing memory amounts:');
            logger_1.Log.warn({ indent: false, logLevel }, `Memory reported by CGroup: ${(cgroupMemory / 1024 / 1024).toFixed(2)} MB`);
            if (_procInfo !== null) {
                logger_1.Log.warn({ indent: false, logLevel }, `Memory reported by /proc/meminfo: ${(_procInfo / 1024 / 1024).toFixed(2)} MB`);
            }
            logger_1.Log.warn({ indent: false, logLevel }, `Memory reported by Node: ${(nodeMemory / 1024 / 1024).toFixed(2)} MB`);
            logger_1.Log.warn({ indent: false, logLevel }, 'You might have inadvertenly set the --memory flag of `docker run` to a value that is higher than the global Docker memory limit.');
            logger_1.Log.warn({ indent: false, logLevel }, 'Using the lower amount of memory for calculation.');
        }
        return Math.min(nodeMemory, cgroupMemory);
    }
    const procInfo = (0, from_proc_meminfo_1.getFreeMemoryFromProcMeminfo)(logLevel);
    if (procInfo !== null) {
        return Math.min((0, node_os_1.freemem)(), procInfo);
    }
    return (0, node_os_1.freemem)();
};
exports.getAvailableMemory = getAvailableMemory;
