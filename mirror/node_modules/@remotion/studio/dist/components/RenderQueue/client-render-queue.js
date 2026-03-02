"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAbortController = exports.deleteAbortController = exports.getAbortController = exports.generateJobId = exports.cleanupCompositionForJob = exports.getCompositionForJob = exports.registerCompositionForJob = void 0;
const compositionRegistry = new Map();
const registerCompositionForJob = (jobId, compositionRef) => {
    compositionRegistry.set(jobId, compositionRef);
};
exports.registerCompositionForJob = registerCompositionForJob;
const getCompositionForJob = (jobId) => {
    return compositionRegistry.get(jobId);
};
exports.getCompositionForJob = getCompositionForJob;
const cleanupCompositionForJob = (jobId) => {
    compositionRegistry.delete(jobId);
};
exports.cleanupCompositionForJob = cleanupCompositionForJob;
const generateJobId = () => {
    return `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
exports.generateJobId = generateJobId;
const clientJobAbortControllers = new Map();
const getAbortController = (jobId) => {
    let controller = clientJobAbortControllers.get(jobId);
    if (!controller) {
        controller = new AbortController();
        clientJobAbortControllers.set(jobId, controller);
    }
    return controller;
};
exports.getAbortController = getAbortController;
const deleteAbortController = (jobId) => {
    clientJobAbortControllers.delete(jobId);
};
exports.deleteAbortController = deleteAbortController;
const cancelAbortController = (jobId) => {
    const controller = clientJobAbortControllers.get(jobId);
    if (controller) {
        controller.abort();
    }
};
exports.cancelAbortController = cancelAbortController;
