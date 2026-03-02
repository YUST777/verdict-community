"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universal_1 = require("./universal");
const worker_server_1 = require("./worker-server");
addEventListener('message', (message) => {
    (0, worker_server_1.messageHandler)(message, universal_1.universalReader);
});
