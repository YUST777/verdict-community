"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableMemoryFromCgroup = void 0;
const node_fs_1 = require("node:fs");
const getMaxMemoryFromCgroupV2 = () => {
    try {
        const data = (0, node_fs_1.readFileSync)('/sys/fs/cgroup/memory.max', 'utf-8');
        // If --memory=[num] flag of "docker run" is not set, the value will be "max"
        if (data.trim() === 'max') {
            return Infinity;
        }
        return parseInt(data, 10);
    }
    catch (_a) {
        return null;
    }
};
const getAvailableMemoryFromCgroupV2 = () => {
    try {
        const data = (0, node_fs_1.readFileSync)('/sys/fs/cgroup/memory.current', 'utf-8');
        return parseInt(data, 10);
    }
    catch (_a) {
        return null;
    }
};
const getMaxMemoryFromCgroupV1 = () => {
    try {
        const data = (0, node_fs_1.readFileSync)('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf-8');
        // If --memory=[num] flag of "docker run" is not set, the value will be "max"
        if (data.trim() === 'max') {
            return Infinity;
        }
        return parseInt(data, 10);
    }
    catch (_a) {
        return null;
    }
};
const getAvailableMemoryFromCgroupV1 = () => {
    try {
        const data = (0, node_fs_1.readFileSync)('/sys/fs/cgroup/memory/memory.usage_in_bytes', 'utf-8');
        return parseInt(data, 10);
    }
    catch (_a) {
        return null;
    }
};
const getAvailableMemoryFromCgroup = () => {
    const maxMemoryV2 = getMaxMemoryFromCgroupV2();
    if (maxMemoryV2 !== null) {
        const availableMemoryV2 = getAvailableMemoryFromCgroupV2();
        if (availableMemoryV2 !== null) {
            return maxMemoryV2 - availableMemoryV2;
        }
    }
    const maxMemoryV1 = getMaxMemoryFromCgroupV1();
    if (maxMemoryV1 !== null) {
        const availableMemoryV1 = getAvailableMemoryFromCgroupV1();
        if (availableMemoryV1 !== null) {
            return maxMemoryV1 - availableMemoryV1;
        }
    }
    return null;
};
exports.getAvailableMemoryFromCgroup = getAvailableMemoryFromCgroup;
