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
exports.RenderQueueContextProvider = exports.renderJobsRef = exports.RenderQueueContext = exports.isClientRenderJob = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const client_render_queue_1 = require("./client-render-queue");
const restorePersistedClientRenders = () => {
    var _a;
    const persisted = (_a = window.remotion_initialClientRenders) !== null && _a !== void 0 ? _a : [];
    return persisted.map((r) => ({ ...r, status: 'done' }));
};
const isClientRenderJob = (job) => {
    return job.type === 'client-still' || job.type === 'client-video';
};
exports.isClientRenderJob = isClientRenderJob;
const noopString = () => '';
const noop = () => undefined;
exports.RenderQueueContext = react_1.default.createContext({
    jobs: [],
    serverJobs: [],
    clientJobs: [],
    addClientStillJob: noopString,
    addClientVideoJob: noopString,
    updateClientJobProgress: noop,
    markClientJobSaving: noop,
    markClientJobDone: noop,
    markClientJobFailed: noop,
    markClientJobCancelled: noop,
    removeClientJob: noop,
    cancelClientJob: noop,
    setProcessJobCallback: noop,
    getAbortController: () => new AbortController(),
    getCompositionForJob: () => undefined,
});
exports.renderJobsRef = (0, react_1.createRef)();
const RenderQueueContextProvider = ({ children }) => {
    var _a;
    const [serverJobs, setServerJobs] = (0, react_1.useState)((_a = window.remotion_initialRenderQueue) !== null && _a !== void 0 ? _a : []);
    const [clientJobs, setClientJobs] = (0, react_1.useState)(restorePersistedClientRenders);
    const [currentlyProcessing, setCurrentlyProcessing] = (0, react_1.useState)(null);
    const processJobCallbackRef = (0, react_1.useRef)(null);
    // Process next job when state changes
    (0, react_1.useEffect)(() => {
        if (currentlyProcessing) {
            return;
        }
        const nextJob = clientJobs.find((job) => job.status === 'idle');
        if (!nextJob || !processJobCallbackRef.current) {
            return;
        }
        setCurrentlyProcessing(nextJob.id);
        setClientJobs((prev) => prev.map((job) => job.id === nextJob.id
            ? {
                ...job,
                status: 'running',
                progress: { encodedFrames: 0, totalFrames: 0 },
            }
            : job));
        processJobCallbackRef.current(nextJob);
    }, [clientJobs, currentlyProcessing]);
    const addClientStillJob = (0, react_1.useCallback)((params, compositionRef) => {
        const id = (0, client_render_queue_1.generateJobId)();
        (0, client_render_queue_1.registerCompositionForJob)(id, compositionRef);
        const newJob = {
            ...params,
            id,
            startedAt: Date.now(),
            status: 'idle',
        };
        setClientJobs((prev) => [...prev, newJob]);
        return id;
    }, []);
    const addClientVideoJob = (0, react_1.useCallback)((params, compositionRef) => {
        const id = (0, client_render_queue_1.generateJobId)();
        (0, client_render_queue_1.registerCompositionForJob)(id, compositionRef);
        const newJob = {
            ...params,
            id,
            startedAt: Date.now(),
            status: 'idle',
        };
        setClientJobs((prev) => [...prev, newJob]);
        return id;
    }, []);
    const updateClientJobProgress = (0, react_1.useCallback)((jobId, progress) => {
        setClientJobs((prev) => prev.map((job) => job.id === jobId
            ? { ...job, status: 'running', progress }
            : job));
    }, []);
    const markClientJobSaving = (0, react_1.useCallback)((jobId) => {
        setClientJobs((prev) => prev.map((job) => job.id === jobId
            ? { ...job, status: 'saving' }
            : job));
    }, []);
    const markClientJobDone = (0, react_1.useCallback)((jobId, metadata, getBlob) => {
        (0, client_render_queue_1.deleteAbortController)(jobId);
        (0, client_render_queue_1.cleanupCompositionForJob)(jobId);
        setClientJobs((prev) => prev.map((job) => job.id === jobId ? { ...job, status: 'done', metadata, getBlob } : job));
        setCurrentlyProcessing(null);
    }, []);
    const markClientJobFailed = (0, react_1.useCallback)((jobId, error) => {
        (0, client_render_queue_1.deleteAbortController)(jobId);
        (0, client_render_queue_1.cleanupCompositionForJob)(jobId);
        setClientJobs((prev) => prev.map((job) => job.id === jobId
            ? {
                ...job,
                status: 'failed',
                error: { message: error.message, stack: error.stack },
            }
            : job));
        setCurrentlyProcessing(null);
    }, []);
    const markClientJobCancelled = (0, react_1.useCallback)((jobId) => {
        (0, client_render_queue_1.deleteAbortController)(jobId);
        (0, client_render_queue_1.cleanupCompositionForJob)(jobId);
        setClientJobs((prev) => prev.map((job) => job.id === jobId
            ? {
                ...job,
                status: 'cancelled',
            }
            : job));
        setCurrentlyProcessing(null);
    }, []);
    const removeClientJob = (0, react_1.useCallback)((jobId) => {
        setClientJobs((prev) => {
            const jobToRemove = prev.find((j) => j.id === jobId);
            if ((jobToRemove === null || jobToRemove === void 0 ? void 0 : jobToRemove.status) === 'running') {
                return prev;
            }
            (0, client_render_queue_1.deleteAbortController)(jobId);
            (0, client_render_queue_1.cleanupCompositionForJob)(jobId);
            return prev.filter((job) => job.id !== jobId);
        });
    }, []);
    const cancelClientJob = (0, react_1.useCallback)((jobId) => {
        (0, client_render_queue_1.cancelAbortController)(jobId);
    }, []);
    const setProcessJobCallback = (0, react_1.useCallback)((callback) => {
        processJobCallbackRef.current = callback;
    }, []);
    (0, react_1.useImperativeHandle)(exports.renderJobsRef, () => ({
        updateRenderJobs: (newJobs) => {
            setServerJobs(newJobs);
        },
        updateClientRenders: (renders) => {
            setClientJobs((prev) => {
                const existingIds = new Set(prev.map((j) => j.id));
                const updatedPrev = prev.map((job) => {
                    const updated = renders.find((r) => r.id === job.id);
                    if (updated && job.status === 'done') {
                        return {
                            ...job,
                            deletedOutputLocation: updated.deletedOutputLocation,
                            metadata: updated.metadata,
                        };
                    }
                    return job;
                });
                const newJobs = renders
                    .filter((r) => !existingIds.has(r.id))
                    .map((r) => ({ ...r, status: 'done' }));
                return [...updatedPrev, ...newJobs];
            });
        },
    }), []);
    const value = (0, react_1.useMemo)(() => {
        return {
            jobs: [...serverJobs, ...clientJobs].sort((a, b) => a.startedAt - b.startedAt),
            serverJobs,
            clientJobs,
            addClientStillJob,
            addClientVideoJob,
            updateClientJobProgress,
            markClientJobSaving,
            markClientJobDone,
            markClientJobFailed,
            markClientJobCancelled,
            removeClientJob,
            cancelClientJob,
            setProcessJobCallback,
            getAbortController: client_render_queue_1.getAbortController,
            getCompositionForJob: client_render_queue_1.getCompositionForJob,
        };
    }, [
        serverJobs,
        clientJobs,
        addClientStillJob,
        addClientVideoJob,
        updateClientJobProgress,
        markClientJobSaving,
        markClientJobDone,
        markClientJobFailed,
        markClientJobCancelled,
        removeClientJob,
        cancelClientJob,
        setProcessJobCallback,
    ]);
    return (jsx_runtime_1.jsx(exports.RenderQueueContext.Provider, { value: value, children: children }));
};
exports.RenderQueueContextProvider = RenderQueueContextProvider;
