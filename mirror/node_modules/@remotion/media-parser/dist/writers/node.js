"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeWriter = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const log_1 = require("../log");
const createContent = (filename) => {
    return async ({ logLevel }) => {
        let writPromise = Promise.resolve();
        const remove = async () => {
            log_1.Log.verbose(logLevel, 'Removing file', filename);
            await node_fs_1.default.promises.unlink(filename).catch(() => { });
        };
        await remove();
        if (!node_fs_1.default.existsSync(filename)) {
            log_1.Log.verbose(logLevel, 'Creating file', filename);
            node_fs_1.default.writeFileSync(filename, '');
        }
        const writeStream = node_fs_1.default.openSync(filename, 'w');
        let written = 0;
        const write = async (data) => {
            await new Promise((resolve, reject) => {
                node_fs_1.default.write(writeStream, data, 0, data.length, undefined, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    log_1.Log.verbose(logLevel, 'Wrote', data.length, 'bytes to', filename);
                    resolve();
                });
            });
            written += data.byteLength;
        };
        const updateDataAt = (position, data) => {
            return new Promise((resolve, reject) => {
                node_fs_1.default.write(writeStream, data, 0, data.length, position, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    log_1.Log.verbose(logLevel, 'Wrote', data.length, 'bytes to', filename, 'at position', position);
                    resolve();
                });
            });
        };
        const writer = {
            write: (arr) => {
                writPromise = writPromise.then(() => write(arr));
                return writPromise;
            },
            updateDataAt: (position, data) => {
                writPromise = writPromise.then(() => updateDataAt(position, data));
                return writPromise;
            },
            getWrittenByteCount: () => written,
            remove,
            finish: async () => {
                await writPromise;
                try {
                    log_1.Log.verbose(logLevel, 'Closing file', filename);
                    node_fs_1.default.closeSync(writeStream);
                    return Promise.resolve();
                }
                catch (e) {
                    return Promise.reject(e);
                }
            },
            getBlob: async () => {
                const file = await node_fs_1.default.promises.readFile(filename);
                // @ts-expect-error
                return new Blob([file]);
            },
        };
        return writer;
    };
};
const nodeWriter = (path) => {
    return { createContent: createContent(path) };
};
exports.nodeWriter = nodeWriter;
