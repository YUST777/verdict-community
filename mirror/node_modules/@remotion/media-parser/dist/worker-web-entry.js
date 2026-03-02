"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_1 = require("./readers/web");
const worker_server_1 = require("./worker-server");
addEventListener('message', (message) => {
    (0, worker_server_1.messageHandler)(message, web_1.webReader);
});
